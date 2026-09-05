'use client';

/* oxlint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex -- This application is a keyboard-operable animation surface; arrow keys move the dragon, Enter activates it, and Tab exits normally. */

import { useCallback, useEffect, useRef, useState } from 'react';
import { layoutNextLine, prepareWithSegments, type LayoutCursor } from '@chenglou/pretext';
import { ArrowUpRight } from 'lucide-react';
import { FestiveDragon, type Point } from './festive-dragon';

// Text carving and particle rendering retain adaptations from the MIT-licensed
// PreText Experiments demo. See THIRD_PARTY_NOTICES.md.

const TEXT_LEFT = `A useful representation begins with a question: what should count as a good neighbour? Two signals may share the same shape but describe different situations. Two others may look different in scale yet follow the same underlying mechanism.

Retrieval makes those relationships concrete. Instead of asking a model to compress every useful idea into its parameters, we let it search for relevant precedents and inspect the evidence behind each choice.

In my time-series work, one view captures numerical shape: trend, rhythm, scale, and local change. Another view captures factual context: the event, environment, or operating condition that gives a signal its meaning.`;

const TEXT_RIGHT = `The retrieved case is not the answer by itself. It becomes a working memory for the downstream task. For forecasting, the historical case contributes a possible future evolution; several neighbours are combined so that one noisy example does not dominate the result.

This is why I think of representation learning as building a searchable space rather than merely producing a compact embedding. The value of that space is tested by what its neighbours enable a model to do.

The dragon is the moving context in this page. As it crosses the argument, the text reorganises around it: the information has not changed, but the path through it has.`;

const LINE_HEIGHT = 25;
const MINIMUM_SLOT = 34;

type Size = { width: number; height: number };
type Interval = { left: number; right: number };
type Obstacle = Point & { radius: number };
type Prepared = ReturnType<typeof prepareWithSegments>;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

function circleInterval(
  centreX: number,
  centreY: number,
  radius: number,
  bandTop: number,
  bandBottom: number,
): Interval | null {
  if (bandTop >= centreY + radius || bandBottom <= centreY - radius) return null;
  const minimumY =
    centreY >= bandTop && centreY <= bandBottom
      ? 0
      : centreY < bandTop
        ? bandTop - centreY
        : centreY - bandBottom;
  if (minimumY >= radius) return null;
  const halfChord = Math.sqrt(radius * radius - minimumY * minimumY);
  return { left: centreX - halfChord, right: centreX + halfChord };
}

function mergeIntervals(intervals: Interval[]) {
  if (intervals.length <= 1) return intervals;
  intervals.sort((a, b) => a.left - b.left);
  const merged = [{ ...intervals[0] }];
  for (const current of intervals.slice(1)) {
    const previous = merged[merged.length - 1];
    if (current.left <= previous.right) previous.right = Math.max(previous.right, current.right);
    else merged.push({ ...current });
  }
  return merged;
}

function carveSlots(baseLeft: number, baseRight: number, blocked: Interval[]) {
  let slots: Interval[] = [{ left: baseLeft, right: baseRight }];
  for (const obstacle of blocked) {
    const next: Interval[] = [];
    for (const slot of slots) {
      if (obstacle.right <= slot.left || obstacle.left >= slot.right) {
        next.push(slot);
        continue;
      }
      if (obstacle.left > slot.left) next.push({ left: slot.left, right: obstacle.left });
      if (obstacle.right < slot.right) next.push({ left: obstacle.right, right: slot.right });
    }
    slots = next;
  }
  return slots.filter((slot) => slot.right - slot.left >= MINIMUM_SLOT);
}

