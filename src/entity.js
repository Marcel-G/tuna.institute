import { Vector } from "./vector";

/**
 * @typedef {object} Contact
 * @property {number} distance
 * @property {Vector} normal
 * @property {Vector} point
 */

/**
 * @typedef {object} Properties
 * @property {Vector} position
 * @property {number} mass
 * @property {number} elasticity
 */

export class Entity {
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
   * 
   * @param {Properties} properties 
   */
  constructor(properties) {
    this.p = properties.position;
    this.m = properties.mass;
    this.e = properties.elasticity;
  }

  /**
   * @abstract
   * @param {Entity} entity 
   * @returns {Contact | false}
   */
  testWith(entity) {
    return false;
  }

  /**
   * @abstract
   * @param {Vector} impact
   * @param {Vector} point
   * @returns {void}
   */
  applyImpact(impact, point) {

  }
  /**
   * @abstract
   * @param {number} delta 
   * @param {CanvasRenderingContext2D} context
   */
  render(delta, context) {}

  /**
   * @abstract
   * @param {number} delta 
   */
  update(delta) {}
}