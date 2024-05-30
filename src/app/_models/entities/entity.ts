import {Point} from "../../_interfaces/point";

export interface Entity {
  readonly id: string;
  position: Point;
}
