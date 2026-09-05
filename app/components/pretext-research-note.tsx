'use client';

/* oxlint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex -- This application is a keyboard-operable animation surface; arrow keys move the dragon, Enter activates it, and Tab exits normally. */

import { useCallback, useEffect, useRef, useState } from 'react';
import { layoutNextLine, prepareWithSegments, type LayoutCursor } from '@chenglou/pretext';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

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

type Point = { x: number; y: number };
type Size = { width: number; height: number };
type Interval = { left: number; right: number };
type Obstacle = Point & { radius: number };
type Flame = Point & { vx: number; vy: number; life: number; size: number };
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

function transformOffset(
  centre: Point,
  offsetX: number,
  offsetY: number,
  angle: number,
  facing: number,
) {
  const x = offsetX * facing;
  return {
    x: centre.x + x * Math.cos(angle) - offsetY * Math.sin(angle),
    y: centre.y + x * Math.sin(angle) + offsetY * Math.cos(angle),
  };
}

function dragonObstacles(centre: Point, spriteWidth: number, angle: number, facing: number) {
  const blueprint = [
    [-0.43, 0.23, 0.08],
    [-0.32, 0.24, 0.04],
    [-0.23, 0.13, 0.05],
    [-0.16, 0.08, 0.065],
    [-0.04, 0.14, 0.10],
    [0.07, 0.06, 0.08],
    [0.035, -0.06, 0.075],
    [0.06, -0.15, 0.075],
    [0.15, -0.08, 0.07],
    [0.26, 0.06, 0.11],
    [0.35, -0.04, 0.08],
    [0.33, -0.18, 0.115],
  ] as const;

  return blueprint.map(([x, y, radius]) => ({
    ...transformOffset(centre, x * spriteWidth, y * spriteWidth, angle, facing),
    radius: radius * spriteWidth,
  }));
}

