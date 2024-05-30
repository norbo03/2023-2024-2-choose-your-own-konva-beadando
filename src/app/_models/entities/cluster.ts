import {Parking} from "./parking";
import {Car} from "./car";

export class Cluster {
  parking: Parking;
  cars: Car[];

  constructor(parking: Parking, cars: Car[]) {
    this.parking = parking;
    this.cars = cars;
  }

  addCar(car: Car) {
    this.cars.push(car);
  }
}
