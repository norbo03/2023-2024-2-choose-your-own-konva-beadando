import Konva from "konva";
import {ShapeType} from "../_models/shapes";

export class CarShape {
  id: string;
  stage: Konva.Stage;
  x: number;
  y: number;
  width: number;
  height: number;
  draggable: boolean;

  constructor(id: string, stage: Konva.Stage, x: number, y: number, width: number, height: number, draggable: boolean = true) {
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

  shape(): Konva.Group {
    const group = new Konva.Group({
      draggable: this.draggable,
      type: ShapeType.CAR,
      elementId: `Group_${this.id}`
    });
    const body = new Konva.Line({
      points: [
        this.x + this.width / 5,
        this.y,
        this.x + 4 * this.width / 5,
        this.y,
        this.x + this.width,
        this.y + this.height,
        this.x,
        this.y + this.height,
        this.x + this.width / 5,
        this.y
      ],
      closed: true,
      fill: 'blue',
      stroke: 'black',
      strokeWidth: 5,
      strokeScaleEnabled: true,
      perfectDrawEnabled: false,
      shadowForStrokeEnabled: false,
      elementId: `Body_${this.id}`
    });
    const leftTyre = new Konva.Circle({
      x: this.x + this.width / 5,
      y: this.y + this.height,
      radius: this.height / 5,
      stroke: 'black',
      strokeWidth: 5,
      elementId: `LTyre_${this.id}`
    })
    const rightTyre = new Konva.Circle({
      x: this.x + 4 * this.width / 5,
      y: this.y + this.height,
      radius: this.height / 5,
      stroke: 'black',
      strokeWidth: 5,
      elementId: `RTyre_${this.id}`
    })

    group.add(body, leftTyre, rightTyre)
    return group;
  }
}
