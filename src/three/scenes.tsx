// This whole file is code-split: three.js only downloads on pages that show a scene.
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { coverColors } from '@/components/Cover';
import { makeCoverTexture, makeGroovesTexture } from './textures';

export interface SceneProduct { id: string; title: string; creator: string; slug: string; type: 'book' | 'music' }
export interface DragState { y: number; vel: number; dragging: boolean }

function useCoverTexture(p: SceneProduct, square: boolean) {
  const tex = useMemo(() => makeCoverTexture(p, square), [p.id, p.title, p.creator, square]);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

function Lights({ accent }: { accent: string }) {
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} />
      <pointLight position={[2, 1, 3]} intensity={14} color={accent} />
    </>
  );
}

/** A book (box with the cover on the front) or an album sleeve for music. */
function Item({ product, onOpen, ...rest }: { product: SceneProduct; onOpen?: (slug: string) => void } & JSX.IntrinsicElements['group']) {
  const music = product.type === 'music';
  const [w, h, d] = music ? [1.2, 1.2, 0.06] : [1, 1.4, 0.22];
  const tex = useCoverTexture(product, music);
  const edge = coverColors(product.id)[1];
  const pages = music ? edge : '#efe6d6';
  const click = (e: any) => {
    const t = e.nativeEvent?.target as HTMLElement | null;
    if (!onOpen || t?.closest?.('a,button')) return;
    e.stopPropagation();
    onOpen(product.slug);
  };
  return (
    <group {...rest}>
      <mesh onClick={click} onPointerOver={() => onOpen && (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = '')}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial attach="material-0" color={pages} />
        <meshStandardMaterial attach="material-1" color={edge} />
        <meshStandardMaterial attach="material-2" color={pages} />
        <meshStandardMaterial attach="material-3" color={pages} />
        <meshStandardMaterial attach="material-4" map={tex} roughness={0.55} />
        <meshStandardMaterial attach="material-5" color={edge} />
      </mesh>
    </group>
  );
}

function Vinyl({ accent, speed, ...rest }: { accent: string; speed: MutableRefObject<number> } & JSX.IntrinsicElements['group']) {
  const groove = useMemo(() => makeGroovesTexture(), []);
  useEffect(() => () => groove.dispose(), [groove]);
  const spin = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (spin.current) spin.current.rotation.z -= dt * speed.current; });
  return (
    <group {...rest}>
      <group ref={spin}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1, 1, 0.05, 64]} />
          <meshStandardMaterial attach="material-0" color="#0a0a0a" metalness={0.5} roughness={0.4} />
          <meshStandardMaterial attach="material-1" map={groove} metalness={0.5} roughness={0.35} />
          <meshStandardMaterial attach="material-2" color="#0a0a0a" />
        </mesh>
        <mesh position={[0, 0, 0.03]}><circleGeometry args={[0.34, 48]} /><meshStandardMaterial color={accent} /></mesh>
        <mesh position={[0, 0, 0.035]}><circleGeometry args={[0.04, 16]} /><meshBasicMaterial color="#111" /></mesh>
      </group>
    </group>
  );
}

function Envelope({ accent }: { accent: string }) {
  const flap = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.8, 0.55); s.lineTo(0.8, 0.55); s.lineTo(0, -0.05); s.closePath();
    return s;
  }, []);
  return (
    <group rotation={[0.1, -0.25, -0.12]}>
      <mesh><boxGeometry args={[1.6, 1.1, 0.06]} /><meshStandardMaterial color="#f5efe4" /></mesh>
      <mesh position={[0, 0, 0.04]}><shapeGeometry args={[flap]} /><meshStandardMaterial color={accent} /></mesh>
    </group>
  );
}

interface HeroProps {
  products: SceneProduct[];
  accent: string;
  compact?: boolean;
  mail?: boolean;
  paused: boolean;
  onOpen?: (slug: string) => void;
  eventSource?: HTMLElement | null;
}

