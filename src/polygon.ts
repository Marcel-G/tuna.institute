import { Entity, Properties, Contact } from "./entity";
import { Vector } from "./vector";
export interface PolyProperties {
  height: number;
  width: number;
}

export interface ClosestPoint {
  point: Vector | null;
  distance: number;
  normal: Vector | null
}

export abstract class Polygon extends Entity {
  edges: Vector[];
  vertices: Vector[];
  height = 10;
  width = 10;

  constructor(properties: PolyProperties & Properties) {
    super(properties);
    this.width = properties.width;
    this.height = properties.height;
    this.vertices = this.buildVertices();
    this.edges = this.buildEdges();
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

    const angle = this.a;

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

  applyImpact(impact: Vector, point: Vector) {
    if (this.m === 0) return;
    // linear
    this.v = Vector.add(
      this.v, Vector.scale(impact, 1 / this.m)
    );
    
    // angular
    const angularImpact = Vector.crossV(
      Vector.sub(point, this.p),
      impact
    );
    this.av += (angularImpact / this.i);
  }

  getClosestSupportingPoint(polygon: Polygon): ClosestPoint {
    let shortest: ClosestPoint = {
      distance: -Infinity,
      normal: null,
      point: null
    };

    for (let i = 0; i < this.edges.length; i++) {
      const edge = this.edges[i];
      const edgePointA = this.vertices[i];
      const shortestTmp: ClosestPoint = {
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
        shortest = shortestTmp
      }
    }
    return shortest;
  }

  testWith(polygon: Polygon): Contact | false {
    const ab = this.getClosestSupportingPoint(polygon);
    const ba = polygon.getClosestSupportingPoint(this);

    if (ab.point == null || ba.point == null || ab.normal == null || ba.normal == null) {
      return false
    }

    if (ba.distance > ab.distance) {
      return({
        distance: ba.distance,
        normal: ba.normal,
        point: ba.point ,
        a: polygon,
        b: this,
      })
    }

    return({
      distance: ab.distance,
      normal: ab.normal,
      point: ab.point,
      a: this,
      b: polygon,
    });
  }
}
