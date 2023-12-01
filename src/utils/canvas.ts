import {
  DrawingUtils,
  NormalizedLandmark,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";

export class Canvas {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d")!;
  }

  resizeCanvas(video: HTMLVideoElement) {
    const { width, height } = video.getBoundingClientRect();
    this.canvas.width = width;
    this.canvas.height = height;
  }

  start() {
    this.context.save();
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  stop() {
    this.context.restore();
  }

  drawLine(
    pointA: NormalizedLandmark,
    pointB: NormalizedLandmark,
    color: string = "green"
  ) {
    this.context.beginPath();
    this.context.moveTo(
      pointA.x * this.canvas.width,
      pointA.y * this.canvas.height
    );
    this.context.lineTo(
      pointB.x * this.canvas.width,
      pointB.y * this.canvas.height
    );
    this.context.lineWidth = 15;
    this.context.strokeStyle = color;
    this.context.stroke();
  }

  drawCircle(
    point: NormalizedLandmark,
    radius: number = 10,
    color: string = "green"
  ) {
    this.context.beginPath();
    this.context.arc(
      point.x * this.canvas.width,
      point.y * this.canvas.height,
      radius,
      0,
      2 * Math.PI,
      false
    );
    this.context.fillStyle = color;
    this.context.fill();
  }

  drawAllLandmarks(landmarks: NormalizedLandmark[]) {
    const drawingUtils = new DrawingUtils(this.context);
    drawingUtils.drawLandmarks(landmarks);
    drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS);
  }
}
