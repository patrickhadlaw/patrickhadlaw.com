import { BezierCurve } from './bezier';
import { Vector } from './vector';

export const AnimationFramerate = 30;
export const AnimationPeriod = 1000 / AnimationFramerate;

export class Interpolator {
  public start() { }
  public stop() { }
  public scale(x: number): number { return x; }
  public interpolate() { }
}

export class LinearInterpolator extends Interpolator {

  protected time: number;
  protected update: (value: number) => void;
  protected complete: () => void;
  protected tick: number;
  protected interval: number;
  protected current = 0;

  constructor(
    time: number,
    update: (value: number) => void,
    complete: () => void,
    tick: number = AnimationFramerate
  ) {
    super();
    this.time = time;
    this.update = update;
    this.complete = complete;
    this.tick = tick;
  }

  public start() {
    this.interval = window.setInterval(() => this.interpolate(), this.tick);
  }
  public stop() {
    window.clearInterval(this.interval);
  }

  public scale(x: number): number {
    return x;
  }

  public interpolate() {
    if (this.current > this.time) {
      this.current = this.time;
      this.stop();
      this.complete();
    }
    const value = this.scale(this.current / this.time);
    this.update(value);
    this.current += this.tick;
  }
}

export class ContinuousInterpolator extends Interpolator {
  protected tick: number;
  protected update: () => void;
  protected interval: number;

  constructor(update: () => void, tick: number = AnimationPeriod) {
    super();
    this.tick = tick;
    this.update = update;
  }

  public start() {
    this.interval = window.setInterval(() => this.interpolate(), this.tick);
  }
  public stop() {
    window.clearInterval(this.interval);
  }

  public interpolate() {
    this.update();
  }
}

// IDEA: calculate lookup table for continuous interpolator
export class ContinuousBezierInterpolator extends Interpolator {
  protected time: number;
  protected tick: number;
  protected update: (point: Vector, t: number) => void;
  protected loop: (point: Vector, t: number) => void;
  protected interval: number;
  protected current = 0;
  protected lookupTable: Vector[];
  protected holding = false;

  protected _curve: BezierCurve;

  get curve(): BezierCurve {
    return this._curve;
  }
  set curve(curve: BezierCurve) {
    this._curve = curve;
  }

  constructor(
    time: number,
    curve: BezierCurve,
    update: (point: Vector, t: number) => void,
    tick: number = AnimationPeriod
  ) {
    super();
    this.tick = tick;
    this.time = time;
    this.curve = curve;
    this.update = update;
    this.lookupTable = this.curve.generateLookupTable(this.tick / this.time);
  }

  public start() {
    this.interval = window.setInterval(() => this.interpolate(), this.tick);
  }
  public stop() {
    window.clearInterval(this.interval);
  }

  public hold() {
    this.holding = true;
  }
  public continue() {
    this.holding = false;
  }

  public interpolate() {
    const t = (this.current % this.time) / this.time;
    this.update(this.lookupTable[Math.floor(t * (this.lookupTable.length - 1))], t);
    if (!this.holding) {
      this.current += this.tick;
    }
  }
}

export class BezierInterpolator extends ContinuousBezierInterpolator {

  protected complete: (point: Vector) => void;

  constructor(
    time: number,
    curve: BezierCurve,
    update: (point: Vector, t: number) => void,
    complete: (point: Vector) => void,
    tick: number = AnimationPeriod
  ) {
    super(time, curve, update, tick);
    this.complete = complete;
  }

  public start() {
    this.current = 0;
    this.interval = window.setInterval(() => this.interpolate(), this.tick);
  }
  public stop() {
    window.clearInterval(this.interval);
  }

  public interpolate() {
    if (this.current >= this.time) {
      this.stop();
      this.complete(this.curve.evaluate(1));
    } else {
      const t = this.current / this.time;
      this.update(this.curve.evaluate(t), t);
      this.current += this.tick;
    }
  }
}
