import {
    FilesetResolver,
    NormalizedLandmark,
    PoseLandmarker,
} from "@mediapipe/tasks-vision";
import { calculateAngle, calculateMidpoint } from "./landmark";
import { Canvas } from "./canvas";
import useStore from "../data/store";

// const NOSE = 0;
// const LEFT_EYE_INNER = 1;
// const LEFT_EYE = 2;
// const LEFT_EYE_OUTER = 3;
// const RIGHT_EYE_INNER = 4;
// const RIGHT_EYE = 5;
// const RIGHT_EYE_OUTER = 6;
const LEFT_EAR = 7;
const RIGHT_EAR = 8;
// const MOUTH_LEFT = 9;
// const MOUTH_RIGHT = 10;
const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;
// const LEFT_ELBOW = 13;
// const RIGHT_ELBOW = 14;
// const LEFT_WRIST = 15;
// const RIGHT_WRIST = 16;
// const LEFT_PINKY = 17;
// const RIGHT_PINKY = 18;
// const LEFT_INDEX = 19;
// const RIGHT_INDEX = 20;
// const LEFT_THUMB = 21;
// const RIGHT_THUMB = 22;
const LEFT_HIP = 23;
const RIGHT_HIP = 24;
// const LEFT_KNEE = 25;
// const RIGHT_KNEE = 26;
// const LEFT_ANKLE = 27;
// const RIGHT_ANKLE = 28;
// const LEFT_HEEL = 29;
// const RIGHT_HEEL = 30;
// const LEFT_FOOT_INDEX = 31;
// const RIGHT_FOOT_INDEX = 32;

let poseLandmarker: PoseLandmarker;

export const modelSetup = async () => {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task",
            delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
    });
};

let lastVideoTime = -1;
let video: HTMLVideoElement;
let canvas: Canvas;

export function startLandmarkDetection(
    videoHTML: HTMLVideoElement,
    canvasHTML: HTMLCanvasElement
) {
    if (!poseLandmarker) return;

    video = videoHTML;
    canvas = new Canvas(canvasHTML);

    renderLoop();
}

function renderLoop() {
    canvas.resizeCanvas(video);

    let startTimeMs = performance.now();
    if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
            // Model is configured to only detect 1 pose at a time (i.e. 1 person)
            const pose_1_landmarks = result.landmarks[0];

            if (pose_1_landmarks) {
                evaluatePosture(pose_1_landmarks);

                if (useStore.getState().shouldRenderLandmarks) {
                    drawPosture(pose_1_landmarks);
                }
            }
        });
    }

    if (useStore.getState().isWebcamRunning) {
        window.requestAnimationFrame(renderLoop);
    }
}

function evaluatePosture(landmarks: NormalizedLandmark[]) {
    const l_ear = landmarks[LEFT_EAR];
    const r_ear = landmarks[RIGHT_EAR];
    const l_shldr = landmarks[LEFT_SHOULDER];
    const r_shldr = landmarks[RIGHT_SHOULDER];
    const l_hip = landmarks[LEFT_HIP];
    const r_hip = landmarks[RIGHT_HIP];

    // Useful for determining if the user is positioned sideways or not
    // const shldr_dist = calculateDistance2D(l_shldr, r_shldr);

    const m_ear = calculateMidpoint(l_ear, r_ear);
    const m_shldr = calculateMidpoint(l_shldr, r_shldr);
    const m_hip = calculateMidpoint(l_hip, r_hip);

    // Points on the vertical axis through middle: shoulder & hip, elevated by 0.25 units
    const y_shldr = { ...m_shldr, y: m_shldr.y - 0.25 };
    const y_hip = { ...m_hip, y: m_hip.y - 0.25 };

    const neck_inclination = calculateAngle(m_ear, m_shldr, y_shldr);
    const torso_inclination = calculateAngle(m_shldr, m_hip, y_hip);

    const is_good_posture = neck_inclination < 40 && torso_inclination < 20;

    useStore.getState().updateNeckInclination(neck_inclination);

    useStore.getState().updatePostureStatus(is_good_posture);
}

function drawPosture(landmarks: NormalizedLandmark[]) {
    const l_ear = landmarks[LEFT_EAR];
    const r_ear = landmarks[RIGHT_EAR];
    const l_shldr = landmarks[LEFT_SHOULDER];
    const r_shldr = landmarks[RIGHT_SHOULDER];
    const l_hip = landmarks[LEFT_HIP];
    const r_hip = landmarks[RIGHT_HIP];

    const m_ear = calculateMidpoint(l_ear, r_ear);
    const m_shldr = calculateMidpoint(l_shldr, r_shldr);
    const m_hip = calculateMidpoint(l_hip, r_hip);

    // Points on the vertical axis through middle: shoulder & hip, elevated by 0.25 units
    const y_shldr = { ...m_shldr, y: m_shldr.y - 0.25 };
    const y_hip = { ...m_hip, y: m_hip.y - 0.25 };

    const color = useStore.getState().isGoodPosture ? "#ff0" : "#f00";

    canvas.start();
    canvas.drawCircle(m_ear, 10, color);
    canvas.drawCircle(m_shldr, 10, color);
    canvas.drawCircle(m_hip, 10, color);
    canvas.drawCircle(y_shldr, 10, color);
    canvas.drawCircle(y_hip, 10, color);
    canvas.drawLine(m_shldr, m_ear, color);
    canvas.drawLine(m_hip, m_shldr, color);
    canvas.drawLine(m_shldr, y_shldr, color);
    canvas.drawLine(m_hip, y_hip, color);
    canvas.stop();
}
