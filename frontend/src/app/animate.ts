import { BezierCurve } from './bezier';
import { Vector } from './vector';

export const ANIMATION_FRAMERATE = 30;
export const ANIMATION_PERIOD = 1000 / ANIMATION_FRAMERATE;

export class Interpolator {
    public start() {}
    public stop() {}
    public scale(x: number): number { return x; }
    public interpolate() {}
}

export class LinearInterpolator extends Interpolator {
    protected _time: number;
    protected _tick: number;
    protected _update: (value: number) => void;
    protected _complete: () => void;
    protected _interval: number;
    protected _current: number = 0;

    constructor(time: number, update: (value: number) => void, complete: () => void, tick: number = ANIMATION_PERIOD) {
        super();
        this._time = time;
        this._tick = tick;
        this._update = update;
        this._complete = complete;
    }

    public start() {
        this._interval = window.setInterval(() => { this.interpolate() }, this._tick);
    }
    public stop() {
        window.clearInterval(this._interval);
    }

    public scale(x: number): number {
        return x;
    }

    public interpolate() {
        if (this._current > this._time) {
            this._current = this._time;
            this.stop();
            this._complete();
        }
        let value = this.scale(this._current / this._time);
        this._update(value);
        this._current += this._tick;
    }
}

export class ContinuousInterpolator extends Interpolator {
    protected _tick: number;
    protected _update: () => void;
    protected _interval: number;

    constructor(update: () => void, tick: number = ANIMATION_PERIOD) {
        super();
        this._tick = tick;
        this._update = update;
    }

    public start() {
        this._interval = window.setInterval(() => { this.interpolate() }, this._tick);
    }
    public stop() {
        window.clearInterval(this._interval);
    }

    public interpolate() {
        this._update();
    }
}

// IDEA: calculate lookup table for continuous interpolator
export class ContinuousBezierInterpolator extends Interpolator {
    protected _time: number;
    protected _tick: number;
    protected _curve: BezierCurve;
    protected _update: (point: Vector, t: number) => void;
    protected _loop: (point: Vector, t: number) => void;
    protected _interval: number;
    protected _current: number = 0;
    protected _lookupTable: Vector[];

    get curve(): BezierCurve {
        return this._curve;
    }
    set curve(curve: BezierCurve) {
        this._curve = curve;
    }

    constructor(time: number,
      curve: BezierCurve,
      update: (point: Vector, t: number) => void,
      tick: number = ANIMATION_PERIOD) {
        super();
        this._tick = tick;
        this._time = time;
        this._curve = curve;
        this._update = update;
        this._lookupTable = this._curve.generateLookupTable(this._tick/this._time);
    }

    public start() {
        this._interval = window.setInterval(() => { this.interpolate() }, this._tick);
    }
    public stop() {
        window.clearInterval(this._interval);
    }

    public interpolate() {
        let t = (this._current % this._time) / this._time;
        this._update(this._lookupTable[Math.floor(t * (this._lookupTable.length - 1))], t);
        this._current += this._tick;
    }
}

export class BezierInterpolator extends ContinuousBezierInterpolator {
    protected _complete: (point: Vector) => void;
    constructor(time: number, curve: BezierCurve, update: (point: Vector, t: number) => void, complete: (point: Vector) => void, tick: number = ANIMATION_PERIOD) {
        super(time, curve, update, tick);
        this._complete = complete;
    }

    public start() {
        this._current = 0;
        this._interval = window.setInterval(() => { this.interpolate() }, this._tick);
    }
    public stop() {
        window.clearInterval(this._interval);
    }

    public interpolate() {
        if (this._current >= this._time) {
            this.stop();
            this._complete(this._curve.evaluate(1));
        } else {
            let t = this._current / this._time;
            this._update(this._curve.evaluate(t), t);
            this._current += this._tick;
        }
    }
}