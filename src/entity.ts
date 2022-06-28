import { Vector } from "./vector";

export interface Contact {
  distance: number;
  normal: Vector;
  point: Vector;
  a: Entity;
  b: Entity;
}

export interface Properties {
  position: Vector;
  mass: number;
  elasticity: number;
}

export abstract class Entity {
  /**
   * Position vector
   */
  p = new Vector(0, 0);
  /**
   * Angle
   */
  a = 0;
  /**
   * Velocity vector
   */
  v = new Vector(0, 0);
  /**
   * Angular velocity
   */
  av = 0;
  /**
   * Friction
   */
  f = 0.9;
  /**
   * Elasticity
   */
  e = 0.8;

  /**
   * Mass
   */
  m = 1;

  /**
   * Inertia
   */
  i = 1;

  /**
   * Time spent out of view
   */
  outOfView = 0;

  constructor(properties: Properties) {
    this.p = properties.position;
    this.m = properties.mass;
    this.e = properties.elasticity;
  }

  testWith(entity: Entity): Contact | false {
    return false;
  }

  updateOutOfViewTimer(view: Vector, delta: number) {
    if (
      this.p.x > view.x ||
      this.p.y > view.y ||
      this.p.x < 0 ||
      this.p.y < 0)
    {
      this.outOfView += delta;
    } else {
      this.outOfView = 0;
    }
  }

  abstract applyImpact(impact: Vector, point: Vector): void
  abstract render(delta: number, context: CanvasRenderingContext2D): void 
  abstract renderDebug(delta: number, context: CanvasRenderingContext2D): void
  abstract update(delta: number): void
}