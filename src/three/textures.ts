import * as THREE from 'three';
import { coverColors } from '@/components/Cover';

function wrap(g: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const test = line ? `${line} ${word}` : word;
    if (g.measureText(test).width > maxWidth && line) { lines.push(line); line = word; } else line = test;
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

/** Cover artwork drawn in code (same colours as the 2D cover) until the client uploads real images. */
export function makeCoverTexture(p: { id: string; title: string; creator: string }, square = false): THREE.CanvasTexture {
  const w = 256, h = square ? 256 : 384;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d')!;
  const [a, b] = coverColors(p.id);
  const grad = g.createLinearGradient(0, 0, w * 0.6, h);
  grad.addColorStop(0, a); grad.addColorStop(1, b);
  g.fillStyle = grad; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,0.94)';
  g.font = '600 30px Fraunces, serif';
  wrap(g, p.title, w - 40).forEach((l, i) => g.fillText(l, 20, 52 + i * 34));
  g.font = '500 15px Inter, sans-serif';
  g.fillStyle = 'rgba(255,255,255,0.8)';
  g.fillText(p.creator, 20, h - 22);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function makeGroovesTexture(): THREE.CanvasTexture {
  const s = 512;
  const c = document.createElement('canvas');
  c.width = s; c.height = s;
  const g = c.getContext('2d')!;
  g.fillStyle = '#101010'; g.fillRect(0, 0, s, s);
  for (let r = 70; r < 256; r += 3) {
    g.strokeStyle = r % 6 === 0 ? '#1d1d1d' : '#0b0b0b';
    g.beginPath(); g.arc(s / 2, s / 2, r, 0, Math.PI * 2); g.stroke();
  }
  g.fillStyle = 'rgba(255,255,255,0.07)';
  for (const start of [0.2, 3.34]) { g.beginPath(); g.moveTo(s / 2, s / 2); g.arc(s / 2, s / 2, 250, start, start + 0.55); g.fill(); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
