import {AfterViewInit, Component, ElementRef} from '@angular/core';
import Konva from "konva";
import {Task2BKonvaMode} from "./models/task-2b-mode.model";
import {CarShape} from "../../../_shapes/car";
import {ParkingShape} from "../../../_shapes/parking";
import {IdService} from "../../../_services/id.service";
import {CoordinateService} from "../../../_services/coordinate.service";
import {ColorService} from "../../../_services/color.service";

@Component({
  selector: 'app-task2-b',
  templateUrl: './task2-b.component.html',
  styleUrls: ['./task2-b.component.less']
})
export class Task2BComponent implements AfterViewInit {
  selectedMode: Task2BKonvaMode = Task2BKonvaMode.CAR;
  selectedLayer?: Konva.Layer;
  stage?: Konva.Stage;
  worker?: Worker;
  cars: CarShape[] = [];
  parkings: ParkingShape[] = [];

  Task2BKonvaMode = Task2BKonvaMode;

  constructor(private el: ElementRef,
              private coordinateService: CoordinateService,
              private colorService: ColorService,
              private idService: IdService) { }

  ngAfterViewInit() {
    this.worker = new Worker(new URL('src/app/_workers/konva.worker.ts', import.meta.url));

    this.worker.onmessage = ( ({data}) => {
      console.log('main thread received a message', data);
    });

    this.worker.onerror = ( (error) => {
      console.log('Error on worker', error);
    })

    this.worker.postMessage('test message');

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

      this.initScene();

      this.stage.on('click', (event) => {
        if (this.stage) {
          let pointer = this.stage.getPointerPosition();
          if (pointer && event.target instanceof Konva.Stage) {
            switch (this.selectedMode) {
              case Task2BKonvaMode.CAR:
                const car = new CarShape(
                  this.idService.generate(),
                  this.stage,
                  pointer?.x,
                  pointer?.y,
                  50,
                  25,
                  true
                );
                this.cars.push(car);
                this.selectedLayer?.add(car.shape());
                break;
              case Task2BKonvaMode.PARKING:
                const parking = new ParkingShape(
                  this.idService.generate(),
                  this.stage,
                  pointer?.x,
                  pointer?.y,
                  50,
                  50,
                  false
                );
                if (this.parkings.length >= this.colorService.nrOfSupportedColors()) {
                  alert('Isn\'t that a bit much? Maximum parking spots reached!');
                } else {
                  this.parkings.push(parking);
                  this.selectedLayer?.add(parking.shape());
                }
                break;
            }
          }
        }
      });

    });

  }

  initScene() {
    if (this.selectedLayer) {
      let offset = 50; // To prevent shapes from being drawn outside the stage
      for (let i = 0; i < 10; i++) {
        let point = this.coordinateService.getRandomPoint(this.stage!.width() - offset, this.stage!.height() - offset);
        const car = new CarShape(
          this.idService.generate(),
          this.stage!,
          point.x,
          point.y,
          50,
          25,
          true
        );
        this.cars.push(car);
        this.selectedLayer.add(car.shape());
      }

      for (let i = 0; i < 2; i++) {
        let point = this.coordinateService.getRandomPoint(this.stage!.width() - offset, this.stage!.height() - offset);
        const parking = new ParkingShape(
          this.idService.generate(),
          this.stage!,
          point.x,
          point.y,
          50,
          50,
          false
        );
        this.parkings.push(parking);
        this.selectedLayer.add(parking.shape());
      }
    }
  }
}
