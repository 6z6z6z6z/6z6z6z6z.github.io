// Distance/angle constrained spine and outline construction adapted from
// argonautcode/animal-proc-anim (MIT, Copyright (c) 2024 argonaut).
// Chinese-dragon styling, steering, action states, and analytic limbs added here.
export type Point = { x: number; y: number };
type Joint = Point & { angle: number; radius: number };
type Spark = Point & { vx: number; vy: number; life: number; color: string };
const TAU = Math.PI * 2;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const angleDiff = (a: number, b: number) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
const offset = (p: Point, a: number, distance: number): Point => ({ x: p.x + Math.cos(a) * distance, y: p.y + Math.sin(a) * distance });

function smoothPath(ctx: CanvasRenderingContext2D, points: Point[], close = false) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length - 1; i++) {
    ctx.quadraticCurveTo(points[i].x, points[i].y, (points[i].x + points[i + 1].x) / 2, (points[i].y + points[i + 1].y) / 2);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
  if (close) ctx.closePath();
}

export class FestiveDragon {
  readonly joints: Joint[];
  private readonly scale: number;
  private readonly link: number;
  private time = 0;
  private gaitPhase = 0;
  private speed = 65;
  private charge = 0;
  private burst = 0;
  private wasHolding = false;
  private sparks: Spark[] = [];
  private feet: Point[] = [];

  constructor(private width: number, private height: number) {
    this.scale = width < 680 ? 0.72 : 1;
    this.link = 9 * this.scale;
    this.joints = Array.from({ length: 32 }, (_, i) => ({
      x: width * 0.64 - i * this.link,
      y: height * 0.55 + Math.sin(i * 0.24) * 24 * this.scale,
      angle: 0,
      radius: (i < 3 ? 15 : 14 * Math.pow(1 - i / 32, 0.7) + 1.5) * this.scale,
    }));
  }

  celebrate() {
    this.burst = 0.75;
    const head = this.joints[0];
    const nose = offset(head, head.angle, 30 * this.scale);
    for (let i = 0; i < 28; i++) {
      const angle = head.angle + (Math.random() - 0.5) * 1.35;
      const speed = (65 + Math.random() * 125) * this.scale;
      this.sparks.push({ ...nose, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0.7 + Math.random() * 0.5, color: i % 3 ? '#d8a22d' : '#db5345' });
    }
    this.sparks = this.sparks.slice(-160);
  }

  update(dt: number, pointer: Point | null, holding: boolean, reducedMotion: boolean) {
    const active = !reducedMotion || pointer !== null || holding || this.burst > 0;
    if (active) {
      this.time += dt;
      this.gaitPhase += dt * (2.2 + this.speed / 90);
    }
    if (this.wasHolding && !holding) this.celebrate();
    this.wasHolding = holding;
    this.charge += ((holding ? 1 : 0) - this.charge) * Math.min(1, dt * 5);
    this.burst = Math.max(0, this.burst - dt);
    const head = this.joints[0];
    if (!reducedMotion || pointer) {
      const target = pointer ?? {
        x: this.width * (0.5 + Math.sin(this.time * 0.46) * 0.28),
        y: this.height * (0.54 + Math.sin(this.time * 0.79 + 0.9) * 0.2),
      };
      const tx = clamp(target.x, 65 * this.scale, this.width - 65 * this.scale);
      const ty = clamp(target.y, 125, this.height - 70);
      const distance = Math.hypot(tx - head.x, ty - head.y);
      const desired = Math.atan2(ty - head.y, tx - head.x) + Math.sin(this.time * 3.2) * 0.10;
      head.angle += clamp(angleDiff(desired, head.angle), -dt * 2.5, dt * 2.5);
      const desiredSpeed = (holding ? 16 : this.burst > 0 ? 185 : clamp(distance * 1.1, 22, 125)) * this.scale;
      this.speed += (desiredSpeed - this.speed) * Math.min(1, dt * 3);
      head.x += Math.cos(head.angle) * this.speed * dt;
      head.y += Math.sin(head.angle) * this.speed * dt;
      head.x = clamp(head.x, 38 * this.scale, this.width - 38 * this.scale);
      head.y = clamp(head.y, 100, this.height - 45);
      for (let i = 1; i < this.joints.length; i++) {
        const previous = this.joints[i - 1];
        const current = this.joints[i];
        const direction = Math.atan2(previous.y - current.y, previous.x - current.x);
        const wave = Math.sin(this.time * 4.1 - i * 0.35) * 0.015 * (1 + this.charge);
        current.angle = previous.angle + clamp(angleDiff(direction, previous.angle) + wave, -0.28, 0.28);
        current.x = previous.x - Math.cos(current.angle) * this.link;
        current.y = previous.y - Math.sin(current.angle) * this.link;
      }
    }
    this.sparks = this.sparks.filter((spark) => {
      spark.x += spark.vx * dt;
      spark.y += spark.vy * dt;
      spark.vy += 32 * dt;
      spark.life -= dt;
      return spark.life > 0;
    });
  }

