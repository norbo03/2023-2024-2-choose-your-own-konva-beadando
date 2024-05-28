import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private recalculation = new Subject<void>();

  recalculationNeeded() {
    this.recalculation.next();
  }

  getEventObservable() {
    return this.recalculation.asObservable();
  }
}
