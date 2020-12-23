import { Polygon } from './polygon';
import { Vector } from './vector';
// @ts-ignore
import tuna from 'url:../assets/tuna.png';

const gravity = new Vector(0, 0.3);

export class Tuna extends Polygon {
  /**
   * @param {Vector} position 
   */
  constructor(position) {
    super({
      position,
      height: 50,
      width: 80,
      mass: 10,
      elasticity: 1
    });

    this.av = (Math.random() * 2) - 1;
    this.image = new Image();
    this.image.src = tuna;
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

    this.av = this.clamp(this.av, 5);
    this.v = this.v.clamp(5);

    this.a += this.av;
    this.p = Vector.add(this.p, this.v);

    this.updateGeometry();
  }
  render(delta, context) {
    context.save();
    context.translate(this.p.x, this.p.y);
    context.rotate(this.a * Math.PI / 180);
    context.drawImage(
      this.image,
      -this.width,
      -this.height,
      this.width * 2,
      this.height * 2
    );
    context.restore();
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