import { Polygon } from "./polygon";
import { Vector } from "./vector";

export class Boundary extends Polygon {
  /**
   * @param {Vector} position 
   */
  constructor(position) {
    super({
      position,
      height: 10,
      width: 500,
      mass: 0,
      elasticity: 0.1
    });
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