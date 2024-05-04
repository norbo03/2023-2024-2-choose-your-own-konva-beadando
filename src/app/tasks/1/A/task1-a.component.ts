import {AfterViewInit, Component, ElementRef} from '@angular/core';
import Konva from "konva";
import {Tree} from "../../../_shapes/tree";

@Component({
  selector: 'app-task1-a',
  templateUrl: './task1-a.component.html',
  styleUrls: ['./task1-a.component.less']
})
export class Task1AComponent implements AfterViewInit {
  selectedLayer?: Konva.Layer;
  stage?: Konva.Stage;
  constructor(private el: ElementRef) { }

  ngAfterViewInit() {
    setTimeout(() => { // Forcing a single change detection cycle delay
      this.stage = new Konva.Stage({
        container: 'konva-container',
        width: this.el.nativeElement.offsetWidth,
        height: 500,
      });
      const layer = new Konva.Layer();
      this.stage.add(layer);

      this.selectedLayer = this.stage.getLayers()[0];

      this.stage.on('click', (event) => {
        if (this.stage) {
          let pointer = this.stage.getPointerPosition();

          if (pointer && event.target instanceof Konva.Stage) {
            // @todo
          } else {

          }

        }
      });

    });

  }

}
