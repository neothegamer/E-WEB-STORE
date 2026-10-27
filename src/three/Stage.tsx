import { lazy, Suspense, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '@/types';
import { usePlayer } from '@/store/player';
import { use3DEnabled, useIsDark, useTypingPause, useVisible } from './env';
import type { DragState, SceneProduct } from './scenes';

// three.js loads only when a stage mounts on a device that can run it
const HeroScene = lazy(() => import('./scenes').then((m) => ({ default: m.HeroScene })));
const ProductScene = lazy(() => import('./scenes').then((m) => ({ default: m.ProductScene })));

const accentFor = (dark: boolean) => (dark ? '#C8F135' : '#D9822B');
const toScene = (p: Product): SceneProduct => ({ id: p.id, title: p.title, creator: p.creator, slug: p.slug, type: p.type });

/** Hero scene (home and sign-in pages). Children sit on top of the 3D. */
export function HeroStage({ products, compact, mail, pauseOnTyping, fallback, className, children }: {
  products: Product[]; compact?: boolean; mail?: boolean; pauseOnTyping?: boolean; fallback: ReactNode; className?: string; children?: ReactNode;
}) {
  const enabled = use3DEnabled() && (mail || products.length > 0);
  const dark = useIsDark();
  const navigate = useNavigate();
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const visible = useVisible(el);
  const typing = useTypingPause(!!pauseOnTyping);

  return (
    <div ref={setEl} className={className} style={{ background: 'var(--hero-bg)' }}>
      {enabled ? (
        <Suspense fallback={fallback}>
          <HeroScene products={products.map(toScene)} accent={accentFor(dark)} compact={compact} mail={mail}
            paused={!visible || typing} eventSource={el} onOpen={compact ? undefined : (slug) => navigate(`/product/${slug}`)} />
        </Suspense>
      ) : fallback}
      {children}
    </div>
  );
}

/** Product page stage: a draggable 3D book, or a vinyl that spins while the preview plays. */
export function ProductStage({ product, fallback, className }: { product: Product; fallback: ReactNode; className?: string }) {
  const enabled = use3DEnabled();
  const dark = useIsDark();
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const visible = useVisible(el);
  const playing = usePlayer((s) => s.current?.id === product.id && s.playing);
  const drag = useRef<DragState>({ y: 0, vel: 0, dragging: false });
  const last = useRef(0);

  const down = (e: PointerEvent<HTMLDivElement>) => { drag.current.dragging = true; last.current = e.clientX; e.currentTarget.setPointerCapture(e.pointerId); };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current.dragging) return;
    const dx = (e.clientX - last.current) * 0.012;
    last.current = e.clientX;
    drag.current.y += dx; drag.current.vel = dx;
  };
  const up = () => { drag.current.dragging = false; };

  return (
    <div ref={setEl} className={className} style={{ touchAction: 'pan-y' }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
      {enabled ? (
        <Suspense fallback={fallback}>
          <ProductScene product={toScene(product)} accent={accentFor(dark)} drag={drag} paused={!visible} playing={playing} />
        </Suspense>
      ) : fallback}
      {enabled && (
        <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-[11px] text-muted">
          {product.type === 'music' ? 'Spins while the preview plays. Drag to tilt.' : 'Drag to turn the book'}
        </p>
      )}
    </div>
  );
}
