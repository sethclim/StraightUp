import { Videocam, VideocamOff } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import React, { useState } from "react";
import "./App.css";
import { Webcam } from "./components";
import { modelSetup } from "./utils/model";

// const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
// const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

modelSetup();

function App() {
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [poseChangeRequired, setPoseChangeRequired] = useState(false);

  return (
    <div className="App">
      <header className="App-header">
        <p>StraightUp</p>
        <IconButton
          disableRipple
          color="inherit"
          onClick={() => setWebcamEnabled(!webcamEnabled)}
        >
          {webcamEnabled ? <VideocamOff /> : <Videocam />}
        </IconButton>
      </header>
      <div className="App-body">
        <Webcam
          webcamEnabled={webcamEnabled}
          onPoseChangeRequired={setPoseChangeRequired}
        />
      </div>
      {webcamEnabled ? (
        <footer
          className="App-footer"
          style={{
            backgroundColor: poseChangeRequired ? "#bb2124" : "#22bb33",
          }}
        >
          <p>{poseChangeRequired ? "Adjust Posture" : "Acceptable Posture"}</p>
        </footer>
      ) : null}
    </div>
  );
}

export default App;
