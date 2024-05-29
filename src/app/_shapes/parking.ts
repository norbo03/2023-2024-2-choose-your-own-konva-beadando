import Konva from "konva";
import {ShapeType} from "../_models/shapes";

export class ParkingShape {
  id: string;
  stage: Konva.Stage;
  x: number;
  y: number;
  width: number;
  height: number;
  draggable: boolean;
  borderColor?: string;
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
    return new Konva.Rect({
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      fill: '#00D2FF',
      stroke: 'black',
      strokeWidth: 4,
      draggable: this.draggable,
      type: ShapeType.PARKING,
      elementId: `Rect_${this.id}`
    });
  }
}
