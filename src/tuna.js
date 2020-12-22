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
      width: 50,
      mass: 10,
      elasticity: 1
    });

    this.a = Math.random() * 90;
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
    this.v = Vector.add(this.v, gravity).clamp(5);

    // this.av = this.clamp(this.av, 5);
    // this.v = this.v.clamp(5);

    this.a += this.av;
    this.p = Vector.add(this.p, this.v);

    this.updateGeometry();
  }
  render(delta, context) {
    this.updateGeometry();
    const [first, ...rest] = this.vertices;
    context.beginPath();
    context.moveTo(first.x, first.y);
    for (let vertex of rest) {
      context.lineTo(vertex.x, vertex.y);
    }
    context.closePath();
    context.strokeStyle = 'black';
    context.fillStyle = 'black';
    // context.fill()
    context.stroke();
  }

  renderDebug(delta, context) {
    this.updateGeometry();
    const [first, ...rest] = this.vertices;
    context.beginPath();
    context.moveTo(first.x, first.y);
    for (let vertex of rest) {
      context.lineTo(vertex.x, vertex.y);
    }
    context.closePath();
    context.strokeStyle = 'red';
    context.stroke();
  }
}