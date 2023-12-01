import { Videocam, VideocamOff } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import "./App.css";
import { Stopwatch, Webcam } from "./components";
import useStore from "./data/store";
import { modelSetup } from "./utils/model";
import { useEffect } from "react";

// const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
// const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

modelSetup();

function App() {
  const isWebcamRunning = useStore((state) => state.isWebcamRunning);
  const toggleWebcamStatus = useStore((state) => state.toggleWebcamStatus);
  const startPostureTimer = useStore((state) => state.startPostureTimer);

  useEffect(() => {
    if (isWebcamRunning) {
      startPostureTimer();
    }
  }, [isWebcamRunning]);

  return (
    <div className="App">
      <header className="App-header">
        <p>StraightUp</p>
        <IconButton disableRipple color="inherit" onClick={toggleWebcamStatus}>
          {isWebcamRunning ? <VideocamOff /> : <Videocam />}
        </IconButton>
      </header>
      <div className="App-body">
        <Webcam />
      </div>
      {isWebcamRunning ? (
        <footer className="App-footer">
          <Stopwatch />
        </footer>
      ) : null}
    </div>
  );
}

export default App;
