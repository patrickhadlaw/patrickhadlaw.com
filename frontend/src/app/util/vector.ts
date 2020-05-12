export class Vector {
  data: number[];

  constructor(...numbers: number[]) {
    this.data = [];
    for (let i = 0; i < numbers.length; i++) {
      this.data.push(numbers[i] as number);
    }
  }

  get x(): number {
    return this.data[0];
  }
  set x(value: number) {
    this.data[0] = value;
  }

  get y(): number {
    return this.data[1];
  }
  set y(value: number) {
    this.data[1] = value;
  }

  get z(): number {
    return this.data[2];
  }
  set z(value: number) {
    this.data[2] = value;
  }

  get w(): number {
    return this.data[3];
  }
  set w(value: number) {
    this.data[3] = value;
  }

  multiply(other) {
    if (typeof other === 'number') {
      const result = [];
      for (let i = 0; i < this.data.length; i++) {
        result.push(this.data[i] * other);
      }
      return new Vector(...result);
    } else if (other instanceof Matrix) {
      if (other.data.length === this.data.length) {

      } else {
        throw new Error('Invalid matrix multiplication: invalid dimensions');
      }
    }
  }

  divide(denominator) {
    const result = [];
    for (let i = 0; i < this.data.length; i++) {
      result.push(this.data[i] / denominator);
    }
    return new Vector(...result);
  }

  add(other: Vector): Vector {
    if (other.data.length === this.data.length) {
      const result = [];
      for (let i = 0; i < this.data.length; i++) {
        result.push(this.data[i] + other.data[i]);
      }
      return new Vector(...result);
    } else {
      throw new Error('Invalid vector addition: invalid dimensions');
    }
  }

  subtract(other: Vector): Vector {
    if (other.data.length === this.data.length) {
      let result = [];
      for (let i = 0; i < this.data.length; i++) {
        result.push(this.data[i] - other.data[i]);
      }
      return new Vector(...result);
    } else {
      throw new Error('Invalid vector addition: invalid dimensions');
    }
  }

  negate(): Vector {
    const result = [];
    for (let i = 0; i < this.data.length; i++) {
      result.push(-this.data[i]);
    }
    return new Vector(...result);
  }

  dot(other: Vector) {
    if (other.data.length !== this.data.length) {
      throw new Error('Invalid vector dot product: invalid dimension');
    }
    let result = 0.0;
    for (let i = 0; i < this.data.length; i++) {
      result += this.data[i] * other.data[i];
    }
    return result;
  }

  cross(other) {
    if (this.data.length === other.data.length) {
      if (this.data.length === 3) {
        // TODO: implement cross product
      } else {
        throw new Error('Failed to calculate cross product');
      }
    }
  }

  norm() {
    let result = 0.0;
    for (let i = 0; i < this.data.length; i++) {
      result += this.data[i] * this.data[i];
    }
    return Math.sqrt(result);
  }

  unit() {
    const norm = this.norm();
    if (norm === 0.0) {
      return new Vector(...(new Array(this.data.length).fill(0.0)));
    } else {
      return this.divide(norm);
    }
  }
}

export class Matrix {
  data: number[][]; // m x n matrix where m is data.length
  n: number;

  constructor(...numbers: number[][]) {
    this.data = [];
    this.n = numbers[0].length;
    for (let i = 0; i < numbers.length; i++) {
      if (numbers[i].length !== this.n) {
        throw new Error('Invalid matrix, inconsistent dimensions');
      }
      this.data.push(arguments[i] as number[]);
    }
  }

  multiply(other) {
    if (other instanceof Vector) {
      if (other.data.length === this.n) {
        const result: number[] = [];
        for (let i = 0; i < this.data.length; i++) {
          let value = 0.0;
          for (let j = 0; j < this.n; j++) {
            value += this.data[i][j] * other.data[j];
          }
          result.push(value);
        }
        return new Vector(...result);
      } else {
        throw new Error('Invalid matrix multiplicaton: invalid dimensions');
      }
    } else if (other instanceof Matrix) {

    } else {
      throw new Error('Invalid matrix multiplication: invalid type');
    }
    return null;
  }
}

export function rotationMatrix(theta): Matrix {
  return new Matrix(
    [Math.cos(theta), -Math.sin(theta)],
    [Math.sin(theta), Math.cos(theta)]
  );
}

export function rotatePoint(point, theta) {
  const rx = rotationMatrix(theta);
  return rx.multiply(point);
}
