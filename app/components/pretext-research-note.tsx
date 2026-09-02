'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { layoutNextLine, prepareWithSegments, type LayoutCursor } from '@chenglou/pretext';
import { ArrowUpRight } from 'lucide-react';

const NOTE =
  'A useful representation should not preserve every detail equally. It should make the right relationships easy to retrieve: a recurring shape, a shared mechanism, a relevant precedent, or a piece of context that changes what the signal means. I am interested in systems that can move between these views, connect information across modalities, and turn retrieved evidence into a concrete prediction or action. The challenge is not simply to store more information. It is to organize information so that the model can find the right neighbor for the question at hand.';

type Point = { x: number; y: number };
type Size = { width: number; height: number };

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

export function PretextResearchNote() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const [point, setPoint] = useState<Point>({ x: 0.72, y: 0.48 });
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const update = () => {
      const rect = stage.getBoundingClientRect();
      setSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.width === 0 || size.height === 0) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size.width * dpr);
    canvas.height = Math.round(size.height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, size.width, size.height);

    const narrow = size.width < 620;
    const padding = narrow ? 22 : 34;
    const startY = narrow ? 92 : 104;
    const fontSize = narrow ? 17 : 21;
    const lineHeight = narrow ? 25 : 31;
    const font = `${fontSize}px Georgia`;
    const prepared = prepareWithSegments(NOTE, font);
    const orbRadius = narrow ? 43 : 55;
    const minimumSlotWidth = narrow ? 120 : 150;
    const orbX = point.x * size.width;
    const orbY = point.y * size.height;
    const obstaclePadding = 15;

    context.fillStyle = '#2a2824';
    context.font = font;
    context.textBaseline = 'alphabetic';

    let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
    let y = startY;

    while (y < size.height - 42) {
      const lineMiddle = y - fontSize * 0.35;
      const verticalDistance = Math.abs(lineMiddle - orbY);
      const slots: Array<{ x: number; width: number }> = [];

      if (verticalDistance < orbRadius + obstaclePadding) {
        const halfChord = Math.sqrt(
          Math.max(0, (orbRadius + obstaclePadding) ** 2 - verticalDistance ** 2),
        );
        const obstacleLeft = orbX - halfChord;
        const obstacleRight = orbX + halfChord;
        const leftWidth = obstacleLeft - padding;
        const rightX = obstacleRight;
        const rightWidth = size.width - padding - rightX;

        if (leftWidth > minimumSlotWidth) slots.push({ x: padding, width: leftWidth });
        if (rightWidth > minimumSlotWidth) slots.push({ x: rightX, width: rightWidth });
      } else {
        slots.push({ x: padding, width: size.width - padding * 2 });
      }

      if (slots.length === 0) {
        y += lineHeight;
        continue;
      }

      for (const slot of slots) {
        const line = layoutNextLine(prepared, cursor, slot.width);
        if (!line) return;
        context.fillText(line.text, slot.x, y);
        cursor = line.end;
      }

      y += lineHeight;
    }
  }, [point, size]);

  const movePoint = useCallback((clientX: number, clientY: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const edgeX = rect.width < 620 ? 0.13 : 0.1;
    const edgeY = rect.width < 620 ? 0.19 : 0.17;
    setPoint({
      x: clamp((clientX - rect.left) / rect.width, edgeX, 1 - edgeX),
      y: clamp((clientY - rect.top) / rect.height, edgeY, 1 - edgeY),
    });
  }, []);

  return (
    <section className="pretext-note" aria-labelledby="pretext-note-title">
      <div className="pretext-note-heading">
        <div>
          <p className="section-label">INTERACTIVE NOTE</p>
          <h2 id="pretext-note-title">Move context. Watch meaning reorganize.</h2>
        </div>
        <a href="https://github.com/chenglou/pretext" target="_blank" rel="noreferrer">
          Built with Pretext <ArrowUpRight size={13} />
        </a>
      </div>

      <div className="pretext-stage" ref={stageRef}>
        <div className="pretext-stage-kicker">A note on representation</div>
        <canvas ref={canvasRef} aria-hidden="true" />
        <button
          className={`context-orb${dragging ? ' is-dragging' : ''}`}
          type="button"
          aria-label="Move the context node to reflow the research note"
          style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging(true);
            movePoint(event.clientX, event.clientY);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              movePoint(event.clientX, event.clientY);
            }
          }}
          onPointerUp={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
            setDragging(false);
          }}
          onPointerCancel={() => setDragging(false)}
          onKeyDown={(event) => {
            const step = event.shiftKey ? 0.08 : 0.025;
            const delta: Record<string, Point> = {
              ArrowLeft: { x: -step, y: 0 },
              ArrowRight: { x: step, y: 0 },
              ArrowUp: { x: 0, y: -step },
              ArrowDown: { x: 0, y: step },
            };
            const direction = delta[event.key];
            if (!direction) return;
            event.preventDefault();
            setPoint((current) => ({
              x: clamp(current.x + direction.x, 0.1, 0.9),
              y: clamp(current.y + direction.y, 0.17, 0.83),
            }));
          }}
        >
          <span>CONTEXT</span>
          <small>drag me</small>
        </button>
        <div className="pretext-stage-index" aria-hidden="true">01 / LIVE LAYOUT</div>
      </div>
      <p className="sr-only">{NOTE}</p>
      <p className="pretext-caption">
        The paragraph is measured and laid out line by line on Canvas. Move the node and Pretext recomputes the available line widths—without reading layout back from the DOM.
      </p>
    </section>
  );
}
