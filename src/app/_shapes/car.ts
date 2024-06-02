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
    const car = this.shape();
    car.on("dragend", (event) => {
      this.x = event.target.x();
      this.y = event.target.y();
      callback();
    })
    layer.add(car);
  }

  private shape(): Konva.Group {
    if (!this.shapeGroup) {
      const group = new Konva.Group({
        draggable: this.draggable,
        type: ShapeType.CAR,
        elementId: `Car_${this.id}`,
        x: this.x,
        y: this.y,
      });

      const body = new Konva.Line({
        points: [
          this.width / 5,
          0,
          4 * this.width / 5,
          0,
          this.width,
          this.height,
          0,
          this.height,
          this.width / 5,
          0
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
        x: this.width / 5,
        y: this.height,
        radius: this.height / 5,
        stroke: 'black',
        strokeWidth: 5,
        elementId: `LTyre_${this.id}`
      })
      const rightTyre = new Konva.Circle({
        x: 4 * this.width / 5,
        y: this.height,
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
    // return center of gravity
    return new Car(this.id, {x: this.x + this.width / 2, y: this.y + this.height / 2});
  }

  drawBorder(color: string) {
    this.shapeGroup?.children.forEach((shape) => {
      if (shape instanceof Konva.Shape) {
        shape.stroke(color);
        shape.strokeWidth(4);
      }
    });
  }

  resetBorder() {
    this.drawBorder('black');
  }

  setBackgroundColor(color: string = this.defaultColor) {
    this.shapeGroup?.children.forEach((shape) => {
      if (shape instanceof Konva.Shape && shape.attrs.elementId == `Body_${this.id}`) {
        shape.fill(color);
      }
    });
  }

  setFlashing(isFlashing: boolean) {
    this.setBackgroundColor(this.isFlashing ? this.flashingColor : this.defaultColor);
    this.isFlashing = isFlashing;
  }

}
