import Canvas from 'canvas';

const SCALE_FACTOR = 2;

export interface ScaledCanvas {
  canvas: Canvas.Canvas;
  ctx: Canvas.CanvasRenderingContext2D;
  width: number;
  height: number;
}

/**
 * Creates a scaled canvas configuration.
 */
export function getScaledCanvas(width: number, height: number, factor = SCALE_FACTOR): ScaledCanvas {
  const scaledWidth = width * factor;
  const scaledHeight = height * factor;

  const canvas = Canvas.createCanvas(scaledWidth, scaledHeight);
  const ctx = canvas.getContext('2d');

  ctx.scale(factor, factor);

  return { canvas, ctx, width: scaledWidth, height: scaledHeight };
}

export function keyValue(key: string, value: string | number) {
  return `**${key}:** ${value}`;
}

export function bold(str: string | number) {
  return `**${str}**`;
}
