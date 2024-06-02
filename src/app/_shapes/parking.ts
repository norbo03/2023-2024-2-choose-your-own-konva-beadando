import Konva from "konva";
import {ShapeType} from "../_models/shapes";
import {Proxy} from "../_interfaces/Proxy";
import {Parking} from "../_models/entities/parking";

export class ParkingShape implements Proxy<Parking> {
  id: string;
  stage: Konva.Stage;
  x: number;
  y: number;
  width: number;
  height: number;
  draggable: boolean;
  rect?: Konva.Rect;

  constructor(id: string, stage: Konva.Stage, x: number, y: number, width: number, height: number, draggable = false) {
    this.id = id;
    this.stage = stage;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.draggable = draggable;
  }

  draw(layer: Konva.Layer) {
    layer.add(this.shape());
  }

  shape() {
    if (this.rect) {
      return this.rect;
    }
    const rect = new Konva.Rect({
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      fill: '#00D2FF',
      stroke: 'black',
      strokeWidth: 3,
      draggable: this.draggable,
      type: ShapeType.PARKING,
      elementId: `Parking_${this.id}`
    });

    this.rect = rect;
    return rect;
  }

  toDTO(): Parking {
    // return center of gravity
    return new Parking(this.id, {x: this.x + this.width / 2, y: this.y + this.height / 2});
  }

  drawBorder(color: string) {
    if (this.rect) {
      this.rect.stroke(color);
      this.rect.strokeWidth(4);
    }
  }

}
