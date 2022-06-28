import { Entity } from "./entity";
import { Vector } from "./vector";

/**
 * @typedef {Object} CollisionDetails
 * @property {Vector} position
 * @property {Vector} normal
 * @property {number} penetration
 */

const STATIC_MASS = 1e10
export class Collision {
  /**
   *
   * @param {Entity} entity1
   * @param {Entity} entity2
   * @param {CollisionDetails} details
   */
  constructor(entity1, entity2, details) {
    this.a = entity1;
    this.b = entity2;
    /**
     * Position of collision
     */
    this.p = details.position;
    /**
     * Normal
     */
    this.n = details.normal;
    /**
     * Penetration distance
     */
    this.d = details.penetration;
  }

  /**
   * @param {Entity} entity1
   * @param {Entity} entity2
   * @returns {Collision | false}
   */
  static checkCollision(entity1, entity2) {
    const result = entity1.testWith(entity2);
    if (!result) return false;
    return new Collision(result.a, result.b, {
      position: result.point,
      normal: result.normal,
      penetration: -result.distance,
    });
  }

  /**
   * @param {Collision} collision
   * @returns {void}
   */
  static resolveCollision(collision) {
    const { a: b, b: a } = collision;

    const r1 = Vector.sub(collision.p, a.p);
    const vap1 = Vector.add(a.v, Vector.crossA(a.av, r1));
    const r2 = Vector.sub(collision.p, b.p);
    const vap2 = Vector.add(b.v, Vector.crossA(b.av, r2));

    const relativeVelocity = Vector.sub(vap1, vap2);

    if (Vector.dot(relativeVelocity, collision.n) > 0) {
      return;
    }

    const restitution = 0.5;

    const raxn = Vector.crossV(r1, collision.n);
    const rbxn = Vector.crossV(r2, collision.n);

    const massA = a.m || STATIC_MASS
    const massB = b.m || STATIC_MASS

    const totalMass =
      (1 / massA) + (1 / massB) + ((raxn * raxn) / a.i) + ((rbxn * rbxn) / b.i);
    const j =
      (-(1 + restitution) * Vector.dot(relativeVelocity, collision.n)) /
      totalMass;

    const impact = Vector.scale(collision.n, j);

    a.applyImpact(impact, collision.p);
    b.applyImpact(Vector.scale(impact, -1), collision.p);
  }

  /**
   * @param {Collision} collision
   * @returns {void}
   */
  static correctPosition(collision) {
    const { a, b } = collision;

    if (b.m === 0) {
      a.p = Vector.add(a.p, Vector.scale(collision.n, collision.d * 0.8));
    } else if (a.m === 0) {
      b.p = Vector.add(b.p, Vector.scale(collision.n, collision.d * 0.8));
    } else {
      const f = collision.d / (a.m + b.m);

      a.p = Vector.sub(a.p, Vector.scale(collision.n, f * b.m * 0.8));

      b.p = Vector.add(b.p, Vector.scale(collision.n, f * a.m * 0.8));
    }
  }

  /**
   * @param {Collision} entity
   * @returns {boolean}
   */
  isEqual(entity) {
    return (
      (this.a === entity.a && this.b === entity.b) ||
      (this.b === entity.a && this.a === entity.b)
    );
  }

  /**
   * @param {number} delta
   * @param {CanvasRenderingContext2D} context
   */
  renderDebug(delta, context) {
    context.fillStyle = "blue";
    context.beginPath();
    context.arc(this.p.x, this.p.y, 5, 0, 2 * Math.PI, true);
    context.fill();
    context.beginPath();
    context.moveTo(this.p.x, this.p.y);
    context.lineTo(this.p.x + this.n.x * this.d, this.p.y + this.n.y * this.d);
    context.strokeStyle = "red";
    context.stroke();
  }
}
