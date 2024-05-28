import { Injectable } from '@angular/core';
import {Palette} from "../_models/palette";

@Injectable({
  providedIn: 'root'
})
export class ColorService {
  colors: string[];
  constructor() {
    this.colors = Object.values(Palette);
  }

  getRandom(): string {
    const randomIndex = Math.floor(Math.random() * this.colors.length);
    return this.colors[randomIndex];
  }
}
