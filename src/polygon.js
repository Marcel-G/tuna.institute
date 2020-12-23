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
      const next = vertices[index + 1] || vertices[0];
      return Vector.sub(next, current);
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
    if (this.m === 0) return;
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
   * @returns {{ distance: number, normal: Vector, point: Vector}}
   */
  getClosestSupportingPoint(polygon) {
    const shortest = {
      distance: -Infinity,
      normal: null,
      point: null
    };
    for (let i = 0; i < this.edges.length; i++) {
      const edge = this.edges[i];
      const edgePointA = this.vertices[i];
      const shortestTmp = {
        distance: 0,
        normal: null,
        point: null
      };
      const normal = Vector.scale(edge.normal().normalise(), -1);
      let allPositive = true;
      for (const vertex of polygon.vertices) {
        const v = Vector.sub(vertex, edgePointA);
        const projection = Vector.dot(normal, v);
        if (projection < shortestTmp.distance) {
          allPositive = false;
          shortestTmp.distance = projection;
          shortestTmp.normal = normal;
          shortestTmp.point = vertex;
        }
      }
      if (allPositive) {
        return ({
          distance: 0,
          normal: null,
          point: null
        })
      } else if (shortestTmp.distance > shortest.distance) {
        shortest.distance = shortestTmp.distance;
        shortest.normal = shortestTmp.normal;
        shortest.point = shortestTmp.point;
      }
    }
    return shortest;
  }
  /**
   * @param {Polygon} polygon
   * @returns {Contact | false}
   */
  testWith(polygon) {
    const ab = this.getClosestSupportingPoint(polygon);
    const ba = polygon.getClosestSupportingPoint(this);

    if (ab.point == null || ba.point == null) {
      return false
    }
  
    const shortest = {
      distance: -Infinity,
      normal: null,
      point: null,
      a: null,
      b: null,
    };

    if (ab.point != null) {
      shortest.distance = ab.distance
      shortest.normal = ab.normal
      shortest.point = ab.point
      shortest.a = this;
      shortest.b = polygon;
    }

    if (ba.point != null && ba.distance > shortest.distance) {
      shortest.distance = ba.distance
      shortest.normal = ba.normal
      shortest.point = ba.point 
      shortest.a = polygon;
      shortest.b = this;
    }
    // get all edges
    return shortest;
  }
}
