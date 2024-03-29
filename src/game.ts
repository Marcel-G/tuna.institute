import { Entity } from './entity';
import { Collision } from './collision';
import { Vector } from './vector';

export class Game {
  context: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  running = false;
  started = false;
  debug = false;
  lastFrame = 0;
  entities: Entity[] = [];
  collisions: Collision[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d")!;
    const scale = window.devicePixelRatio;
    this.context.scale(scale, scale);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastFrame = new Date().getTime();
    if (!this.started) {
      this.loop(0);
      this.started = true;
    }
  }

  spawn(entity: Entity) {
    if (!this.running) return;
    this.entities.push(entity);
  }

  stop() {
    this.running = false;
  }

  private loop(timestamp: number) {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;

    const delta = timestamp - this.lastFrame || 0;

    if (this.running) {
      this.lastFrame = timestamp;

      /**
       * Update out of view timer for offscreen entities.
       */
      for (const entity of this.entities) {
        entity.updateOutOfViewTimer(
          new Vector(this.canvas.width, this.canvas.height),
          delta
        );
      }

      /**
       * Clean up entities that have been offscreen too long.
       */
      this.entities = this.entities.filter(
        (entity) => entity.outOfView < 5000
      )

      /**
       * Update entity game logic
       */
      for (const entity of this.entities) {
        entity.update(delta);
      }

      /**
       * Check collisions between entities
       */
      for (const entity1 of this.entities) {
        for (const entity2 of this.entities) {
          if (entity1 == entity2) { continue }
          const collision = Collision.checkCollision(entity1, entity2);
          if (collision && this.collisions.findIndex((entity) => collision.isEqual(entity)) === -1) {
            this.collisions.push(collision);
          }
        }
      }

      if (this.debug) {
        for (const entity of this.entities) {
          entity.renderDebug(delta, this.context);
        }
    
        for (const collision of this.collisions) {
          collision.renderDebug(delta, this.context);
        }
      }

      /**
       * Update velocity / angularVelocity based on collisions.
       */
      for (const collision of this.collisions) {
        Collision.resolveCollision(collision);
      }

      /**
       * Update position so that entities to render in a clipped state.
       */
      for (const collision of this.collisions) {
        Collision.correctPosition(collision);
      }

      this.collisions = [];
    }

    /**
     * Render entities to canvas
     */
    for (const entity of this.entities) {
      entity.render(delta, this.context);
    }

    requestAnimationFrame(this.loop.bind(this));
  }
}
