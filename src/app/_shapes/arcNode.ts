import Konva from "konva";


export class ArcNode {
  arc: Konva.Arc;
  edge?: Konva.Line;
  x: number;
  y: number;
  angle: number;
  defaultColor: string;

  constructor(x: number,
              y: number,
              angle: number = 270,
              defaultColor: string = 'black',
              onMoveCallback: () => void) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.defaultColor = defaultColor;

    this.arc = new Konva.Arc({
      x: this.x,
      y: this.y,
      innerRadius: 30,
      outerRadius: 35,
      angle: this.angle,
      fill: this.defaultColor,
      strokeWidth: 1,
      draggable: true,
    });

    this.arc.on('dragmove', () => {
      this.x = this.arc?.x();
      this.y = this.arc?.y();
      if (this.edge) {
        this.edge.points()[0] = this.x;
        this.edge.points()[1] = this.y;
        onMoveCallback();
      }
    })
  }

  setAngle(angle: number) {
    this.angle = angle;
    this.arc?.angle(angle);
  }

  draw(layer?: Konva.Layer, callback: () => void = () => {
  }) {
    layer?.add(this.arc);
    callback();
  }

  drawEdge(x: number, y: number, layer?: Konva.Layer, duration: number = 0) {
    if (this.edge) { // move edge
      new Konva.Tween({
        node: this.edge!,
        duration: duration,
        easing: Konva.Easings.EaseInOut,
        points: [this.x, this.y, x, y],
      }).play();
    } else { // create edge
      this.edge = new Konva.Line({
        points: [this.x, this.y, x, y],
        stroke: 'black',
        strokeWidth: 1,
      });
      layer?.add(this.edge);
    }
  }

  resetColor() {
    this.highlight(this.defaultColor);
  }

  highlight(color: string) {
    this.arc.fill(color);
  }
}
