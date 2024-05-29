import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IdService {

  constructor() { }

  generate(): string {
    return `${(Math.random() + 1).toString(36).substring(8)}_${Date.now()}`;
  }
}
