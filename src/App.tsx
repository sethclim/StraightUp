import React, { useEffect, useRef, useCallback, useState } from "react";
import "./App.css";
import {
  DrawingUtils,
  FilesetResolver,
  Landmark,
  NormalizedLandmark,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import { calculateDistance2D } from "./utils/distance";

let poseLandmarker: PoseLandmarker;
let lastVideoTime = -1;

const modelSetup = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task",
    },
    runningMode: "VIDEO",
    numPoses: 1,
  });
};

const drawLandmarks = (
  canvas: HTMLCanvasElement,
  landmarks: NormalizedLandmark[]
) => {
  const canvasCtx = canvas.getContext("2d");
  if (!canvasCtx) return;

  const drawingUtils = new DrawingUtils(canvasCtx);

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  drawingUtils.drawLandmarks(landmarks);
  drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS);
  canvasCtx.restore();
};

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [poseChangeRequired, setPoseChangeRequired] = useState(false);

  const processLandmarks = (landmarks: Landmark[]) => {
    if (landmarks.length !== 33) return;

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

    setPoseChangeRequired(body_sideways && head_sideways);
  };

  const renderLoop = useCallback(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    let startTimeMs = performance.now();

    if (video.currentTime !== lastVideoTime) {
      lastVideoTime = video.currentTime;

      const result = poseLandmarker.detectForVideo(video, startTimeMs);

      if (result.landmarks.length === 1) {
        // Model is configured to only detect 1 pose at a time (i.e. 1 person)
        const pose_1_landmarks = result.landmarks[0];
        const pose_1_world_landmarks = result.worldLandmarks[0];

        processLandmarks(pose_1_world_landmarks);

        if (canvasRef.current) {
          drawLandmarks(canvasRef.current, pose_1_landmarks);
        }
      }
    }

    window.requestAnimationFrame(renderLoop);
  }, []);

  const getVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, frameRate: { ideal: 30, max: 30 } },
      });

      let video = videoRef.current;
      let canvas = canvasRef.current;

      if (video && canvas) {
        video.srcObject = stream;

        // Update video dimensions based on window size
        const updateVideoDimensions = () => {
          const aspectRatio = 1280 / 720;
          const maxWidth = 1280;

          if (video && canvas && aspectRatio && aspectRatio > 0) {
            // Calculate the height to maintain the aspect ratio
            const newWidth = Math.min(window.innerWidth, maxWidth);
            const newHeight = newWidth / aspectRatio;

            video.width = newWidth;
            video.height = newHeight;
            canvas.width = newWidth;
            canvas.height = newHeight;
          }
        };

        // Initial update
        updateVideoDimensions();

        // Add event listener to update dimensions on window resize
        window.addEventListener("resize", updateVideoDimensions);
        video.addEventListener("loadeddata", renderLoop);

        // Clean up the event listener when the component unmounts
        return () => {
          window.removeEventListener("resize", updateVideoDimensions);
          video?.removeEventListener("loadeddata", renderLoop);
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  }, [renderLoop]);

  useEffect(() => {
    modelSetup();
    getVideo();
  }, [getVideo]);

  return (
    <div className="App">
      <header className="App-header">
        <p>Straight Up!</p>
      </header>
      <div className="App-body">
        <div className="render-container">
          <video ref={videoRef} className="camera" autoPlay></video>
          <canvas ref={canvasRef} className="output-canvas"></canvas>
        </div>
        <div
          className="status-container"
          style={{
            backgroundColor: poseChangeRequired ? "#bb2124" : "#22bb33",
          }}
        >
          <span className="status-text">
            {poseChangeRequired ? "Adjust Posture" : "Acceptable"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;
