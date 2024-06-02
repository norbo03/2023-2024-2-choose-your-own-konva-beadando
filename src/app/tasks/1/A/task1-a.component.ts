import {AfterViewInit, Component, ElementRef, OnDestroy} from '@angular/core';
import Konva from "konva";
import {DrawOptions} from "../../../_models/drawings";
import {ArcNode} from "../../../_shapes/arcNode";
import {CenterDot} from "../../../_shapes/center";
import {interval, Subject} from "rxjs";
import {ColorService} from "../../../_services/color.service";
import {CoordinateService} from "../../../_services/coordinate.service";

@Component({
  selector: 'app-task1-a',
  templateUrl: './task1-a.component.html',
  styleUrls: ['./task1-a.component.less']
})
export class Task1AComponent implements AfterViewInit, OnDestroy {
  layer?: Konva.Layer;
  stage?: Konva.Stage;
  selectedShape: DrawOptions = DrawOptions.ARC;
  arcAngle: number = 270;
  arcs: ArcNode[] = [];
  sliderMarks: { [key: number]: string } = {
    0: '0°',
    300: '300°'
  };
  dot?: CenterDot;
  recalculation = new Subject<void>();
  colorService: ColorService = new ColorService();
  coordinateService: CoordinateService = new CoordinateService();
  protected readonly KonvaMode = DrawOptions;

  constructor(private el: ElementRef) {
  }

  ngOnDestroy(): void {
    if (this.recalculation) {
      this.recalculation.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.setupStage();
    this.recalculation.subscribe(() => this.highlightClosestArc())
  }

  setupStage() {
    setTimeout(() => { // Forcing a single change detection cycle delay
      this.stage = new Konva.Stage({
        container: 'konva-container',
        width: this.el.nativeElement.offsetWidth,
        height: 500,
      });
      this.layer = new Konva.Layer();
      this.stage.add(this.layer);

      this.addStageEventListeners();
    });
  }

  addStageEventListeners() {
    this.stage!.on('click', (event) => {
      if (this.stage) {
        let pointer = this.stage.getPointerPosition();
        if (pointer && event.target instanceof Konva.Stage) {
          switch (this.selectedShape) {
            case DrawOptions.ARC:
              let arc = new ArcNode(pointer.x, pointer.y, this.arcAngle, this.colorService.getRandom(),
                () => this.recalculation.next());
              this.arcs.push(arc);
              arc.draw(this.layer, () => this.recalculation.next());
              this.dot?.updateTag(this.arcs.length);
              this.drawEdges(this.dot?.x()!, this.dot?.y()!);
              break;
            case DrawOptions.DOT:
              if (this.dot) {
                this.dot.move(pointer.x, pointer.y, 1, () => this.recalculation.next());
                this.drawEdges(pointer.x, pointer.y, 1);
              } else {
                this.initDot(pointer);
              }
              break;
            default:
              break;
          }
        }
      }


    });
  }

  initDot(pointer: Konva.Vector2d) {
    this.dot = new CenterDot(pointer.x, pointer.y, this.arcs.length);
    this.dot.draw(this.layer);
    this.drawEdges(this.dot.x()!, this.dot.y()!);
    this.highlightClosestArc();

    interval(5000).subscribe(() => {
        let point = this.coordinateService.getRandomPoint(this.stage?.width()!, this.stage?.height()!)
        this.dot?.move(point.x, point.y, 1, () => this.recalculation.next());
        this.drawEdges(point.x, point.y, 1);
        this.recalculation.next();
      }
    )
    // interval(1000).subscribe(() => this.highlightClosestArc())
  }

  arcAngleChanged(angle: number) {
    this.arcAngle = angle;
    this.arcs.forEach((arc) => {
      arc.setAngle(angle);
    });
  }

  drawEdges(x: number, y: number, duration: number = 0) {
    if (this.dot) {
      this.arcs.forEach((arc) => {
        arc.drawEdge(x, y, this.layer, duration);
      });
    }
  }

  highlightClosestArc() {
    if (!this.dot || this.arcs.length == 0) {
      return;
    }
    let x = this.dot.x()!;
    let y = this.dot.y()!;

    let closest = this.arcs
      .map((arc) => [arc, this.coordinateService.getEuclideanDistance(x, y, arc.x, arc.y)])
      .reduce(([closest, d0], [current, d1]) =>
        d0 < d1 ? [closest, d0] : [current, d1])[0]

    this.arcs.forEach((arc) => arc == closest ? arc.highlight("red") : arc.resetColor());
  }

}
