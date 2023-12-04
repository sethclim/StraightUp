// Webcam.js
import React, { useEffect, useRef } from "react";
import { startLandmarkDetection } from "../../utils/model";
import useStore from "../../data/store";
import styles from "./webcam.module.css";



const Webcam = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isWebcamRunning = useStore((state) => state.isWebcamRunning);

  useEffect(() => {
    let cleanup: () => void;

    if (isWebcamRunning) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas) {
        (async () => {
          cleanup = await enableWebcam(video, canvas);
        })();
      }
    }

    return () => {
      cleanup?.();
    };
  }, [isWebcamRunning]);

  return isWebcamRunning ? (
    <div className={styles["render-container"]}>
      <video ref={videoRef} className={styles.webcam} playsInline />
      <canvas ref={canvasRef} className={styles["output-canvas"]} />
    </div>
  ) : (
    <p className={styles.label}>Enable camera to get started!</p>
  );
};

let aspectRatio = 1;

async function enableWebcam(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement
) {
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

  function handleDataLoaded() {
    startLandmarkDetection(video, canvas);
  }

  function updateVideoDimensions() {
    if (aspectRatio === 0) aspectRatio = 1;

    const newWidth = Math.min(1280, window.innerWidth);
    const newHeight = newWidth / aspectRatio;

    video.width = newWidth;
    video.height = newHeight;
  }

  // Initial update
  updateVideoDimensions();

  video.addEventListener("loadeddata", handleDataLoaded);
  window.addEventListener("resize", updateVideoDimensions);

  return () => {
    stream.getTracks().forEach((track) => track.stop());
    video.removeEventListener("loadeddata", handleDataLoaded);
    window.removeEventListener("resize", updateVideoDimensions);
  };
}

export default Webcam;
