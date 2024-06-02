
export class ColorService {
  private pallette = [
    "#6B9080",
    "#A4C3B2",
    "#CCE3DE",
    "#4464AD",
    "#0C4767",
    "#00FF00",
    "#FFFF00",
    "#00FFFF",
    "#FF00FF",
    "#C0C0C0",
    "#808080",
    "#800000",
    "#808000",
    "#00FF00",
    "#008080",
    "#800080"]
  usedColors: string[] = [];
  constructor() { }

  getRandom(): string {
    const randomIndex = Math.floor(Math.random() * this.pallette.length);
    return this.pallette[randomIndex];
  }

  getDistinctColor(): string {
    if (this.usedColors.length === this.pallette.length) {
      this.reset();
    }

    let color = this.getRandom();
    while (this.usedColors.includes(color)) {
      color = this.getRandom();
    }
    this.usedColors.push(color);
    return color;
  }

  reset() {
    this.usedColors = [];
  }

  nrOfSupportedColors(): number {
    return this.pallette.length;
  }
}


