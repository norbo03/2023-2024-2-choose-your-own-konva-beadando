import Konva from "konva";
import {ShapeType} from "../_models/shapes";
import {Proxy} from "../_interfaces/Proxy";
import {Car} from "../_models/entities/car";

export class CarShape implements Proxy<Car> {
  id: string;
  stage: Konva.Stage;
  x: number;
  y: number;
  width: number;
  height: number;
  draggable: boolean;
  shapeGroup?: Konva.Group;
  defaultColor: string = 'blue';
  flashingColor: string = 'red';
  isFlashing: boolean = false;

  constructor(id: string, stage: Konva.Stage, x: number, y: number, width: number, height: number, draggable: boolean = true) {
    this.id = id;
    this.stage = stage;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.draggable = draggable;
  }

  draw(layer: Konva.Layer, callback: () => void) {
    this.shape().on("dragend", () => {
      if (this.shapeGroup) {
        this.x = this.shapeGroup.x()!;
        this.y = this.shapeGroup.y()!;
        callback();
      }
      console.log("Car with id [", this.id, "] has been dragged to x: ", this.shapeGroup?.x(), " y: ", this.shapeGroup?.y());
    })
    layer.add(this.shape());
  }

  shape(): Konva.Group {
    if (!this.shapeGroup) {
      const group = new Konva.Group({
        draggable: this.draggable,
        type: ShapeType.CAR,
        elementId: `Car_${this.id}`,
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
        fill: this.defaultColor,
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
      this.shapeGroup = group;
    }
    return this.shapeGroup;
  }

  toDTO(): Car {
    return new Car(this.id, {x: this.x, y: this.y})
  }

  drawBorder(color: string) {
    this.shapeGroup?.children.forEach((shape) => {
      if (shape instanceof Konva.Shape) {
        shape.stroke(color);
        shape.strokeWidth(5);
      }
    });
  }

  setBackgroundColor(color: string = this.defaultColor) {
    this.shapeGroup?.children.forEach((shape) => {
      if (shape instanceof Konva.Shape && shape.attrs.elementId == `Body_${this.id}`) {
        shape.fill(color);
      }
    });
  }

  setFlashing(isFlashing: boolean) {
    this.isFlashing = isFlashing;
  }

}
