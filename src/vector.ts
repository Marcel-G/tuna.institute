export class Vector {
  x = 0;
  y = 0;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  /**
   *
   * @param {Vector} vec1
   * @param {Vector} vec2
   * @returns {number}
   */
  static dot(vec1, vec2) {
    return vec1.x * vec2.x + vec1.y * vec2.y;
  }

  /**
   * 
   * @param {number} a
   * @param {Vector} vec1
   */
  static crossA (a, vec1) {
    return new Vector(
      -a * vec1.y,
      a * vec1.x
    )
  }

  /**
   * 
   * @param {Vector} vec1 
   * @param {Vector} vec2 
   * @returns {number}
   */
  static crossV (vec1, vec2) {
    return vec1.x * vec2.y - vec1.y * vec2.x;
  }

  /**
   * @param {Vector} vec1 
   * @param {Vector} vec2 
   * @returns {Vector}
   */
  static sub(vec1, vec2) {
    return new Vector(
      vec1.x - vec2.x,
      vec1.y - vec2.y,
    )
  }
  
  /**
   * @param {Vector} vec1 
   * @param {Vector} vec2 
   * @returns {Vector}
   */
  static add(vec1, vec2) {
    return new Vector(
      vec1.x + vec2.x,
      vec1.y + vec2.y,
    )
  }

  /**
   * @param {Vector} vec1 
   * @param {number} val
   * @returns {Vector}
   */
  static scale(vec1, val) {
    return new Vector(
      vec1.x * val,
      vec1.y * val,
    )
  }
  /**
   * @returns {Vector}
   */
  normal() {
    return new Vector(
      -this.y,
      this.x
    )
  }
  /**
   * 
   * @param {number} limit 
   * @returns {Vector}
   */
  clamp(limit) {
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

  /**
   * @param {Vector} normal
   */
  reflect(normal) {
    const len = Vector.dot(this, normal) * 2;
    return new Vector(this.x - normal.x * len, this.y - normal.y * len);
  }
}