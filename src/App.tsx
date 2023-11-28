import React, { useEffect, useRef, useCallback } from "react";
import "./App.css";
import {
  DrawingUtils,
  FilesetResolver,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";

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
  });
};

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const renderLoop = useCallback(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    let startTimeMs = performance.now();

    if (video.currentTime !== lastVideoTime) {
      lastVideoTime = video.currentTime;

      const result = poseLandmarker.detectForVideo(video, startTimeMs);

      const canvas = canvasRef.current;
      const canvasCtx = canvas?.getContext("2d");
      if (canvas && canvasCtx) {
        const drawingUtils = new DrawingUtils(canvasCtx);
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        for (const landmark of result.landmarks) {
          drawingUtils.drawLandmarks(landmark, {
            radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
          });
          drawingUtils.drawConnectors(
            landmark,
            PoseLandmarker.POSE_CONNECTIONS
          );
        }
        canvasCtx.restore();
      }
    }

    window.requestAnimationFrame(renderLoop);
  }, []);

  const getVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });

      let video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.addEventListener("loadeddata", renderLoop);
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
        <video ref={videoRef} className="camera" autoPlay></video>
        <canvas ref={canvasRef} className="output_canvas"></canvas>
      </header>
    </div>
  );
}

export default App;
