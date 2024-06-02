import { AfterViewInit, Component, ElementRef, OnDestroy } from '@angular/core';
import Konva from 'konva';
import { Task2BKonvaMode } from './models/task-2b-mode.model';
import { CarShape } from '../../../_shapes/car';
import { ParkingShape } from '../../../_shapes/parking';
import { IdService } from '../../../_services/id.service';
import { CoordinateService } from '../../../_services/coordinate.service';
import { ColorService } from '../../../_services/color.service';
import { interval, Subscription } from 'rxjs';
import {
  CarsClusteredWorkerEvent,
  CarsToFlashWorkerEvent,
  CheckCarPositionsEvent,
  WorkerEventType
} from '../../../_models/worker';
import { Cluster } from '../../../_models/entities/cluster';
import { Car } from '../../../_models/entities/car';

@Component({
  selector: 'app-task2-b',
  templateUrl: './task2-b.component.html',
  styleUrls: ['./task2-b.component.less']
})
export class Task2BComponent implements AfterViewInit, OnDestroy {
  selectedMode: Task2BKonvaMode = Task2BKonvaMode.CAR;
  selectedLayer?: Konva.Layer;
  stage?: Konva.Stage;
  worker?: Worker;
  cars: CarShape[] = [];
  parkings: ParkingShape[] = [];
  clusters: Cluster[] = [];
  flashingCars: Set<CarShape> = new Set<CarShape>();
  colorService: ColorService = new ColorService();
  coordinateService: CoordinateService = new CoordinateService();
  flashSubscription: Subscription | null = null;

  Task2BKonvaMode = Task2BKonvaMode;

  constructor(private el: ElementRef,
              private idService: IdService) {
  }

  ngOnDestroy(): void {
    if (this.flashSubscription) {
      this.flashSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.worker = new Worker(new URL('src/app/_workers/konva.worker.ts', import.meta.url));

    this.worker.onmessage = ({ data }) => {
      switch (data.type) {
        case WorkerEventType.CARS_CLUSTERED:
          console.debug('Cars clustered', data);
          const clusters = (data as CarsClusteredWorkerEvent).clusters;
          this.clusters = clusters.sort((a, b) => b.cars.length - a.cars.length);
          this.updateBorders(clusters);
          break;
        case WorkerEventType.CARS_TO_FLASH:
          console.debug('Cars to flash', data);
          this.updateFlashingCars((data as CarsToFlashWorkerEvent).cars);
          break;
        default:
          console.log('Unknown event', data);
          break;
      }
    };

    this.worker.onerror = (error) => {
      console.log('Error on worker', error);
    };

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
          const pointer = this.stage.getPointerPosition();
          if (pointer && event.target instanceof Konva.Stage) {
            switch (this.selectedMode) {
              case Task2BKonvaMode.CAR:
                const car = new CarShape(
                  this.idService.generate(),
                  this.stage,
                  pointer.x,
                  pointer.y,
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
                  pointer.x,
                  pointer.y,
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
      const offset = 50; // To prevent shapes from being drawn outside the stage
      for (let i = 0; i < 10; i++) {
        const point = this.coordinateService.getRandomPoint(this.stage!.width() - offset, this.stage!.height() - offset);
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
        const point = this.coordinateService.getRandomPoint(this.stage!.width() - offset, this.stage!.height() - offset);
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

  updateBorders(clusters: Cluster[]) {
    this.cars.forEach(car => car.resetBorder());

    clusters.forEach(cluster => {
      const borderColor = cluster.parking.color!;
      const parking = this.parkings.find(p => p.id === cluster.parking.id)!;
      parking.drawBorder(borderColor);

      cluster.cars
        .map(c => this.cars.find(car => car.id === c.id)!)
        .forEach(car => {
          car.drawBorder(borderColor);
        });
    });
  }

  updateFlashingCars(cars: Car[]) {
    const newFlashingCars = new Set<CarShape>();

    cars.forEach(c => {
      const car = this.cars.find(car => car.id === c.id);
      if (car) {
        newFlashingCars.add(car);
      }
    });

    this.flashingCars.forEach(car => {
      if (!newFlashingCars.has(car)) {
        car.setFlashing(false);
        car.setBackgroundColor();
      }
    });

    this.flashingCars = newFlashingCars;

    this.toggleFlashing();
  }

  toggleFlashing() {
    if (this.flashSubscription) {
      this.flashSubscription.unsubscribe();
    }

    this.flashSubscription = interval(500).subscribe(() => {
      this.flashingCars.forEach(car => {
        car.setFlashing(!car.isFlashing);
      });
    });
  }

  assignWork() {
    this.worker?.postMessage(new CheckCarPositionsEvent(
      this.cars.map(car => car.toDTO()),
      this.parkings.map(parking => parking.toDTO())
    ));
  }
}
