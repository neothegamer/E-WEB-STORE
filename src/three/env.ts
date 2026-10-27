import { useEffect, useMemo, useState } from 'react';

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/** 3D runs only when the device can handle it. Everything else gets the 2D fallback. */
export function use3DEnabled(): boolean {
  return useMemo(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    if (nav.connection?.saveData) return false;
    if ((nav.deviceMemory ?? 8) < 4) return false;
    return hasWebGL();
  }, []);
}

export function useIsDark(): boolean {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const o = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')));
    o.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => o.disconnect();
  }, []);
  return dark;
}

export function useVisible(el: Element | null): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, [el]);
  return visible;
}

/** True while a text field has focus, so the scene stops animating and the form stays smooth. */
export function useTypingPause(enabled: boolean): boolean {
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const isField = (t: EventTarget | null) => t instanceof HTMLElement && /^(INPUT|TEXTAREA)$/.test(t.tagName);
    const on = (e: FocusEvent) => isField(e.target) && setTyping(true);
    const off = () => setTyping(false);
    document.addEventListener('focusin', on);
    document.addEventListener('focusout', off);
    return () => { document.removeEventListener('focusin', on); document.removeEventListener('focusout', off); };
  }, [enabled]);
  return typing;
}
