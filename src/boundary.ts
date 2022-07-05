import { Polygon } from "./polygon";
import { Vector } from "./vector";

export class Boundary extends Polygon {
  constructor(position: Vector) {
    super({
      position,
      height: 10,
      width: 1e10,
      mass: 0,
      elasticity: 0.1
    });
  }
  updateOutOfViewTimer(pos: Vector, delta: number) {
    this.p = new Vector(pos.x / 2, pos.y + 10);
    this.updateGeometry()
  }
  render() {}
  update() {}

  renderDebug(delta: number, context: CanvasRenderingContext2D) {
    const [first, ...rest] = this.vertices;
    context.beginPath();
    context.moveTo(first.x, first.y);
    for (let vertex of rest) {
      context.lineTo(vertex.x, vertex.y);
    }
    context.closePath();
    context.strokeStyle = 'black';
    context.stroke();
  }
}