function layoutColumn(
  prepared: Prepared,
  left: number,
  right: number,
  top: number,
  bottom: number,
  obstacles: Obstacle[],
) {
  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
  const lines: Array<{ text: string; x: number; y: number }> = [];

  for (let y = top; y < bottom; y += LINE_HEIGHT) {
    const blocked = obstacles
      .map((obstacle) =>
        circleInterval(obstacle.x, obstacle.y, obstacle.radius + 8, y, y + LINE_HEIGHT),
      )
      .filter((interval): interval is Interval => interval !== null);
    const slots = carveSlots(left, right, mergeIntervals(blocked));
    if (slots.length === 0) continue;
    let advanced = false;
    for (const slot of slots) {
      const line = layoutNextLine(prepared, cursor, slot.right - slot.left);
      if (!line) return lines;
      lines.push({ text: line.text, x: slot.left, y });
      cursor = line.end;
      advanced = true;
    }
    if (!advanced) break;
  }
  return lines;
}

export function PretextResearchNote() {
  const stageRef = useRef<HTMLDivElement>(null);
  const lineLayerRef = useRef<HTMLDivElement>(null);
  const dragonCanvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<FestiveDragon | null>(null);
  const targetRef = useRef<Point>({ x: 0, y: 0 });
  const pointerActiveRef = useRef(false);
  const firingRef = useRef(false);
  const pausedRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

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

  const setTargetFromPointer = useCallback((clientX: number, clientY: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    targetRef.current = {
      x: clamp(clientX - rect.left, 54, rect.width - 54),
      y: clamp(clientY - rect.top, 108, rect.height - 62),
    };
  }, []);

  useEffect(() => {
    const lineLayer = lineLayerRef.current;
    const canvas = dragonCanvasRef.current;
    const stage = stageRef.current;
    if (!lineLayer || !canvas || !stage || !size.width || !size.height) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const narrow = size.width < 680;
    const font = narrow ? '14px Georgia, "Times New Roman", serif' : '16px "Iowan Old Style", "Palatino Linotype", Georgia, serif';
    const mobileText = 'Good ideas often start with a little curiosity. In my time-series projects, I explored how numerical patterns and their context can help us find useful historical neighbours. A similar shape is a clue; the surrounding situation gives it meaning. Here, a little dragon makes space between the lines. Follow its winding path, or pause for a quiet read.';
    const left = prepareWithSegments(narrow ? mobileText : TEXT_LEFT, font);
    const right = prepareWithSegments(TEXT_RIGHT, font);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size.width * dpr);
    canvas.height = Math.round(size.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const dragon = new FestiveDragon(size.width, size.height);
    modelRef.current = dragon;
    targetRef.current = { x: size.width * 0.64, y: size.height * 0.55 };
    lineLayer.replaceChildren();
    const pool: HTMLDivElement[] = [];
    let frame = 0;
    let previousTime = performance.now();
    let lastLayout = -Infinity;
    let firstPaint = true;
    let inView = true;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const visibility = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; });
    visibility.observe(stage);
    const render = (time: number) => {
      const dt = Math.min(0.033, (time - previousTime) / 1000);
      previousTime = time;
      if ((!pausedRef.current && inView && !document.hidden) || firstPaint) {
        dragon.update(firstPaint ? 0 : dt, pointerActiveRef.current ? targetRef.current : null, firingRef.current, motionPreference.matches);
        ctx.clearRect(0, 0, size.width, size.height);
        dragon.draw(ctx);
        if (time - lastLayout > 32 || firstPaint) {
          const padding = narrow ? 26 : 46;
          const gap = 54;
          const col = (size.width - 2 * padding - gap) / 2;
          const obstacles = dragon.obstacles();
          const lines = narrow
            ? layoutColumn(left, padding, size.width - padding, 108, size.height - 50, obstacles)
            : [
              ...layoutColumn(left, padding, padding + col, 104, size.height - 50, obstacles),
              ...layoutColumn(right, padding + col + gap, size.width - padding, 104, size.height - 50, obstacles),
            ];
          lines.forEach((line, index) => {
            if (!pool[index]) {
              pool[index] = document.createElement('div');
              pool[index].className = 'dragon-line';
              lineLayer.appendChild(pool[index]);
            }
            const el = pool[index];
            if (el.textContent !== line.text) el.textContent = line.text;
            el.style.left = line.x + 'px';
            el.style.top = line.y + 'px';
            el.style.display = 'block';
          });
          for (let i = lines.length; i < pool.length; i++) pool[i].style.display = 'none';
          lastLayout = time;
        }
        firstPaint = false;
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      visibility.disconnect();
      modelRef.current = null;
      lineLayer.replaceChildren();
    };
  }, [size]);

  return (
    <section className="pretext-dragon" aria-labelledby="pretext-dragon-title">
      <div className="pretext-dragon-heading">
        <div>
          <p className="section-label">INTERACTIVE FIELD NOTE</p>
          <h2 id="pretext-dragon-title">A retrieval memory you can move through.</h2>
        </div>
        <a href="https://github.com/chenglou/pretext" target="_blank" rel="noreferrer">
          Built with Pretext <ArrowUpRight size={13} />
        </a>
      </div>

      <div
        className={`dragon-stage${isPaused ? ' is-paused' : ''}`}
        ref={stageRef}
        role="application"
        tabIndex={0}
        aria-label="Little Loong. Move the pointer or use arrow keys to guide the dragon. Hold and release to celebrate, or press Enter. Press Tab to leave."
        onPointerEnter={() => {
          pointerActiveRef.current = true;
        }}
        onPointerLeave={() => {
          pointerActiveRef.current = false;
          firingRef.current = false;
        }}
        onPointerMove={(event) => {
          pointerActiveRef.current = true;
          setTargetFromPointer(event.clientX, event.clientY);
        }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          pointerActiveRef.current = true;
          firingRef.current = true;
          setTargetFromPointer(event.clientX, event.clientY);
        }}
        onPointerUp={(event) => {
          firingRef.current = false;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        }}
        onPointerCancel={() => {
          firingRef.current = false;
          pointerActiveRef.current = false;
        }}
        onBlur={() => {
          firingRef.current = false;
          pointerActiveRef.current = false;
        }}
        onKeyDown={(event) => {
          const step = event.shiftKey ? 44 : 20;
          const offsets: Record<string, Point> = {
            ArrowLeft: { x: -step, y: 0 },
            ArrowRight: { x: step, y: 0 },
            ArrowUp: { x: 0, y: -step },
            ArrowDown: { x: 0, y: step },
          };
          if (offsets[event.key]) {
            event.preventDefault();
            pointerActiveRef.current = true;
            targetRef.current = {
              x: clamp(targetRef.current.x + offsets[event.key].x, 54, size.width - 54),
              y: clamp(targetRef.current.y + offsets[event.key].y, 108, size.height - 62),
            };
          }
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (!pausedRef.current) modelRef.current?.celebrate();
          }
        }}
      >
        <div className="dragon-atmosphere" aria-hidden="true" />
        <div className="dragon-title" aria-hidden="true">
          <h3>Little Loong, a little luck.</h3>
          <p>move to play · hold, then release for a little celebration</p>
        </div>
        <div className="dragon-lines" ref={lineLayerRef} aria-hidden="true" />
        <canvas className="dragon-canvas" ref={dragonCanvasRef} aria-hidden="true" />
        <p className="dragon-hint" aria-hidden="true">A LITTLE CURIOSITY GOES A LONG WAY</p>
      </div>

      <p className="sr-only">{TEXT_LEFT} {TEXT_RIGHT}</p>
      <div className="dragon-footer">
      <p className="pretext-dragon-caption">
        The moving context changes the available reading path. Text reflow is powered by the MIT-licensed{' '}
        <a href="https://github.com/chenglou/pretext" target="_blank" rel="noreferrer">
          Pretext
        </a>{' '}
        layout engine. Movement adapted from{' '}
        <a href="https://github.com/argonautcode/animal-proc-anim" target="_blank" rel="noreferrer">Argonaut’s procedural animation</a>.
      </p>
      <button
        type="button"
        className="dragon-motion-toggle"
        aria-pressed={isPaused}
        onClick={() => {
          pausedRef.current = !pausedRef.current;
          setIsPaused(pausedRef.current);
        }}
      >
        {isPaused ? 'Resume motion' : 'Pause motion'}
      </button>
      </div>
    </section>
  );
}
