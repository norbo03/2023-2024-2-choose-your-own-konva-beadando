import {AfterViewInit, Component, ElementRef} from '@angular/core';
import Konva from "konva";
import {Task2BKonvaMode} from "./models/task-2b-mode.model";
import {CarShape} from "../../../_shapes/car";
import {ParkingShape} from "../../../_shapes/parking";
import {IdService} from "../../../_services/id.service";
import {CoordinateService} from "../../../_services/coordinate.service";
import {ColorService} from "../../../_services/color.service";
import {interval} from "rxjs";
import {CarsClusteredWorkerEvent, CheckCarPositionsEvent, WorkerEventType} from "../../../_models/worker";
import {Cluster} from "../../../_models/entities/cluster";

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
  colorService: ColorService = new ColorService();
  coordinateService: CoordinateService = new CoordinateService();

  Task2BKonvaMode = Task2BKonvaMode;

  constructor(private el: ElementRef,
              private idService: IdService) { }

  ngAfterViewInit() {
    this.worker = new Worker(new URL('src/app/_workers/konva.worker.ts', import.meta.url));

    this.worker.onmessage = ( ({data}) => {
      console.log('main thread received a message', data);

      switch (data.type) {
        case WorkerEventType.CARS_CLUSTERED:
          console.log('Cars clustered', data);
          let clusters = (data as CarsClusteredWorkerEvent).clusters;
          clusters.forEach((cluster) => this.updateBorder(cluster));
          break;
        default:
          console.log('Unknown event', data);
          break;
      }
    });

    this.worker.onerror = ( (error) => {
      console.log('Error on worker', error);
    })

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
                car.draw(this.selectedLayer!, () => this.assignWork());
                this.assignWork();
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
                  parking.draw(this.selectedLayer!);
                  this.assignWork();
                }
                break;
            }
          }
        }
      });

      interval(10000).subscribe(() => this.assignWork());
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
        car.draw(this.selectedLayer!, () => this.assignWork());
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
        parking.draw(this.selectedLayer!);
      }
    }
  }

  updateBorder(cluster: Cluster) {
    console.log(this.selectedLayer?.children)
    let borderColor = cluster.parking.color!;
    let parking = this.parkings.find((parking) => parking.id === cluster.parking.id)!;
    parking.drawBorder(borderColor);

    cluster.cars
      .map(c => this.cars.find((car) => car.id === c.id)!)
      .forEach((car) => {
        car.drawBorder(borderColor);
    });
  }

  assignWork() {
    this.worker?.postMessage(new CheckCarPositionsEvent(
        this.cars.map((car) => car.toDTO()),
        this.parkings.map((parking) => parking.toDTO())
      )
    );
  }
}
