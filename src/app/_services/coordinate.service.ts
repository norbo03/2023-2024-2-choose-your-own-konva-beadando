import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CoordinateService {

  constructor() { }

  getEuclideanDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  getRandomPoint(w: number, h: number): Point {
    return {
      x: Math.floor(Math.random() * w),
      y: Math.floor(Math.random() * h)
    }
  }
}

export interface Point {
  x: number;
  y: number;
}