function HeroContent({ products, accent, compact, mail, onOpen }: HeroProps) {
  const group = useRef<THREE.Group>(null);
  const speed = useRef(0.6);
  const { size } = useThree();
  const wide = size.width > 700;
  const s = compact ? 0.62 : wide ? 1.1 : 0.78;
  const items = products.filter((p) => p.type === 'book').concat(products.filter((p) => p.type === 'music')).slice(0, compact ? 2 : 3);

  // Parallax from pointer/touch, plus a slow turn as the page scrolls
  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    g.rotation.x += (state.pointer.y * -0.18 - g.rotation.x) * 0.06;
    g.rotation.y += (state.pointer.x * 0.35 + window.scrollY * 0.0006 - g.rotation.y) * 0.06;
  });

  const pos: [number, number, number][] = [[-1.5, -0.1, 0], [0, 0.45, -0.3], [1.35, -0.25, 0.3]];
  const rot: [number, number, number][] = [[0.05, 0.4, 0.2], [0, -0.1, -0.08], [0.05, -0.4, 0.15]];
  return (
    <>
      <Lights accent={accent} />
      <group ref={group} position={[wide ? 2.6 : compact ? 1.2 : 1.0, wide ? 0 : compact ? 0.2 : 0.9, 0]} scale={s}>
        {mail ? (
          <Float speed={1.6} floatIntensity={1}><Envelope accent={accent} /></Float>
        ) : (
          <>
            {items.map((p, i) => (
              <Float key={p.id} speed={1.2 + i * 0.3} rotationIntensity={0.25} floatIntensity={0.7}>
                <Item product={p} position={pos[i]} rotation={rot[i]} onOpen={onOpen} />
              </Float>
            ))}
            <Float speed={1.5} floatIntensity={0.6}>
              <Vinyl accent={accent} speed={speed} position={[2.3, 0.9, -0.6]} scale={0.95} rotation={[0.15, -0.3, 0]} />
            </Float>
          </>
        )}
        <mesh rotation={[1.2, 0.25, -0.35]}>
          <torusGeometry args={[2.6, 0.01, 8, 160]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
        </mesh>
      </group>
    </>
  );
}

export function HeroScene(props: HeroProps) {
  return (
    <Canvas
      dpr={[1, props.compact ? 1.5 : 2]}
      camera={{ position: [0, 0, 7], fov: 38 }}
      frameloop={props.paused ? 'never' : 'always'}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      eventSource={props.eventSource ?? undefined}
      eventPrefix="client"
      style={{ position: 'absolute', inset: 0 }}
    >
      <HeroContent {...props} />
    </Canvas>
  );
}

/** Product page: a book you can drag to turn. */
function BookContent({ product, accent, drag }: { product: SceneProduct; accent: string; drag: MutableRefObject<DragState> }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }, dt) => {
    const d = drag.current;
    if (!d.dragging) { d.y += d.vel; d.vel *= 0.92; d.y += dt * 0.35; }
    if (g.current) { g.current.rotation.y = 0.55 + d.y; g.current.rotation.x = -0.08; g.current.position.y = Math.sin(clock.elapsedTime * 1.2) * 0.05; }
  });
  return (
    <>
      <Lights accent={accent} />
      <group ref={g} scale={1.7}><Item product={product} /></group>
    </>
  );
}

/** Product page: a record that spins while the preview plays. Dragging tilts it. */
function VinylContent({ product, accent, drag, playing }: { product: SceneProduct; accent: string; drag: MutableRefObject<DragState>; playing: boolean }) {
  const g = useRef<THREE.Group>(null);
  const speed = useRef(0.25);
  useFrame((_, dt) => {
    const d = drag.current;
    if (!d.dragging) { d.y *= 0.94; d.vel = 0; }
    speed.current += ((playing ? 4 : 0.25) - speed.current) * Math.min(1, dt * 3);
    if (g.current) g.current.rotation.y = Math.max(-0.9, Math.min(0.9, d.y * 0.5));
  });
  return (
    <>
      <Lights accent={accent} />
      <group ref={g} scale={1.35}>
        <Item product={product} position={[-0.55, 0, -0.08]} />
        <Vinyl accent={accent} speed={speed} position={[0.45, 0, 0]} scale={0.95} />
      </group>
    </>
  );
}

export function ProductScene(props: { product: SceneProduct; accent: string; drag: MutableRefObject<DragState>; paused: boolean; playing: boolean }) {
  const music = props.product.type === 'music';
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 4.6], fov: 35 }} frameloop={props.paused ? 'never' : 'always'}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }} style={{ position: 'absolute', inset: 0 }}>
      {music ? <VinylContent {...props} /> : <BookContent {...props} />}
    </Canvas>
  );
}
