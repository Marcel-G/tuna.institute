export class Vector {
  x = 0;
  y = 0;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  static dot(vec1: Vector, vec2: Vector) {
    return vec1.x * vec2.x + vec1.y * vec2.y;
  }

  static crossA (a: number, vec1: Vector) {
    return new Vector(
      -a * vec1.y,
      a * vec1.x
    )
  }

  static crossV (vec1: Vector, vec2: Vector) {
    return vec1.x * vec2.y - vec1.y * vec2.x;
  }

  static sub(vec1: Vector, vec2: Vector) {
    return new Vector(
      vec1.x - vec2.x,
      vec1.y - vec2.y,
    )
  }
  
  static add(vec1: Vector, vec2: Vector) {
    return new Vector(
      vec1.x + vec2.x,
      vec1.y + vec2.y,
    )
  }

  static scale(vec1: Vector, val: number) {
    return new Vector(
      vec1.x * val,
      vec1.y * val,
    )
  }

  normal() {
    return new Vector(
      -this.y,
      this.x
    )
  }

  clamp(limit: number) {
    return new Vector(
      Math.max(Math.min(this.x, limit), -limit),
      Math.max(Math.min(this.y, limit), -limit)
    )
  }

  normalise() {
    const s = this.length();
    return new Vector(this.x / s, this.y / s);
  }

  length() {
    return Math.sqrt(Vector.dot(this, this));
  }

  reflect(normal: Vector) {
    const len = Vector.dot(this, normal) * 2;
    return new Vector(this.x - normal.x * len, this.y - normal.y * len);
  }
}