import { Entity, Properties, Contact } from "./entity";
import { Vector } from "./vector";

/**
 * @typedef {Object} PolyProperties
 * @property {number} height
 * @property {number} width
 */

export class Polygon extends Entity {
  height = 10;
  width = 10;
  /**
   *
   * @param {PolyProperties & Properties} properties
   */
  constructor(properties) {
    super(properties);
    this.width = properties.width;
    this.height = properties.height;
    this.updateGeometry();
  }
  updateGeometry() {
    this.vertices = this.buildVertices();
    this.edges = this.buildEdges();
  }
  buildEdges() {
    const vertices = this.vertices;
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
  buildVertices() {
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
  /**
   * @param {Vector} impact
   * @param {Vector} point
   * @returns {void}
   */
  applyImpact(impact, point) {
    // linear
    this.v = Vector.add(this.v, impact);
    
    // angular
    const angularImpact = Vector.crossV(
      Vector.sub(point, this.p),
      impact
    );
    this.av += (angularImpact / 0.5);
  }
  /**
   * @param {Polygon} polygon
   * @returns {Contact | false}
   */
  testWith(polygon) {
    const shortest = {
      distance: -Infinity,
      normal: null,
      point: null
    };
    // get all edges
    const edges = [];
    for (let i = 0; i < this.edges.length; i++) {
      edges.push(this.edges[i]);
    }
    for (let i = 0; i < polygon.edges.length; i++) {
      edges.push(polygon.edges[i]);
    }
    // build all axis and project
    for (let i = 0; i < edges.length; i++) {
      // get axis

      const axis = new Vector(-edges[i].normalise().y, edges[i].normalise().x);
      // project polygon under axis
      const { min: minA, max: maxA, minPoint: minPointA, maxPoint: maxPointA } = this.projectInAxis(axis);
      const { min: minB, max: maxB, minPoint: minPointB, maxPoint: maxPointB } = polygon.projectInAxis(axis);
      const distance = this.intervalDistance(minA, maxA, minB, maxB);
      const point = i > this.edges.length -1
        ? this.pointSelection(minA, minB, maxPointA, minPointA)
        : this.pointSelection(minA, minB, minPointB, maxPointB);
      if (distance > 0) {
        return false;
      } else if (distance > shortest.distance) {
        shortest.distance = distance;
        shortest.normal = axis.normalise();
        shortest.point = new Vector(
          point.x + (shortest.normal.x * distance),
          point.y + (shortest.normal.y * distance)
        );
      }
    }
    return shortest;
  }

 /**
  * @private
  * @param {Vector} axis
  * @returns {{ min: number, max: number, minPoint: Vector, maxPoint: Vector }}
  */
 projectInAxis(axis) {
   let min = Infinity;
   let max = -Infinity;
   let minPoint = null;
   let maxPoint = null;
   for (let i = 0; i < this.vertices.length; i++) {
     const projection =
       Vector.dot(this.vertices[i], axis) / axis.length();
     if (projection > max) {
       max = projection;
       maxPoint = this.vertices[i]
     }
     if (projection < min) {
       min = projection;
       minPoint = this.vertices[i]
     }
   }
   return { min, max, minPoint, maxPoint };
 }
  
  /**
   * @private
   * @param {number} minA 
   * @param {number} maxA 
   * @param {number} minB 
   * @param {number} maxB 
   */
  intervalDistance(minA, maxA, minB, maxB) {
    if (minA < minB) {
      return minB - maxA;
    }
    return minA - maxB;
  }
  /**
   * @private
   * @param {number} minA 
   * @param {number} minB 
   * @param {Vector} minPoint 
   * @param {Vector} maxPoint 
   */
  pointSelection(minA, minB, minPoint, maxPoint) {
    if (minA < minB) {
      return minPoint;
    }
    return maxPoint;
  }
}
