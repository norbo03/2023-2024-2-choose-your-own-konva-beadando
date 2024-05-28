import Konva from "konva";
import {EventService} from "../_services/event.service";
export class CenterDot {
  group?: Konva.Group;
  private readonly dot?: Konva.Circle;
  private readonly nrOfArcsTag?: Konva.Text;

  constructor(x: number, y: number, nrOfArcs: number = 0, private eventService: EventService) {
    this.group = new Konva.Group({
      x: x,
      y: y,
      rotation: 25,
      width: 10,
      height: 10,
      draggable: false,
    });
    this.dot = new Konva.Circle({
      x: 0,
      y: 0,
      radius: 5,
      fill: 'green',
    });
    this.nrOfArcsTag = new Konva.Text({
      x: 5,
      y: 0,
      text: nrOfArcs.toString(),
      fontSize: 20,
      fill: 'green',
    });

    this.group.add(this.dot, this.nrOfArcsTag);
  }

  x() {
    return this.group?.x();
  }

  y() {
    return this.group?.y();
  }

  draw(layer?: Konva.Layer) {
    layer?.add(this.group!);
  }

  move(x: number, y: number, duration: number = 0) {
    if (this.group) {
      new Konva.Tween({
        node: this.group!,
        duration: duration,
        easing: Konva.Easings.EaseInOut,
        x: x,
        y: y,
      }).play();
      this.eventService.recalculationNeeded();
    }
  }

  updateTag(nrOfArcs: number) {
    this.nrOfArcsTag?.text(nrOfArcs.toString());
  }
}
