import type { DayAlmanac } from './domain/types';

const W = 1080;
const H = 1440;
const PAD = 72;
const PAPER = '#faf9f5';
const INK = '#1a1a1a';
const GREEN = '#009640';
const GREEN_DEEP = '#00742f';
const RED = '#c0281c';
const MUTED = '#6b665d';

const SERIF = '"Noto Serif SC", "Songti SC", SimSun, serif';
const SANS = '"Noto Sans SC", "Microsoft YaHei", sans-serif';
const BRUSH = '"Ma Shan Zheng", KaiTi, STKaiti, serif';
const DISPLAY = '"Abril Fatface", "Playfair Display", serif';
const LATIN = '"Libre Caslon Text", "Times New Roman", serif';

export const SHARE_POSTER_WIDTH = W;
export const SHARE_POSTER_HEIGHT = H;

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';

  for (const char of text) {
    const next = line + char;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line);
      line = char;
    } else {
      line = next;
    }
  }

  if (line) {
    lines.push(line);
  }

  return lines;
}

function layoutWords(
  ctx: CanvasRenderingContext2D,
  words: string[],
  maxWidth: number,
  gap: number,
): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let width = 0;

  for (const word of words) {
    const wordWidth = ctx.measureText(word).width;
    const nextWidth = width + (row.length ? gap : 0) + wordWidth;

    if (row.length && nextWidth > maxWidth) {
      rows.push(row);
      row = [word];
      width = wordWidth;
    } else {
      row.push(word);
      width = nextWidth;
    }
  }

  if (row.length) {
    rows.push(row);
  }

  if (rows.length < 2) {
    return rows;
  }

  const flat = rows.flat();
  const base = Math.floor(flat.length / rows.length);
  const extra = flat.length % rows.length;
  let index = 0;

  return rows.map((_, rowIndex) => {
    const size = base + (rowIndex < extra ? 1 : 0);
    const next = flat.slice(index, index + size);
    index += size;
    return next;
  });
}

async function loadFonts(almanac: DayAlmanac): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) {
    return;
  }

  const sample = [
    almanac.dateKey,
    almanac.weekdayZh,
    'AI 老黄历',
    almanac.lunar.text,
    almanac.deity.name,
    almanac.element.name,
    almanac.element.suffix,
    almanac.yi.headline,
    almanac.ji.headline,
    ...almanac.yi.items,
    ...almanac.ji.items,
    ...almanac.fortunes.flatMap((fortune) => [fortune.label, fortune.note]),
    almanac.aphorism,
    '宜忌黄历今日运势今日吉语主推避用',
  ].join('');

  await Promise.all([
    document.fonts.load(`900 60px ${SERIF}`, sample),
    document.fonts.load(`400 32px ${SERIF}`, sample),
    document.fonts.load(`700 30px ${SERIF}`, sample),
    document.fonts.load(`400 21px ${SANS}`, sample),
    document.fonts.load(`500 25px ${SANS}`, sample),
    document.fonts.load(`700 22px ${SANS}`, sample),
    document.fonts.load(`400 48px ${BRUSH}`, '宜忌黄历'),
    document.fonts.load(`400 88px ${DISPLAY}`, 'AI 2026.11.02'),
  ]);
  await document.fonts.ready;
}

function drawSeal(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((-4 * Math.PI) / 180);
  ctx.fillStyle = RED;
  ctx.fillRect(-size / 2, -size / 2, size, size);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.68)';
  ctx.lineWidth = 4;
  ctx.strokeRect(-size / 2 + 7, -size / 2 + 7, size - 14, size - 14);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `400 44px ${BRUSH}`;
  ctx.fillText('黄', 0, -18);
  ctx.fillText('历', 0, 34);
  ctx.restore();
}

function drawYiJi(
  ctx: CanvasRenderingContext2D,
  char: string,
  tagColor: string,
  wordColor: string,
  headline: string,
  items: string[],
  top: number,
): number {
  ctx.fillStyle = tagColor;
  ctx.fillRect(PAD, top, 76, 76);

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `400 48px ${BRUSH}`;
  ctx.fillText(char, PAD + 38, top + 42);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = MUTED;
  ctx.font = `500 25px ${SANS}`;
  ctx.fillText(headline, PAD + 104, top + 30);

  ctx.fillStyle = wordColor;
  ctx.font = `900 60px ${SERIF}`;
  const rows = layoutWords(ctx, items, W - PAD * 2 - 104, 38);

  rows.forEach((row, rowIndex) => {
    let x = PAD + 104;
    for (const word of row) {
      ctx.fillText(word, x, top + 104 + rowIndex * 82);
      x += ctx.measureText(word).width + 38;
    }
  });

  return rows.length;
}

