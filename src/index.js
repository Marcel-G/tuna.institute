// @ts-check
import "modern-css-reset";
import "./styles.css";

class Vector {
  x = 0;
  y = 0;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Entity {
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
  constructor(position) {
    this.p = position;
    this.vertices = [position];
  }
  update(delta, context, entities) {}
  render(delta, context) {}
}

class Polygon extends Entity {
  height = 10;
  width = 10;
  /**
   *
   * @param {Vector} position
   * @param {number} width
   * @param {number} height
   */
  constructor(position, width, height) {
    super(position);
    this.width = width;
    this.height = height;
    this.vertices = this.getVertices();
  }
  getVertices() {
    const { height, width } = this;

    const points = [
      new Vector(this.p.x - width, this.p.y - height),
      new Vector(this.p.x + width, this.p.y - height),
      new Vector(this.p.x + width, this.p.y + height),
      new Vector(this.p.x - width, this.p.y + height),
    ];

    const angle = (this.a * Math.PI) / 180;

    return points.map((point) => {
      const x = Math.round(
        Math.cos(angle) * (point.x - this.p.x) -
          Math.sin(angle) * (point.y - this.p.y) +
          this.p.x
      );
      const y = Math.round(
        Math.sin(angle) * (point.x - this.p.x) +
          Math.cos(angle) * (point.y - this.p.y) +
          this.p.y
      );
      return new Vector(x, y);
    });
  }
}

class Collidable {
  entity = new Entity();
  constructor(entity) {
    this.entity = entity;
    this.edges = this.getEdges(this.entity.vertices);
  }

  /**
   * @param {Vector[]} vertices
   */
  getEdges(vertices) {
    if (vertices.length < 3) {
      throw new Error("Only polygons supported.");
    }
    return vertices.map((current, index) => {
      const next = vertices[index + 1];
      if (!next) {
        const first = vertices[0];
        return new Vector(first.x - current.x, first.y - current.y);
      }
      return new Vector(next.x - current.x, next.y - current.y);
    });
  }

  projectInAxis(x, y) {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < this.entity.vertices.length; i++) {
      let px = this.entity.vertices[i].x;
      let py = this.entity.vertices[i].y;
      var projection = (px * x + py * y) / Math.sqrt(x * x + y * y);
      if (projection > max) {
        max = projection;
      }
      if (projection < min) {
        min = projection;
      }
    }
    return { min, max };
  }

  intervalDistance(minA, maxA, minB, maxB) {
    if (minA < minB) {
      return minB - maxA;
    }
    return minA - maxB;
  }

  testWith(otherPolygon) {
    const otherCollider = otherPolygon.collider;
    // get all edges
    const edges = [];
    for (let i = 0; i < this.edges.length; i++) {
      edges.push(this.edges[i]);
    }
    for (let i = 0; i < otherCollider.edges.length; i++) {
      edges.push(otherCollider.edges[i]);
    }
    // build all axis and project
    for (let i = 0; i < edges.length; i++) {
      // get axis
      // get axis
      const length = Math.sqrt(
        edges[i].y * edges[i].y + edges[i].x * edges[i].x
      );
      const axis = {
        x: -edges[i].y / length,
        y: edges[i].x / length,
      };
      // project polygon under axis
      const { min: minA, max: maxA } = this.projectInAxis(axis.x, axis.y);
      const { min: minB, max: maxB } = otherCollider.projectInAxis(
        axis.x,
        axis.y
      );
      if (this.intervalDistance(minA, maxA, minB, maxB) > 0) {
        return false;
      }
    }
    return true;
  }

  testCollisions(collidables) {
    this.isColliding = collidables.some((collidable) =>
      this.testWith(collidable)
    );
  }

  update(delta, context, entities) {
    this.edges = this.getEdges(this.entity.vertices);

    this.testCollisions(
      entities
        .filter((entity) => entity.collider)
        .filter((entity) => entity !== this.entity)
    );
  }
}

const gravity = new Vector(0, 0.3);

class Dynamic {
  entity = new Entity();
  constructor(entity) {
    this.entity = entity;
  }
  update(delta, context, entities) {
    // this.entity.v.x += gravity.x
    // this.entity.v.y += gravity.y

    this.entity.a += 1;
    this.entity.p.x += this.entity.v.x;
    this.entity.p.y += this.entity.v.y;
  }
}

class Tuna extends Polygon {
  constructor(position) {
    super(position, 50, 100);
    this.collider = new Collidable(this);
    this.dynamics = new Dynamic(this);
  }
  update(delta, context, entities) {
    this.vertices = this.getVertices();
    this.collider.update(delta, context, entities);
    this.dynamics.update(delta, context, entities);
    this.render(delta, context);
  }
  render(delta, context) {
    const [first, ...rest] = this.vertices;
    context.beginPath();
    context.moveTo(first.x, first.y);
    for (let vertex of rest) {
      context.lineTo(vertex.x, vertex.y);
    }
    if (this.collider.isColliding) {
      context.fillStyle = "red";
    } else {
      context.fillStyle = "black";
    }
    context.closePath();
    context.fill();
  }
}

class Game {
  canvas = null;
  running = false;
  lastFrame = 0;
  entities = [];
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
    this.loop();
  }

  spawn(entity) {
    this.entities.push(entity);
  }

  stop() {
    this.running = false;
  }

  loop(timestamp) {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;

    const delta = timestamp - this.lastFrame || 0;
    this.lastFrame = timestamp;

    for (let entity of this.entities) {
      entity.update(delta, this.context, this.entities);
    }
    if (this.running) {
      requestAnimationFrame(this.loop.bind(this));
    }
  }
}

const main = () => {
  /**
   * @type {HTMLCanvasElement} canvas
   */
  const canvas = document.getElementById("background-image");
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffc0cb";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const game = new Game(canvas);
  game.start();
  game.spawn(
    new Tuna(new Vector(canvas.clientWidth / 2, canvas.clientHeight / 2))
  );
  game.spawn(
    new Tuna(new Vector(canvas.clientWidth / 3, canvas.clientHeight / 3))
  );
  // game.spawn(new Tuna(new Vector(canvas.clientWidth / 1.5, canvas.clientHeight / 1.5)));
  // game.spawn(new Polygon(new Vector(200, 200), 10, 10));
};

document.addEventListener("DOMContentLoaded", main);
