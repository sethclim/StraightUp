import React, { useEffect, useRef } from "react";
import "./App.css";

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const getVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });

      let video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.play();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  useEffect(() => {
    getVideo();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>Straight Up!</p>
        <video ref={videoRef}></video>
      </header>
    </div>
  );
}

export default App;