  obstacles() {
    return [
      ...this.joints.filter((_, i) => i % 2 === 0).map((joint, i) => ({ x: joint.x, y: joint.y, radius: joint.radius + (i === 0 ? 18 : 5) * this.scale })),
      ...this.feet.map((foot) => ({ ...foot, radius: 8 * this.scale })),
    ];
  }

  draw(ctx: CanvasRenderingContext2D) {
    const s = this.scale;
    const body = this.joints;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    this.feet = [];
    // Analytic two-link limbs: each foot follows a phase-shifted paddling arc.
    for (const [index, side, phase] of [[6, -1, 0], [6, 1, Math.PI], [17, -1, Math.PI], [17, 1, 0]]) {
      const joint = body[index];
      const shoulder = offset(joint, joint.angle + side * Math.PI / 2, joint.radius * 0.65);
      const cycle = this.gaitPhase + phase;
      const foot = offset(offset(shoulder, joint.angle, Math.sin(cycle) * 10 * s - 12 * s), joint.angle + side * Math.PI / 2, (24 + Math.cos(cycle) * 4 - this.charge * 8) * s);
      const distance = Math.hypot(foot.x - shoulder.x, foot.y - shoulder.y);
      const axis = Math.atan2(foot.y - shoulder.y, foot.x - shoulder.x);
      const elbow = offset(shoulder, axis - side * Math.acos(clamp(distance / (40 * s), 0, 1)), 20 * s);
      this.feet.push(foot);
      smoothPath(ctx, [shoulder, elbow, foot]);
      ctx.strokeStyle = '#aa3c31'; ctx.lineWidth = 9 * s; ctx.stroke();
      ctx.strokeStyle = '#e8624e'; ctx.lineWidth = 6 * s; ctx.stroke();
      for (let toe = -1; toe <= 1; toe++) {
        const tip = offset(foot, joint.angle + side * (0.7 + toe * 0.5), 7 * s);
        ctx.beginPath(); ctx.moveTo(foot.x, foot.y); ctx.lineTo(tip.x, tip.y);
        ctx.lineWidth = 3 * s; ctx.strokeStyle = '#efc56c'; ctx.stroke();
      }
    }
    // Continuous tapered outline, rather than a string of circular sprites.
    const left = body.map((p) => offset(p, p.angle + Math.PI / 2, p.radius));
    const right = body.map((p) => offset(p, p.angle - Math.PI / 2, p.radius)).reverse();
    smoothPath(ctx, [...left, ...right, left[0]], true);
    ctx.shadowColor = 'rgba(134,64,31,.13)'; ctx.shadowBlur = 9; ctx.shadowOffsetY = 5;
    ctx.fillStyle = '#e75b49'; ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.strokeStyle = '#b64235'; ctx.lineWidth = 1.8 * s; ctx.stroke();
    const stripe = body.slice(2).map((p) => offset(p, p.angle + Math.PI / 2, p.radius * 0.5));
    smoothPath(ctx, stripe); ctx.strokeStyle = '#ffd58a'; ctx.lineWidth = 4 * s; ctx.stroke();
    for (let i = 4; i < body.length - 2; i += 3) {
      const p = body[i];
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
      ctx.beginPath(); ctx.moveTo(-4 * s, -p.radius + 1); ctx.quadraticCurveTo(-8 * s, -p.radius - 9 * s, 3 * s, -p.radius + 1);
      ctx.fillStyle = '#edb84f'; ctx.fill(); ctx.restore();
    }
    const tail = body[body.length - 1];
    ctx.save(); ctx.translate(tail.x, tail.y); ctx.rotate(tail.angle);
    ctx.fillStyle = '#efb84a'; ctx.beginPath(); ctx.moveTo(3 * s, 0);
    ctx.bezierCurveTo(-8 * s, -2 * s, -13 * s, -11 * s, -19 * s, -7 * s);
    ctx.quadraticCurveTo(-10 * s, 0, -24 * s, 4 * s);
    ctx.quadraticCurveTo(-8 * s, 12 * s, 3 * s, 0); ctx.fill(); ctx.restore();

    const head = body[0];
    ctx.save(); ctx.translate(head.x, head.y); ctx.rotate(head.angle); ctx.scale(s, s);
    // Small branching horns and soft ears make the silhouette recognisably Chinese.
    for (const side of [-1, 1]) {
      ctx.strokeStyle = '#d39b38'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(-9, side * 13); ctx.quadraticCurveTo(-17, side * 22, -26, side * 25); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-18, side * 22); ctx.lineTo(-17, side * 30); ctx.stroke();
      ctx.fillStyle = '#f3be55'; ctx.beginPath(); ctx.ellipse(-13, side * 17, 10, 6, side * 0.6, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = '#ed6a53'; ctx.strokeStyle = '#b64235'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.ellipse(1, 0, 23, 19, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f5bc75'; ctx.beginPath(); ctx.ellipse(21, 0, 13, 12 + this.burst * 3, 0, 0, TAU); ctx.fill();
    const blink = Math.sin(this.time * 1.12) > 0.993;
    for (const side of [-1, 1]) {
      ctx.fillStyle = '#fff9e9'; ctx.beginPath(); ctx.ellipse(6, side * 13, 8, blink ? 1.2 : 7, 0, 0, TAU); ctx.fill();
      if (!blink) {
        ctx.fillStyle = '#533a2b'; ctx.beginPath(); ctx.ellipse(8 + this.charge, side * 13, 3.6, 4.3, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(9, side * 13 - 1.7, 1.4, 0, TAU); ctx.fill();
      }
      ctx.fillStyle = '#b44936'; ctx.beginPath(); ctx.ellipse(27, side * 5, 2, 1.5, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#cc923b'; ctx.lineWidth = 1.6;
      const flutter = Math.sin(this.time * 5 + side) * 4;
      ctx.beginPath(); ctx.moveTo(24, side * 9);
      ctx.bezierCurveTo(34, side * 19, 10 + flutter, side * 37, -3, side * 28 + flutter); ctx.stroke();
    }
    ctx.strokeStyle = '#ad6341'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(29, -3); ctx.quadraticCurveTo(33 + this.burst * 5, 0, 29, 3); ctx.stroke();
    ctx.restore();
    for (const spark of this.sparks) {
      ctx.globalAlpha = Math.min(1, spark.life * 2);
      ctx.fillStyle = spark.color;
      ctx.save(); ctx.translate(spark.x, spark.y); ctx.rotate(spark.life * 3);
      ctx.fillRect(-2 * s, -2 * s, 4 * s, 4 * s); ctx.restore();
    }
    ctx.restore();
  }
}
