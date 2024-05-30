import {Point} from "../../_interfaces/point";
import {Entity} from "./entity";

export class Parking implements Entity {
  readonly id: string;
  position: Point;
  color?: string;

  constructor(id: string, position: Point) {
    this.id = id;
    this.position = position;
  }
}
