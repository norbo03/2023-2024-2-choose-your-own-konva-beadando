import {Point} from "../../_interfaces/point";
import {Entity} from "./entity";

export class Car implements Entity {
  readonly id: string;
  position: Point;

  constructor(id: string, position: Point) {
    this.id = id;
    this.position = position;
  }
}
