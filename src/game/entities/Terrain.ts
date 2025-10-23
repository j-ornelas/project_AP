export class Terrain {
  points: number[] = [];

  generate(width: number): void {
    this.points = [];

    // Generate simple rolling hills using sine waves
    const baseHeight = 500;
    const amplitude = 100;
    const frequency = 0.01;

    for (let x = 0; x < width; x++) {
      const y =
        baseHeight +
        Math.sin(x * frequency) * amplitude +
        Math.sin(x * frequency * 2) * (amplitude / 2) +
        Math.sin(x * frequency * 0.5) * (amplitude / 3);

      this.points.push(y);
    }
  }

  setFromArray(points: number[]): void {
    this.points = [...points];
  }

  getHeight(x: number): number {
    const index = Math.floor(x);

    if (index < 0 || index >= this.points.length) {
      return this.points[0] || 0;
    }

    return this.points[index];
  }

  createCrater(centerX: number, radius: number): void {
    const startX = Math.max(0, Math.floor(centerX - radius));
    const endX = Math.min(this.points.length - 1, Math.ceil(centerX + radius));

    for (let x = startX; x <= endX; x++) {
      const distance = Math.abs(x - centerX);
      const normalizedDistance = distance / radius;

      if (normalizedDistance <= 1) {
        // Create smooth crater using cosine interpolation
        const depth = (Math.cos(normalizedDistance * Math.PI) + 1) / 2;
        const craterDepth = depth * radius * 0.8;
        this.points[x] += craterDepth;
      }
    }
  }
}
