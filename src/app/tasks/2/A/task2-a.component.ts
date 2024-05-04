import {AfterViewInit, Component, ElementRef} from '@angular/core';
import Konva from "konva";
import {Task2AKonvaMode} from "./models/task-2a-mode.model";
import {Tree} from "../../../_shapes/tree";

@Component({
  selector: 'app-task2-a',
  templateUrl: './task2-a.component.html',
  styleUrls: ['./task2-a.component.less']
})
export class Task2AComponent implements AfterViewInit {
  selectedMode: Task2AKonvaMode = Task2AKonvaMode.SELECT;
  selectedLayer?: Konva.Layer;
  stage?: Konva.Stage;
  transformer?: Konva.Transformer;

  Task2AKonvaMode = Task2AKonvaMode;
  constructor(private el: ElementRef) { }

  ngAfterViewInit() {
    setTimeout(() => { // Forcing a single change detection cycle delay
      this.stage = new Konva.Stage({
        container: 'konva-container',
        width: this.el.nativeElement.offsetWidth,
        height: 500,
      });
      const layer1 = new Konva.Layer();
      const layer2 = new Konva.Layer();
      this.stage.add(layer1);
      this.stage.add(layer2);

      this.selectedLayer = this.stage.getLayers()[0];

      this.transformer = new Konva.Transformer();
      this.selectedLayer.add(this.transformer);

      this.stage.on('click', (event) => {
        if (this.stage) {
          let pointer = this.stage.getPointerPosition();
          if (pointer && event.target instanceof Konva.Stage) {
            switch (this.selectedMode) {
              case Task2AKonvaMode.RECTANGLE:
                const rectangle = new Konva.Rect({
                  x: pointer?.x,
                  y: pointer?.y,
                  width: 100,
                  height: 30,
                  stroke: 'black',
                  strokeWidth: 3,
                  draggable: true,
                });
                this.selectedLayer?.add(rectangle);
                break;
              case Task2AKonvaMode.SELECT:
                this.transformer?.nodes([]);
                break;
              case Task2AKonvaMode.TREE:
                const tree = new Tree(
                  pointer?.x,
                  pointer?.y,
                  50,
                  75,
                  true
                );
                this.selectedLayer?.add(tree.shape());
                break;
            }
          } else {
            switch (this.selectedMode) {
              case Task2AKonvaMode.SELECT:
                this.transformer?.nodes([event.target]);
                break;
            }
          }

        }
      });

    });

  }

}
