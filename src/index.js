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
  /**
   * 
   * @param {Vector} vec1
   * @param {Vector} vec2
   * @returns {number}
   */
  static dot(vec1, vec2) {
    return vec1.x * vec2.x + vec1.y * vec2.y;
  }

  normalise() {
    const s = this.length()
    return new Vector(this.x / s, this.y / s);
  }

  length() {
    return Math.sqrt(Vector.dot(this, this))
  }

  /**
   * 
   * @param {Vector} normal
   */
  reflect(normal) {
    const len = Vector.dot(this, normal) * 2;
    return new Vector(
      this.x - normal.x * len,
      this.y - normal.y * len
    )
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

  /**
   * Friction
   */
  f = 0.9;

  /**
   * Elasticity
   */
  e = 0.8;
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

/**
 * Implements Separating Axis Theorem on entity
 * https://www.gamedev.net/articles/programming/general-and-gameplay-programming/2d-rotated-rectangle-collision-r2604/
 */
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

  /**
   * 
   * @param {Vector} axis
   * @returns {{ min: number, max: number }}
   */
  projectInAxis(axis) {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < this.entity.vertices.length; i++) {
      const projection = Vector.dot(this.entity.vertices[i], axis) / axis.length();
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
      
      const axis = new Vector(
        -edges[i].normalise().y,
        edges[i].normalise().x,
      )
      // project polygon under axis
      const { min: minA, max: maxA } = this.projectInAxis(axis);
      const { min: minB, max: maxB } = otherCollider.projectInAxis(axis);
      if (this.intervalDistance(minA, maxA, minB, maxB) > 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * 
   * @param {Vector} p1 
   * @param {Vector} p2 
   * @param {Vector} p3 
   * @param {Vector} p4 
   */
  checkLineIntersection(p1, p2, p3, p4) {
    const denominator = ((p4.y - p3.y) * (p2.x - p1.x)) - ((p4.x - p3.x) * (p2.y - p1.y));
    if (denominator == 0) {
        return null;
    }
    let a = p1.y - p3.y;
    let b = p1.x - p3.x;
    const numerator1 = ((p4.x - p3.x) * a) - ((p4.y - p3.y) * b);
    const numerator2 = ((p2.x - p1.x) * a) - ((p2.y - p1.y) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    if ((a > 0 && a < 1) && (b > 0 && b < 1)) {
      return new Vector(
        p1.x + (a * (p2.x - p1.x)),
        p1.y + (a * (p2.y - p1.y))
      );
    }

    return null;
  };

  intersectionPointsWith(otherPolygon) {
    const points = [];
    const normal = [];
    this.entity.vertices.forEach((p1, index, vertices) => {
      const p2 = vertices[index + 1] || vertices[0];
      otherPolygon.vertices.forEach((p3, index, vertices) => {
        const p4 = vertices[index + 1] || vertices[0];
        const point = this.checkLineIntersection(p1, p2, p3, p4);
        if (point) {
          point.normal = this.getNormal([p3, p4]);
          points.push(point);
        }
      })
    });
    return points;
  }

  testCollisions(collidables) {
    this.contactPoints = collidables
      .map((collidable) => {
        if (this.testWith(collidable)) {
          return this.intersectionPointsWith(collidable)
        }
        return []
      });

    // for (const point of this.contactPoints.map(this.getPointsCentroid).filter(Boolean)) {
    this.entity.v = this.contactPoints.flat()
    .map((point) => {
      return this.collisionResponse(
        this.entity.p,
        this.entity.v,
        this.entity.av,
        point,
        point.normal
      )
    })
    .reduce((newV, component) => {
      newV.x += component.x;
      newV.y += component.y;
      // newV.x += component.x * 2 * this.entity.e;
      // newV.y += component.y * 2 * this.entity.e;
      return newV
    }, this.entity.v)
  }

  collisionResponse(
    c, // object center of mass position
    v, // velocity of object
    a, // the angular velocity of the object
    p, // point of contact with line
    n  // normalized normal of line
  ) {
    // //  Make a vector from center mass to contact point
    // cp = p - c;
    const cp = new Vector(p.x - c.x, p.y - c.y);

    // //  Total velocity at contact point (add angular effect)
    const pv = new Vector(
      v.x - cp.y * a,
      v.y + cp.x * a
    )

    // //  Reflect point of contact velocity off the line (wall)

    const velocity = v.normalise();

    if (Vector.dot(v, n) > 0) {
    }

    return v.reflect(n);


    // // magic happens..
    // const av = (cp.x * v.y - cp.y * v.x) / (cp.x * cp.x + cp.y * cp.y);

    // this.entity.av = av;

    // result.v = ?? // resulting object velocity
    // result.a = ?? // resulting object angular velocity
    // return result;
  }

  getNormal(points) {
    if (points.length == 2) {
      const [p1, p2] = points;
      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      return new Vector(-dy, dx).normalise();
    }
    return null;
  }

  getPointsCentroid(points) {
    if (!points.length) return null;
    const centroid = points.reduce((centroid, point) => {
      centroid.x += point.x
      centroid.y += point.y
      return centroid
    } , new Vector(0, 0))
    centroid.x /= points.length;
    centroid.y /= points.length;
    centroid.normal = points[0].normal
    return centroid;
  } 

  update(delta, context, entities) {
    this.edges = this.getEdges(this.entity.vertices);

    this.testCollisions(
      entities
        .filter((entity) => entity.collider)
        .filter((entity) => entity !== this.entity)
    );
  }

  render(delta, context, entities) {
    // if (this.contactPoint) {
    //   context.fillStyle = 'blue';
    //   context.beginPath();
    //   context.arc(this.contactPoint.x, this.contactPoint.y, 5, 0, 2 * Math.PI, true);
    //   context.fill();
    // }
    for (const point of this.contactPoints.flat()) {
      context.fillStyle = 'yellow';
      context.beginPath();
      context.arc(point.x, point.y, 5, 0, 2 * Math.PI, true);
      context.fill();
      context.beginPath();
      context.moveTo(point.x, point.y);
      context.lineTo(
        point.x + (point.normal.x * 20),
        point.y + (point.normal.y * 20)
      );
      context.stroke()
    }
  }
}

const gravity = new Vector(0, 0.3);

class Dynamic {
  entity = new Entity();
  constructor(entity) {
    this.entity = entity;
    this.entity.av = Math.random();
  }
  clamp(number, limit) {
    return Math.max(Math.min(number, limit), -limit)
  }
  preUpdate(delta, context, entities) {
    // this.entity.v.x += gravity.x
    // this.entity.v.y += gravity.y

    // this.entity.av = this.clamp(this.entity.av, 5);
    this.entity.v.x = this.clamp(this.entity.v.x, 5);
    this.entity.v.y = this.clamp(this.entity.v.y, 5);

  }
  update(delta, context, entities) {
    this.entity.a += this.entity.av;
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
    this.dynamics.preUpdate(delta, context, entities);
    this.vertices = this.getVertices();
    this.collider.update(delta, context, entities);
    this.dynamics.update(delta, context, entities);
    this.render(delta, context);
    this.collider.render(delta, context, entities);
  }
  render(delta, context) {
    const [first, ...rest] = this.vertices;
    context.beginPath();
    context.moveTo(first.x, first.y);
    for (let vertex of rest) {
      context.lineTo(vertex.x, vertex.y);
    }
    if (this.collider.contactPoint) {
      context.fillStyle = "green";
    } else {
      context.fillStyle = "black";
    }
    context.closePath();
    context.stroke();
  }
}

class Boundary extends Polygon {
  constructor(position) {
    super(position, 280, 280);
    this.collider = new Collidable(this);
  }
  update(delta, context, entities) {
    this.vertices = this.getVertices();
    this.collider.update(delta, context, entities);
    this.render(delta, context);
    // this.collider.render(delta, context, entities);
  }
  render(delta, context) {
    const [first, ...rest] = this.vertices;
    context.beginPath();
    context.moveTo(first.x, first.y);
    for (let vertex of rest) {
      context.lineTo(vertex.x, vertex.y);
    }
    if (this.collider.contactPoint) {
      context.fillStyle = "green";
    } else {
      context.fillStyle = "black";
    }
    context.closePath();
    context.stroke();
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
  document.addEventListener('click', () => {
    if (game.running) {
      game.stop();
    } else {
      game.start();
    }
  })

  const game = new Game(canvas);
  game.start();
  game.spawn(new Boundary(new Vector(canvas.clientWidth / 2, canvas.clientHeight / 2)));
  game.spawn( new Tuna(new Vector(canvas.clientWidth / 2, canvas.clientHeight / 2)));
  game.spawn(
    new Tuna(new Vector(canvas.clientWidth / 3, canvas.clientHeight / 3))
  );
  // game.spawn(new Tuna(new Vector(canvas.clientWidth / 1.5, canvas.clientHeight / 1.5)));
  // game.spawn(new Polygon(new Vector(200, 200), 10, 10));
};

document.addEventListener("DOMContentLoaded", main);
