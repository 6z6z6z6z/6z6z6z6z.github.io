'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { layoutNextLine, prepareWithSegments, type LayoutCursor } from '@chenglou/pretext';
import { ArrowUpRight } from 'lucide-react';

// Interaction and visual treatment adapted from the MIT-licensed Dragon demo
// in qtakmalay/PreTextExperiments. See THIRD_PARTY_NOTICES.md.

const TEXT_LEFT = `A useful representation begins with a question: what should count as a good neighbour? Two signals may share the same shape but describe different situations. Two others may look different in scale yet follow the same underlying mechanism.

Retrieval makes those relationships concrete. Instead of asking a model to compress every useful idea into its parameters, we let it search for relevant precedents and inspect the evidence behind each choice.

In my time-series work, one view captures numerical shape: trend, rhythm, scale, and local change. Another view captures factual context: the event, environment, or operating condition that gives a signal its meaning.`;

const TEXT_RIGHT = `The retrieved case is not the answer by itself. It becomes a working memory for the downstream task. For forecasting, the historical case contributes a possible future evolution; several neighbours are combined so that one noisy example does not dominate the result.

This is why I think of representation learning as building a searchable space rather than merely producing a compact embedding. The value of that space is tested by what its neighbours enable a model to do.

The dragon is the moving context in this page. As it crosses the argument, the text reorganises around it: the information has not changed, but the path through it has.`;

const DRAGON_SEGMENTS = 80;
const HEAD_RADIUS = 28;
const TAIL_RADIUS = 4;
const SEGMENT_DISTANCE = 6;
const LINE_HEIGHT = 25;
const MINIMUM_SLOT = 34;

type Point = { x: number; y: number };
type Size = { width: number; height: number };
type Interval = { left: number; right: number };
type Flame = Point & { vx: number; vy: number; life: number; size: number };
type Prepared = ReturnType<typeof prepareWithSegments>;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

