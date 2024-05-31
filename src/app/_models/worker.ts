import {Car} from "./entities/car";
import {Parking} from "./entities/parking";
import {Cluster} from "./entities/cluster";
import {CoordinateService} from "../_services/coordinate.service";
import {ColorService} from "../_services/color.service";

export enum WorkerEventType {
  CHECK_POSITION = 'CHECK_POSITION',
  CARS_CLUSTERED = 'CARS_CLUSTERED',
  CARS_TO_FLASH = 'CARS_TO_FLASH',
}

export class WorkerEvent {
  type: WorkerEventType;

  constructor(type: WorkerEventType) {
    this.type = type;
  }
}

export class CheckCarPositionsEvent extends WorkerEvent {
  cars: Car[];
  parkings: Parking[];

  constructor(cars: Car[], parkings: Parking[]) {
    super(WorkerEventType.CHECK_POSITION);
    this.cars = cars;
    this.parkings = parkings;
  }
}

export class CarsClusteredWorkerEvent extends WorkerEvent {
  clusters: Cluster[]
  constructor(clusters: Cluster[]) {
    super(WorkerEventType.CARS_CLUSTERED);
    this.clusters = clusters;
  }
}

export class CarsToFlashWorkerEvent extends WorkerEvent {
  cars: Car[];
  constructor(cars: Car[]) {
    super(WorkerEventType.CARS_TO_FLASH);
    this.cars = cars;
  }
}
