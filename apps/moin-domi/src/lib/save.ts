import { memeTitle, type Meme } from '@moin/meme';
import { bubbleText, PAINTINGS } from './look.js';

/**
 * "Save image" (spec §5): the user's choice to take a meme out of the private chain. Draws the
 * same layers the screen shows onto a 1080 px canvas and downloads a PNG. Nothing is uploaded.
 */
const SIZE = 1080;

function load(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image'));
    img.src = src;
  });
}

const svgImage = (svg: SVGElement) => load(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`);

function wrap(ctx: CanvasRenderingContext2D, text: string, width: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.toUpperCase().split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > width) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export async function renderPng(el: HTMLElement, meme: Meme): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, SIZE, SIZE);
  const bg = await load(PAINTINGS[meme.where]);
  const scale = Math.max(SIZE / bg.width, SIZE / bg.height);
  const w = bg.width * scale, h = bg.height * scale;
  ctx.drawImage(bg, (SIZE - w) / 2, (SIZE - h) * 0.22, w, h);
  const face = el.querySelector<SVGElement>('.face svg');
  if (face) {
    const img = await svgImage(face);
    const fw = SIZE * 0.64, fh = (fw * 220) / 200;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 24;
    ctx.drawImage(img, (SIZE - fw) / 2, SIZE * 1.02 - fh, fw, fh);
    ctx.restore();
  }
  const gull = el.querySelector<SVGElement>('.gull svg');
  if (gull) {
    const img = await svgImage(gull);
    const gw = SIZE * 0.32;
    ctx.save();
    ctx.translate(SIZE * 0.99, SIZE * 0.97 - gw);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, gw, gw);
    ctx.restore();
  }
  if (meme.bubble !== 'none') {
    ctx.font = `italic 700 ${SIZE * 0.075}px "Cormorant Garamond", Georgia, serif`;
    const text = bubbleText(meme.bubble);
    const tw = ctx.measureText(text).width, px = SIZE * 0.035, bh = SIZE * 0.105;
    const x = SIZE * 0.91 - tw - 2 * px, y = SIZE * 0.3;
    ctx.fillStyle = '#C8102E';
    ctx.beginPath();
    ctx.roundRect(x, y, tw + 2 * px, bh, [SIZE * 0.05, SIZE * 0.05, SIZE * 0.05, SIZE * 0.012]);
    ctx.fill();
    ctx.fillStyle = '#FBF6EA';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + px, y + bh * 0.52);
  }
  const fs = SIZE * 0.088;
  ctx.font = `800 ${fs}px Figtree, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.lineJoin = 'round';
  ctx.lineWidth = fs * 0.32;
  const draw = (lines: string[], top: number) => lines.forEach((line, i) => {
    ctx.strokeStyle = '#000';
    ctx.strokeText(line, SIZE / 2, top + i * fs * 1.02);
    ctx.fillStyle = '#fff';
    ctx.fillText(line, SIZE / 2, top + i * fs * 1.02);
  });
  const width = SIZE * 0.92;
  draw(wrap(ctx, meme.top, width), SIZE * 0.035);
  const bottom = wrap(ctx, meme.bottom, width);
  draw(bottom, SIZE * 0.965 - bottom.length * fs * 1.02);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('png'))), 'image/png'));
}

export async function saveImage(el: HTMLElement, meme: Meme): Promise<void> {
  const blob = await renderPng(el, meme);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${memeTitle(meme).toLowerCase().replace(/[^a-z0-9äöüß]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'moin'}.png`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