function radiusAt(index: number) {
  const strength = 1 - index / DRAGON_SEGMENTS;
  return TAIL_RADIUS + (HEAD_RADIUS - TAIL_RADIUS) * strength * strength;
}

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
  segments: Point[],
) {
  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
  const lines: Array<{ text: string; x: number; y: number }> = [];

  for (let y = top; y < bottom; y += LINE_HEIGHT) {
    const blocked: Interval[] = [];
    for (let index = 0; index < segments.length; index += 1) {
      const point = segments[index];
      const interval = circleInterval(
        point.x,
        point.y,
        radiusAt(index) + 9,
        y,
        y + LINE_HEIGHT,
      );
      if (interval) blocked.push(interval);
    }

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

function dragonSegmentStyle(index: number) {
  const strength = 1 - index / DRAGON_SEGMENTS;
  const radius = radiusAt(index);
  const gold = Math.floor(160 + strength * 95);
  const green = Math.floor(130 + strength * 70);
  const red = Math.floor(60 + strength * 120);
  const alpha = 0.3 + strength * 0.55;
  return {
    width: radius * 2,
    height: radius * 2,
    background: `radial-gradient(circle at 38% 32%, rgba(${red},${gold},${Math.floor(strength * 30)},${alpha}), rgba(${Math.floor(red * 0.3)},${green},${Math.floor(strength * 20)},${alpha * 0.3}) 55%, transparent 72%)`,
    boxShadow:
      index === 0
        ? '0 0 40px 12px rgba(200,170,50,.25), 0 0 80px 25px rgba(34,197,94,.10)'
        : undefined,
  };
}

export function PretextResearchNote() {
  const stageRef = useRef<HTMLDivElement>(null);
  const lineLayerRef = useRef<HTMLDivElement>(null);
  const flameCanvasRef = useRef<HTMLCanvasElement>(null);
  const segmentElementsRef = useRef<Array<HTMLDivElement | null>>([]);
  const eyeElementsRef = useRef<Array<HTMLDivElement | null>>([]);
  const segmentsRef = useRef<Point[]>([]);
  const targetRef = useRef<Point>({ x: 0, y: 0 });
  const pointerActiveRef = useRef(false);
  const firingRef = useRef(false);
  const burstUntilRef = useRef(0);
  const flamesRef = useRef<Flame[]>([]);
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
      x: clamp(clientX - rect.left, 32, rect.width - 32),
      y: clamp(clientY - rect.top, 58, rect.height - 34),
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const lineLayer = lineLayerRef.current;
    const flameCanvas = flameCanvasRef.current;
    if (!stage || !lineLayer || !flameCanvas || size.width === 0 || size.height === 0) return;
    const flameContext = flameCanvas.getContext('2d');
    if (!flameContext) return;

    const narrow = size.width < 680;
    const font = narrow
      ? '14px Georgia, "Times New Roman", serif'
      : '16px "Iowan Old Style", "Palatino Linotype", Georgia, serif';
    const preparedLeft = prepareWithSegments(TEXT_LEFT, font);
    const preparedRight = prepareWithSegments(narrow ? `${TEXT_LEFT}\n\n${TEXT_RIGHT}` : TEXT_RIGHT, font);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    flameCanvas.width = Math.round(size.width * dpr);
    flameCanvas.height = Math.round(size.height * dpr);
    flameContext.setTransform(dpr, 0, 0, dpr, 0, 0);

    const start = { x: size.width * 0.67, y: size.height * 0.49 };
    targetRef.current = start;
    segmentsRef.current = Array.from({ length: DRAGON_SEGMENTS }, (_, index) => ({
      x: start.x - index * SEGMENT_DISTANCE,
      y: start.y,
    }));
    flamesRef.current = [];
    lineLayer.replaceChildren();
    const linePool: HTMLDivElement[] = [];

    const lineElement = (index: number) => {
      while (linePool.length <= index) {
        const element = document.createElement('div');
        element.className = 'dragon-line';
        lineLayer.appendChild(element);
        linePool.push(element);
      }
      return linePool[index];
    };

    let animationFrame = 0;
    let previousTime = performance.now();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = (timestamp: number) => {
      const delta = Math.min(2, Math.max(0.5, (timestamp - previousTime) / 16.67));
      previousTime = timestamp;

      if (!pointerActiveRef.current && !reducedMotion) {
        targetRef.current = {
          x: size.width * (0.52 + Math.sin(timestamp * 0.00028) * 0.3),
          y: size.height * (0.52 + Math.sin(timestamp * 0.00051 + 0.9) * 0.27),
        };
      }

      const segments = segmentsRef.current;
      const head = segments[0];
      head.x += (targetRef.current.x - head.x) * 0.12 * delta;
      head.y += (targetRef.current.y - head.y) * 0.12 * delta;
      for (let index = 1; index < segments.length; index += 1) {
        const previous = segments[index - 1];
        const current = segments[index];
        const dx = previous.x - current.x;
        const dy = previous.y - current.y;
        const gap = Math.hypot(dx, dy) || 1;
        if (gap > SEGMENT_DISTANCE) {
          current.x = previous.x - (dx / gap) * SEGMENT_DISTANCE;
          current.y = previous.y - (dy / gap) * SEGMENT_DISTANCE;
        }
      }

      const time = timestamp * 0.003;
      for (let index = 0; index < segments.length; index += 1) {
        const point = segments[index];
        const strength = 1 - index / DRAGON_SEGMENTS;
        const radius = radiusAt(index);
        const angle =
          index > 0
            ? Math.atan2(
                segments[index].y - segments[index - 1].y,
                segments[index].x - segments[index - 1].x,
              ) + Math.PI / 2
            : 0;
        const wave = Math.sin(time + index * 0.3) * 2.5 * (1 - strength * 0.5);
        const element = segmentElementsRef.current[index];
        if (element) {
          element.style.transform = `translate3d(${point.x + Math.cos(angle) * wave - radius}px, ${point.y + Math.sin(angle) * wave - radius}px, 0)`;
        }
      }

      const neck = segments[1];
      const heading = Math.atan2(head.y - neck.y, head.x - neck.x);
      eyeElementsRef.current.forEach((eye, index) => {
        if (!eye) return;
        const side = index === 0 ? -0.5 : 0.5;
        eye.style.transform = `translate3d(${head.x + Math.cos(heading + side) * 14 - 5}px, ${head.y + Math.sin(heading + side) * 14 - 5}px, 0)`;
      });

      const horizontalPadding = narrow ? 26 : 46;
      const top = narrow ? 94 : 86;
      const bottom = size.height - 42;
      const gap = narrow ? 0 : 54;
      const columnWidth = (size.width - horizontalPadding * 2 - gap) / (narrow ? 1 : 2);
      const lines = narrow
        ? layoutColumn(preparedRight, horizontalPadding, size.width - horizontalPadding, top, bottom, segments)
        : [
            ...layoutColumn(
              preparedLeft,
              horizontalPadding,
              horizontalPadding + columnWidth,
              top,
              bottom,
              segments,
            ),
            ...layoutColumn(
              preparedRight,
              horizontalPadding + columnWidth + gap,
              size.width - horizontalPadding,
              top,
              bottom,
              segments,
            ),
          ];

      lines.forEach((line, index) => {
        const element = lineElement(index);
        element.textContent = line.text;
        element.style.left = `${line.x}px`;
        element.style.top = `${line.y}px`;
        element.style.display = 'block';
      });
      for (let index = lines.length; index < linePool.length; index += 1) {
        linePool[index].style.display = 'none';
      }

      const activelyFiring = firingRef.current || timestamp < burstUntilRef.current;
      if (activelyFiring) {
        for (let index = 0; index < (narrow ? 2 : 4); index += 1) {
          const spread = heading + (Math.random() - 0.5) * 0.7;
          const speed = 5 + Math.random() * 7;
          flamesRef.current.push({
            x: head.x + Math.cos(heading) * 30,
            y: head.y + Math.sin(heading) * 30,
            vx: Math.cos(spread) * speed,
            vy: Math.sin(spread) * speed,
            life: 1,
            size: 3 + Math.random() * 5,
          });
        }
      }

      flameContext.clearRect(0, 0, size.width, size.height);
      for (let index = flamesRef.current.length - 1; index >= 0; index -= 1) {
        const flame = flamesRef.current[index];
        flame.x += flame.vx * delta;
        flame.y += flame.vy * delta;
        flame.vy += 0.05 * delta;
        flame.life -= 0.02 * delta;
        flame.vx *= 0.99;
        if (flame.life <= 0) {
          flamesRef.current.splice(index, 1);
          continue;
        }
        const radius = flame.size * flame.life * 1.5;
        const gradient = flameContext.createRadialGradient(
          flame.x,
          flame.y,
          0,
          flame.x,
          flame.y,
          radius,
        );
        gradient.addColorStop(
          0,
          `rgba(255,${Math.floor(150 + flame.life * 105)},30,${flame.life.toFixed(2)})`,
        );
        gradient.addColorStop(1, 'rgba(200,50,0,0)');
        flameContext.fillStyle = gradient;
        flameContext.beginPath();
        flameContext.arc(flame.x, flame.y, radius, 0, Math.PI * 2);
        flameContext.fill();
      }

      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationFrame);
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
        className="dragon-stage"
        ref={stageRef}
        role="group"
        tabIndex={0}
        aria-label="The Retrieval Dragon. Move the pointer or use arrow keys to guide it through the text. Press and hold, or press Enter, to breathe fire."
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
              x: clamp(targetRef.current.x + offsets[event.key].x, 32, size.width - 32),
              y: clamp(targetRef.current.y + offsets[event.key].y, 58, size.height - 34),
            };
          }
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            burstUntilRef.current = performance.now() + 560;
          }
        }}
      >
        <div className="dragon-atmosphere" aria-hidden="true" />
        <div className="dragon-title" aria-hidden="true">
          <h3>The Retrieval Dragon</h3>
          <p>move to retrieve · press and hold to breathe fire</p>
        </div>
        <div className="dragon-lines" ref={lineLayerRef} aria-hidden="true" />
        {Array.from({ length: DRAGON_SEGMENTS }, (_, index) => (
          <div
            className="dragon-segment"
            key={index}
            ref={(element) => {
              segmentElementsRef.current[index] = element;
            }}
            style={dragonSegmentStyle(index)}
            aria-hidden="true"
          />
        ))}
        {[0, 1].map((index) => (
          <div
            className="dragon-eye"
            key={index}
            ref={(element) => {
              eyeElementsRef.current[index] = element;
            }}
            aria-hidden="true"
          />
        ))}
        <canvas className="dragon-flames" ref={flameCanvasRef} aria-hidden="true" />
        <p className="dragon-hint" aria-hidden="true">MOVE · HOLD · WATCH THE TEXT PART</p>
      </div>

      <p className="sr-only">{TEXT_LEFT} {TEXT_RIGHT}</p>
      <p className="pretext-dragon-caption">
        The moving context physically changes the available reading path. Interaction adapted from the MIT-licensed{' '}
        <a href="https://github.com/qtakmalay/PreTextExperiments" target="_blank" rel="noreferrer">
          Dragon demo by Pretext contributors
        </a>.
      </p>
    </section>
  );
}
