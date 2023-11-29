// Webcam.js
import React, { useEffect, useRef } from "react";
import { predictLandmarks } from "../utils/landmark";

let aspectRatio = 1;

interface WebcamProps {
  webcamEnabled: boolean;
  onPoseChangeRequired: (required: boolean) => void;
}

const Webcam: React.FC<WebcamProps> = ({
  webcamEnabled,
  onPoseChangeRequired,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cleanupFunc1: () => void;
    let cleanupFunc2: () => void;

    if (webcamEnabled) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas) {
        (async () => {
          cleanupFunc1 = enablePrediction(video, canvas, onPoseChangeRequired);
          cleanupFunc2 = await enableWebcam(video);
        })();
      }
    }

    return () => {
      cleanupFunc1?.();
      cleanupFunc2?.();
    };
  }, [webcamEnabled, onPoseChangeRequired]);

  return webcamEnabled ? (
    <div className="render-container">
      <video ref={videoRef} className="webcam" playsInline />
      <canvas ref={canvasRef} className="output-canvas" />
    </div>
  ) : (
    <p className="instruction">Enable camera to get started!</p>
  );
};

async function enableWebcam(video: HTMLVideoElement) {
  const constraints: MediaStreamConstraints = {
    video: true,
  };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  const tracks = stream.getVideoTracks();
  if (tracks.length > 0) {
    aspectRatio = tracks[0].getSettings().aspectRatio ?? 1;
  }

  video.srcObject = stream;
  video.play();

  const updateVideoDimensions = () => {
    if (aspectRatio === 0) aspectRatio = 1;

    const newWidth = Math.min(1280, window.innerWidth);
    const newHeight = newWidth / aspectRatio;

    video.width = newWidth;
    video.height = newHeight;
  };

  // Initial update
  updateVideoDimensions();

  window.addEventListener("resize", updateVideoDimensions);

  return () => {
    stream.getTracks().forEach((track) => track.stop());
    window.removeEventListener("resize", updateVideoDimensions);
  };
}

const enablePrediction = (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  onPoseChangeRequired: (required: boolean) => void
) => {
  const predictWebcam = () =>
    predictLandmarks(video, canvas, onPoseChangeRequired);

  video.addEventListener("loadeddata", predictWebcam);

  return () => {
    video.removeEventListener("loadeddata", predictWebcam);
  };
};

export default Webcam;
