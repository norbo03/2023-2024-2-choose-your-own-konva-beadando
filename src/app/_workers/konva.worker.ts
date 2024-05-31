import {
  CarsClusteredWorkerEvent,
  CarsToFlashWorkerEvent,
  CheckCarPositionsEvent,
  WorkerEvent,
  WorkerEventType,
} from "../_models/worker";
import {Parking} from "../_models/entities/parking";
import {Cluster} from "../_models/entities/cluster";
import {CoordinateService} from "../_services/coordinate.service";
import {ColorService} from "../_services/color.service";
import {Car} from "../_models/entities/car";

let colorService: ColorService = new ColorService();
let coordinateService: CoordinateService = new CoordinateService();

self.onmessage = (event: MessageEvent<WorkerEvent>) => {
  switch (event.data.type) {
    case WorkerEventType.CHECK_POSITION:
      const checkCarPositions = event.data as CheckCarPositionsEvent;
      let cars: Car[] = checkCarPositions.cars;
      let parkings: Parking[] = checkCarPositions.parkings;
      console.log('Checking car positions', checkCarPositions.cars, checkCarPositions.parkings);

      let clusters: Map<string, Cluster> = new Map<string, Cluster>();
      let flashingCars = cars.filter(car => {
        return !parkings.some(spot => {
          const distance = coordinateService.getDistanceBetweenPoints(spot.position, car.position);
          return distance <= 150;
        })
      });

      parkings.forEach(parking => {
        parking.color = colorService.getDistinctColor();
        clusters.set(parking.id, new Cluster(parking, []));
      })

      cars.forEach(car => {
        if (flashingCars.includes(car)) {
          return;
        }
        let closestParking: Parking = parkings[0];
        let closestDistance: number = coordinateService.getDistanceBetweenPoints(car.position, closestParking.position);
        parkings.forEach(parking => {
          let distance = coordinateService.getDistanceBetweenPoints(car.position, parking.position);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestParking = parking;
          }
        });
        clusters.get(closestParking.id)!.addCar(car);
      })

      colorService.reset();
      postMessage(new CarsClusteredWorkerEvent(Array.from(clusters.values())));
      if (flashingCars.length > 0) {
        postMessage(new CarsToFlashWorkerEvent(flashingCars));
      }
      break;
    default:
      console.error('Unknown event type', event.data.type);
      break;
  }
};