export function PretextResearchNote() {
  const stageRef = useRef<HTMLDivElement>(null);
  const lineLayerRef = useRef<HTMLDivElement>(null);
  const dragonRef = useRef<HTMLDivElement>(null);
  const flameCanvasRef = useRef<HTMLCanvasElement>(null);
  const positionRef = useRef<Point>({ x: 0, y: 0 });
  const targetRef = useRef<Point>({ x: 0, y: 0 });
  const angleRef = useRef(0);
  const facingRef = useRef(1);
  const pointerActiveRef = useRef(false);
  const firingRef = useRef(false);
  const burstUntilRef = useRef(0);
  const flamesRef = useRef<Flame[]>([]);
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
    const dragon = dragonRef.current;
    const flameCanvas = flameCanvasRef.current;
    if (!lineLayer || !dragon || !flameCanvas || size.width === 0 || size.height === 0) return;
    const flameContext = flameCanvas.getContext('2d');
    if (!flameContext) return;

    const narrow = size.width < 680;
    const font = narrow
      ? '14px Georgia, "Times New Roman", serif'
      : '16px "Iowan Old Style", "Palatino Linotype", Georgia, serif';
    const preparedLeft = prepareWithSegments(TEXT_LEFT, font);
    const preparedRight = prepareWithSegments(narrow ? `${TEXT_LEFT}\n\n${TEXT_RIGHT}` : TEXT_RIGHT, font);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const spriteWidth = narrow ? Math.min(size.width * 0.82, 360) : Math.min(size.width * 0.51, 530);
    const spriteHeight = spriteWidth / 1.5;
    flameCanvas.width = Math.round(size.width * dpr);
    flameCanvas.height = Math.round(size.height * dpr);
    flameContext.setTransform(dpr, 0, 0, dpr, 0, 0);

    const start = { x: size.width * 0.62, y: size.height * 0.53 };
    targetRef.current = start;
    positionRef.current = start;
    angleRef.current = 0;
    facingRef.current = 1;
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
      const delta = pausedRef.current ? 0 : Math.min(2, Math.max(0.5, (timestamp - previousTime) / 16.67));
      previousTime = timestamp;

      if (!pointerActiveRef.current && !reducedMotion && !pausedRef.current) {
        targetRef.current = {
          x: size.width * (0.51 + Math.sin(timestamp * 0.00024) * 0.25),
          y: size.height * (0.53 + Math.sin(timestamp * 0.00041 + 1.1) * 0.19),
        };
      }

      const position = positionRef.current;
      const safeTarget = {
        x: clamp(targetRef.current.x, spriteWidth * 0.5, size.width - spriteWidth * 0.5),
        y: clamp(targetRef.current.y, spriteHeight * 0.5 + 84, size.height - spriteHeight * 0.5 - 36),
      };
      const dx = safeTarget.x - position.x;
      const dy = safeTarget.y - position.y;
      if (!pausedRef.current && Math.abs(dx) > 10) facingRef.current = dx >= 0 ? 1 : -1;
      position.x += dx * 0.045 * delta;
      position.y += dy * 0.045 * delta;
      const desiredAngle = clamp(Math.atan2(dy, Math.max(80, Math.abs(dx))) * 0.72, -0.24, 0.24);
      angleRef.current += (desiredAngle - angleRef.current) * 0.055 * delta;

      dragon.style.width = `${spriteWidth}px`;
      dragon.style.height = `${spriteHeight}px`;
      dragon.style.transform = `translate3d(${position.x - spriteWidth / 2}px, ${position.y - spriteHeight / 2}px, 0) rotate(${angleRef.current}rad) scaleX(${facingRef.current})`;

      const obstacles = dragonObstacles(position, spriteWidth, angleRef.current, facingRef.current);
      const horizontalPadding = narrow ? 26 : 46;
      const top = narrow ? 98 : 88;
      const bottom = size.height - 42;
      const gap = narrow ? 0 : 54;
      const columnWidth = (size.width - horizontalPadding * 2 - gap) / (narrow ? 1 : 2);
      const lines = narrow
        ? layoutColumn(preparedRight, horizontalPadding, size.width - horizontalPadding, top, bottom, obstacles)
        : [
            ...layoutColumn(
              preparedLeft,
              horizontalPadding,
              horizontalPadding + columnWidth,
              top,
              bottom,
              obstacles,
            ),
            ...layoutColumn(
              preparedRight,
              horizontalPadding + columnWidth + gap,
              size.width - horizontalPadding,
              top,
              bottom,
              obstacles,
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

      const heading = facingRef.current > 0 ? angleRef.current : Math.PI + angleRef.current;
      const head = transformOffset(
        position,
        spriteWidth * 0.45,
        -spriteWidth * 0.16,
        angleRef.current,
        facingRef.current,
      );
      if (!pausedRef.current && (firingRef.current || timestamp < burstUntilRef.current)) {
        for (let index = 0; index < (narrow ? 3 : 6); index += 1) {
          const spread = heading + (Math.random() - 0.5) * 0.42;
          const speed = 6 + Math.random() * 8;
          flamesRef.current.push({
            x: head.x,
            y: head.y,
            vx: Math.cos(spread) * speed,
            vy: Math.sin(spread) * speed,
            life: 1,
            size: 4 + Math.random() * 7,
          });
        }
      }

      flameContext.clearRect(0, 0, size.width, size.height);
      for (let index = flamesRef.current.length - 1; index >= 0; index -= 1) {
        const flame = flamesRef.current[index];
        flame.x += flame.vx * delta;
        flame.y += flame.vy * delta;
        flame.vy += 0.025 * delta;
        flame.life -= 0.018 * delta;
        flame.vx *= 0.99;
        if (flame.life <= 0) {
          flamesRef.current.splice(index, 1);
          continue;
        }
        const radius = flame.size * flame.life * 1.7;
        const gradient = flameContext.createRadialGradient(
          flame.x,
          flame.y,
          0,
          flame.x,
          flame.y,
          radius,
        );
        gradient.addColorStop(0, `rgba(255,245,184,${flame.life.toFixed(2)})`);
        gradient.addColorStop(0.28, `rgba(255,151,38,${(flame.life * 0.95).toFixed(2)})`);
        gradient.addColorStop(1, 'rgba(118,20,0,0)');
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
        className={`dragon-stage${isPaused ? ' is-paused' : ''}`}
        ref={stageRef}
        role="application"
        tabIndex={0}
        aria-label="The Jade Dragon. Move the pointer or use arrow keys to guide it through the text. Press and hold, or press Enter, for a golden breath. Press Tab to leave the interaction."
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
            burstUntilRef.current = performance.now() + 620;
          }
        }}
      >
        <div className="dragon-atmosphere" aria-hidden="true" />
        <div className="dragon-title" aria-hidden="true">
          <h3>The Jade Dragon</h3>
          <p>guide the dragon · hold for a golden breath</p>
        </div>
        <div className="dragon-lines" ref={lineLayerRef} aria-hidden="true" />
        <div className="dragon-sprite" ref={dragonRef} aria-hidden="true">
          <Image src="/assets/retrieval-dragon.png" alt="" width={1536} height={1024} sizes="(max-width: 680px) 82vw, 530px" draggable={false} />
        </div>
        <canvas className="dragon-flames" ref={flameCanvasRef} aria-hidden="true" />
        <p className="dragon-hint" aria-hidden="true">MOVE · HOLD · LET THE CONTEXT RESHAPE THE PAGE</p>
      </div>

      <p className="sr-only">{TEXT_LEFT} {TEXT_RIGHT}</p>
      <div className="dragon-footer">
      <p className="pretext-dragon-caption">
        The moving context changes the available reading path. Text reflow is powered by the MIT-licensed{' '}
        <a href="https://github.com/chenglou/pretext" target="_blank" rel="noreferrer">
          Pretext
        </a>{' '}
        layout engine; the dragon artwork is an original generated asset.
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
