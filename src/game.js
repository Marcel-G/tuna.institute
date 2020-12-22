import { Entity } from './entity';
import { Collision } from './collision';

export class Game {
  canvas = null;
  running = false;
  lastFrame = 0;
  /**
   * @type {Entity[]}
   */
  entities = [];
  /**
   * @type {Collision[]}
   */
  collisions = [];
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    const scale = window.devicePixelRatio;
    this.context.scale(scale, scale);
  }

  start() {
    this.running = true;
    this.lastFrame = new Date().getTime();
    this.loop(0);
  }

  spawn(entity) {
    if (!this.running) return;
    this.entities.push(entity);
  }

  stop() {
    this.running = false;
  }

  /**
   * @private
   * @param {number} timestamp 
   */
  loop(timestamp) {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;

    const delta = timestamp - this.lastFrame || 0;
    this.lastFrame = timestamp;

    for (const entity of this.entities) {
      entity.update(delta);
    }

    for (const entity1 of this.entities) {
      for (const entity2 of this.entities) {
        if (entity1 == entity2) { continue }
        const collision = Collision.checkCollision(entity1, entity2);
        if (collision && this.collisions.findIndex((entity) => collision.isEqual(entity)) === -1) {
          this.collisions.push(collision);
        }
      }
    }
    for (const entity of this.entities) {
      entity.renderDebug(delta, this.context);
    }

    // for (const collision of this.collisions) {
    //   Collision.resolveCollision(collision);
    // }

    for (const collision of this.collisions) {
      Collision.correctPosition(collision);
    }

    for (const entity of this.entities) {
      entity.render(delta, this.context);
    }

    for (const collision of this.collisions) {
      collision.renderDebug(delta, this.context);
    }

    this.collisions = [];

    if (this.running) {
      requestAnimationFrame(this.loop.bind(this));
    }
  }
}