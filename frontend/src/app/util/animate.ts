import { BezierCurve } from './bezier';
import { Vector } from './vector';
import { Subject, timer, Observable, interval } from 'rxjs';
import { map, filter, tap, finalize, takeUntil } from 'rxjs/operators';

export const AnimationFramerate = 60;
export const AnimationPeriod = 1000 / AnimationFramerate;

/**
 * A generic interpolator for custom animations
 */
export abstract class Interpolator<T> {

  private interval$: Observable<unknown>;
  private destroyInterval$ = new Subject();
  private observers = 0;
  private running = false;
  private tick: number;
  private counter = 0;

  constructor(tick: number) {
    this.tick = tick;
  }

  /**
   * Starts the interpolator from the beginning
   */
  public start() {
    this.running = true;
    this.reset();
  }

  /**
   * Stops the interpolator and resets its value
   */
  public stop() {
    this.running = false;
    this.reset();
  }

  /**
   * Pauses the interpolator
   */
  public pause() {
    this.running = false;
  }

  /**
   * Continues the interpolator
   */
  public continue() {
    this.running = true;
  }

  /**
   * Resets the interpolator
   */
  public reset() {
    this.counter = 0;
  }

  /**
   * Whether the interpolator is currently running
   * @returns true if interpolator is running
   */
  public isRunning(): boolean {
    return this.running;
  }

  /**
   * Observes the value of the interpolator
   * @returns the value observable
   */
  public value(): Observable<T> {
    this.observers++;
    if (this.interval$ == null) {
      this.interval$ = interval(this.tick).pipe(takeUntil(this.destroyInterval$));
    }
    return this.interval$.pipe(
      finalize(() => {
        this.observers--;
        if (this.observers === 0) {
          this.destroyInterval$.next();
        }
      }),
      filter(_ => this.running),
      tap(_ => this.counter += this.tick),
      map(_ => this.interpolate(this.counter))
    );
  }

  /**
   * An interpolation function
   * @param time is the accumulated time since start
   * @returns the interpolated value at the given time step
   */
  public abstract interpolate(time: number): T;
}

/**
 * A linear interpolator which implements a linear transition function
 */
export class LinearInterpolator extends Interpolator<number> {

  protected complete$ = new Subject();

  constructor(protected duration: number, tick: number = AnimationPeriod) {
    super(tick);
  }

  /**
   * Observes the completion of the interpolator
   * @returns an observable observing when the interpolator has completed
   */
  public complete(): Observable<unknown> {
    return this.complete$.asObservable();
  }

  /**
   * Linear interpolator implementation
   * @param time the time along the interpolation
   */
  public interpolate(time: number): number {
    if (time > this.duration) {
      this.stop();
      this.complete$.next();
    }
    return time / this.duration;
  }
}

/**
 * A continuously updating linear interpolator
 */
export class ContinuousInterpolator extends Interpolator<number> {

  constructor(tick: number = AnimationPeriod) {
    super(tick);
  }

  /**
   * Continuous interpolator implementation
   * @param time the time along the interpolation
   */
  public interpolate(time: number) {
    return time;
  }
}

export interface BezierInterpolatorValue {
  point: Vector;
  t: number;
}

/**
 * A continuously updating bezier curve interpolator
 */
export class ContinuousBezierInterpolator extends Interpolator<BezierInterpolatorValue> {
  protected loop: (point: Vector, t: number) => void;
  protected lookupTable: Vector[];

  constructor(
    protected duration: number,
    protected curve: BezierCurve,
    tick: number = AnimationPeriod
  ) {
    super(tick);
    this.lookupTable = this.curve.generateLookupTable(tick / this.duration);
  }

  /**
   * Bezier interpolator implementation
   * @param time the time along the interpolation
   */
  public interpolate(time: number): BezierInterpolatorValue {
    const t = (time % this.duration) / this.duration;
    return {
      point: this.lookupTable[Math.floor(t * (this.lookupTable.length - 1))],
      t
    } as BezierInterpolatorValue;
  }
}

/**
 * A bezier curve interpolator implementation
 */
export class BezierInterpolator extends Interpolator<BezierInterpolatorValue> {

  protected complete$ = new Subject<Vector>();

  constructor(
    protected duration: number,
    protected curve: BezierCurve,
    tick: number = AnimationPeriod
  ) {
    super(tick);
  }

  /**
   * Observes the completion of the interpolator
   * @returns an observable observing when the interpolator has completed
   */
  public complete(): Observable<Vector> {
    return this.complete$.asObservable();
  }

  /**
   * Bezier interpolator implementation
   * @param time the time along the interpolation
   */
  public interpolate(time: number): BezierInterpolatorValue {
    const t = Math.min(time, this.duration) / this.duration;
    const value = {
      point: this.curve.evaluate(t),
      t
    } as BezierInterpolatorValue;
    if (time >= this.duration) {
      this.stop();
      this.complete$.next(value.point);
    }
    return value;
  }
}