function drawPoster(ctx: CanvasRenderingContext2D, almanac: DayAlmanac) {
  const accent = almanac.theme === 'red' ? RED : GREEN_DEEP;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(26, 26, 26, 0.035)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 72) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, H);
    ctx.stroke();
  }

  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, W, 18);

  ctx.strokeStyle = 'rgba(26, 26, 26, 0.14)';
  ctx.strokeRect(26.5, 26.5, W - 53, H - 53);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = INK;
  ctx.font = `700 30px ${SERIF}`;
  ctx.fillText('AI 老黄历', PAD, 96);

  const brandWidth = ctx.measureText('AI 老黄历').width;
  ctx.fillStyle = '#8a8478';
  ctx.font = `400 15px ${LATIN}`;
  ctx.fillText('AI ALMANAC', PAD + brandWidth + 18, 94);

  ctx.fillStyle = accent;
  ctx.font = `400 21px ${SANS}`;
  ctx.textAlign = 'right';
  ctx.fillText('每日 AI 宜忌', W - PAD, 94);
  ctx.textAlign = 'left';

  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PAD, 122);
  ctx.lineTo(W - PAD, 122);
  ctx.stroke();

  const dateText = almanac.dateKey.replaceAll('-', '.');
  ctx.fillStyle = accent;
  ctx.font = `400 88px ${DISPLAY}`;
  ctx.fillText(dateText, PAD - 2, 254);

  const dateWidth = ctx.measureText(dateText).width;
  ctx.fillStyle = INK;
  ctx.font = `700 28px ${SANS}`;
  ctx.fillText(almanac.weekdayZh, PAD + dateWidth + 22, 252);

  ctx.fillStyle = '#4a463f';
  ctx.font = `400 32px ${SERIF}`;
  ctx.fillText(almanac.lunar.text.replaceAll('\u3000', ' · '), PAD, 310);

  ctx.fillStyle = MUTED;
  ctx.font = `400 21px ${SANS}`;
  ctx.fillText(
    `值神 ${almanac.deity.name} · 五行 ${almanac.element.name}${almanac.element.suffix}`,
    PAD,
    352,
  );

  drawSeal(ctx, 936, 210, 118);

  ctx.strokeStyle = 'rgba(26, 26, 26, 0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, 384);
  ctx.lineTo(W - PAD, 384);
  ctx.stroke();

  const yiRows = drawYiJi(ctx, '宜', GREEN, GREEN_DEEP, almanac.yi.headline, almanac.yi.items, 414);
  const jiTop = Math.min(586 + (yiRows - 1) * 82, 636);
  drawYiJi(ctx, '忌', RED, RED, almanac.ji.headline, almanac.ji.items, jiTop);

  ctx.strokeStyle = 'rgba(26, 26, 26, 0.18)';
  ctx.beginPath();
  ctx.moveTo(PAD, 866);
  ctx.lineTo(W - PAD, 866);
  ctx.stroke();

  ctx.fillStyle = INK;
  ctx.font = `700 26px ${SERIF}`;
  ctx.fillText('今日运势', PAD, 906);
  ctx.fillStyle = MUTED;
  ctx.font = `400 18px ${SANS}`;
  ctx.textAlign = 'right';
  ctx.fillText('五星制', W - PAD, 904);
  ctx.textAlign = 'left';

  const cardWidth = (W - PAD * 2 - 24) / 2;
  almanac.fortunes.forEach((fortune, index) => {
    const x = PAD + (index % 2) * (cardWidth + 24);
    const y = 926 + Math.floor(index / 2) * 140;
    ctx.strokeStyle = 'rgba(26, 26, 26, 0.16)';
    ctx.strokeRect(x + 0.5, y + 0.5, cardWidth, 120);

    ctx.fillStyle = INK;
    ctx.font = `700 22px ${SANS}`;
    ctx.fillText(fortune.label, x + 20, y + 34);

    ctx.fillStyle = accent;
    ctx.font = `400 22px ${SANS}`;
    ctx.fillText(`${'★'.repeat(fortune.stars)}${'☆'.repeat(5 - fortune.stars)}`, x + 20, y + 70);

    ctx.fillStyle = MUTED;
    ctx.font = `400 18px ${SANS}`;
    ctx.fillText(fortune.note, x + 20, y + 100);
  });

  ctx.strokeStyle = 'rgba(26, 26, 26, 0.18)';
  ctx.beginPath();
  ctx.moveTo(PAD, 1214);
  ctx.lineTo(W - PAD, 1214);
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.font = `700 20px ${SANS}`;
  ctx.fillText('今日吉语', PAD, 1252);

  ctx.fillStyle = INK;
  ctx.font = `400 28px ${SERIF}`;
  wrapLines(ctx, `「${almanac.aphorism}」`, W - PAD * 2).forEach((line, index) => {
    ctx.fillText(line, PAD, 1296 + index * 40);
  });

  ctx.strokeStyle = 'rgba(26, 26, 26, 0.16)';
  ctx.beginPath();
  ctx.moveTo(PAD, 1366);
  ctx.lineTo(W - PAD, 1366);
  ctx.stroke();

  ctx.fillStyle = MUTED;
  ctx.font = `400 20px ${LATIN}`;
  ctx.fillText('huangli.199107.xyz', PAD, 1398);

  ctx.font = `400 17px ${SANS}`;
  ctx.textAlign = 'right';
  ctx.fillText('仅供娱乐，非评测结论', W - PAD, 1398);
  ctx.textAlign = 'left';
}

export async function createSharePoster(almanac: DayAlmanac): Promise<Blob> {
  await loadFonts(almanac);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('当前浏览器不支持 Canvas');
  }

  drawPoster(ctx, almanac);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png');
  });
  if (!blob) {
    throw new Error('分享图生成失败');
  }

  return blob;
}
