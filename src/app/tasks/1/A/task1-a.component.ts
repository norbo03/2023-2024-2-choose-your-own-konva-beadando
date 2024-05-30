import {AfterViewInit, Component, ElementRef, OnDestroy} from '@angular/core';
import Konva from "konva";
import {DrawOptions} from "../../../_models/drawings";
import {ArcNode} from "../../../_shapes/arcNode";
import {CenterDot} from "../../../_shapes/center";
import {interval, Subscription} from "rxjs";
import {ColorService} from "../../../_services/color.service";
import {CoordinateService} from "../../../_services/coordinate.service";
import {EventService} from "../../../_services/event.service";

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
  subscription: Subscription;

  colorService: ColorService = new ColorService();
  coordinateService: CoordinateService = new CoordinateService();

  constructor(private el: ElementRef,
              private eventService: EventService) {
    this.subscription = this.eventService.getEventObservable().subscribe(() => {
      this.highlightClosestArc();
    });
  }

  ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

  ngAfterViewInit() {
    setTimeout(() => { // Forcing a single change detection cycle delay
      this.stage = new Konva.Stage({
        container: 'konva-container',
        width: this.el.nativeElement.offsetWidth,
        height: 500,
      });
      this.layer = new Konva.Layer();
      this.stage.add(this.layer);

      this.stage.on('click', (event) => {
        if (this.stage) {
          let pointer = this.stage.getPointerPosition();
          if (pointer && event.target instanceof Konva.Stage) {
            switch (this.selectedShape) {
              case DrawOptions.ARC:
                let arc = new ArcNode(pointer.x, pointer.y, this.arcAngle, this.colorService.getRandom(), this.eventService);
                this.arcs.push(arc);
                arc.draw(this.layer);
                this.dot?.updateTag(this.arcs.length);
                this.drawEdges(this.dot?.x()!, this.dot?.y()!);
                break;
              case DrawOptions.DOT:
                if (this.dot) {
                  this.dot.move(pointer.x, pointer.y, 1);
                  this.drawEdges(pointer.x, pointer.y, 1);
                } else {
                  this.dot = new CenterDot(pointer.x, pointer.y, this.arcs.length, this.eventService);
                  this.dot.draw(this.layer);
                  this.drawEdges(this.dot.x()!, this.dot.y()!);

                  interval(5000).subscribe(() => {
                      let point = this.coordinateService.getRandomPoint(this.stage?.width()!, this.stage?.height()!)
                      this.dot?.move(point.x, point.y, 1)
                      this.drawEdges(point.x, point.y, 1);
                      this.eventService.recalculationNeeded();
                    }
                  )
                  // interval(1000).subscribe(() => this.highlightClosestArc())
                }
                break;
              default:
                break;
            }
          }
        }
      });

    });

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
    if (!this.dot) {
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


  protected readonly KonvaMode = DrawOptions;

}
