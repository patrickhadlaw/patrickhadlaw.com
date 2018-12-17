import { Vector } from './vector';

export function factorial(n: number): number {
    let result = n;
    for (let i = n - 1; i > 1; i--) {
        result *= i;
    }
    return result;
}

export function binomialCoefficient(n: number, k: number): number {
    if (k === 0) {
        return 1;
    }
    let result = n;
    for (let i = 1; i < k; i++) {
        result *= (n-i) / (i+1);
    }
    return result;
}

export function nthOrderBezierCurve(t: number, controls: number[]) {
    let n = controls.length - 1;
    let result = 0;
    for (let i = 0; i <= n; i++) {
        result += binomialCoefficient(n, i) * Math.pow(1-t, n-i) * Math.pow(t, i) * controls[i];
    }
    return result;
}

export class BezierCurve {
    private _dimension: number;
    private _controls: number[][];

    constructor(...controlPoints: Vector[]) {
        this._dimension = controlPoints[0].data.length;
        this._controls = new Array<number[]>(this._dimension);
        for (let i = 0; i < this._controls.length; i++) {
            this._controls[i] = [];
        }

        for (let vec of controlPoints) {
            if (vec.data.length !== this._dimension) {
                throw 'invalid Bezier Curve: inconsistent vector dimension';
            }
            for (let i = 0; i < this._dimension; i++) {
                this._controls[i].push(vec.data[i]);
            }
        }
    }

    public evaluate(t: number) {
        if (t > 1) {
            return this.evaluate(1);
        } else if (t < 0) {
            return this.evaluate(0);
        }
        let zeros = new Array(this._dimension).fill(0);
        let vec = new Vector(...zeros);
        for (let i = 0; i < this._dimension; i++) {
            vec.data[i] = nthOrderBezierCurve(t, this._controls[i]);
        }
        return vec;
    }

    public endTangent(): Vector {
        if (this._dimension < 2) {
            throw "cannot evaluate tangent of one dimensional Bezier Curve";
        } else {
            let x = this.evaluate(0.99);
            let y = this.evaluate(1);
            let zeros = new Array(this._dimension).fill(0);
            let result = new Vector(...zeros);
            for (let i = 0; i < this._dimension; i++) {
                result.data[i] = y.data[i] - x.data[i];
            }
            return result;
        }
    }

    public generateLookupTable(step: number): Vector[] { // TODO: implement lookup table generator
        return [];
    }
}