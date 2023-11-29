import {
  DrawingUtils,
  Landmark,
  NormalizedLandmark,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import { calculateDistance2D } from "./distance";
import { poseLandmarker } from "./model";

let lastVideoTime = -1;

export function predictLandmarks(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  onPoseChangeRequired: (required: boolean) => void
) {
  if (!poseLandmarker) return;

  const { width, height } = video.getBoundingClientRect();
  canvas.width = width;
  canvas.height = height;

  let startTimeMs = performance.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
      // Model is configured to only detect 1 pose at a time (i.e. 1 person)
      const pose_1_landmarks = result.landmarks[0];
      const pose_1_world_landmarks = result.worldLandmarks[0];

      if (!pose_1_landmarks || !pose_1_world_landmarks) return;

      drawLandmarks(canvas, pose_1_landmarks);
      const changeRequired = processLandmarks(pose_1_world_landmarks);
      onPoseChangeRequired(changeRequired);
    });
  }

  window.requestAnimationFrame(() =>
    predictLandmarks(video, canvas, onPoseChangeRequired)
  );
}

function drawLandmarks(
  canvas: HTMLCanvasElement,
  landmarks: NormalizedLandmark[]
) {
  const canvasCtx = canvas.getContext("2d");
  if (!canvasCtx) return;

  const drawingUtils = new DrawingUtils(canvasCtx);

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  drawingUtils.drawLandmarks(landmarks);
  drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS);
  canvasCtx.restore();
}

function processLandmarks(landmarks: Landmark[]): boolean {
  if (landmarks.length !== 33) return false;

  const nose = landmarks[0];
  const left_ear = landmarks[7];
  const right_ear = landmarks[8];
  const left_mouth = landmarks[9];
  const right_mouth = landmarks[10];
  const left_shoulder = landmarks[11];
  const right_shoulder = landmarks[12];

  // THIS WORKS WELL
  const head_sideways =
    left_ear.x < left_mouth.x || right_ear.x > right_mouth.x;

  // WORKS PRETTY WELL
  const shoulder_dist = calculateDistance2D(left_shoulder, right_shoulder);
  const body_sideways = shoulder_dist < 0.2; // Is body sideways?

  return head_sideways && body_sideways;
}
