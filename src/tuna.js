import { Polygon } from './polygon';
import { Vector } from './vector';

const gravity = new Vector(0, 0.3);

export class Tuna extends Polygon {
  /**
   * @param {Vector} position 
   */
  constructor(position) {
    super({
      position,
      height: 50,
      width: 100,
      mass: 10,
      elasticity: 1
    });
    this.av = Math.random();
  }
  /**
   * @private
   * @param {number} number 
   * @param {number} limit 
   * @returns {number}
   */
  clamp(number, limit) {
    return Math.max(Math.min(number, limit), -limit);
  }
  update(delta) {
    this.v.x += gravity.x;
    this.v.y += gravity.y;

    this.av = this.clamp(this.av, 5);
    this.v.x = this.clamp(this.v.x, 5);
    this.v.y = this.clamp(this.v.y, 5);

    this.a += this.av;
    this.p.x += this.v.x;
    this.p.y += this.v.y;
    this.updateGeometry();
  }
  render(delta, context) {
    const [first, ...rest] = this.vertices;
    context.beginPath();
    context.moveTo(first.x, first.y);
    for (let vertex of rest) {
      context.lineTo(vertex.x, vertex.y);
    }
    context.closePath();
    context.stroke();
  }
}