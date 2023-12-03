import { StateCreator } from "zustand";
import { StoreState } from "../store";

type PostureState = {
  isWebcamRunning: boolean;
  shouldRenderLandmarks: boolean;
  isGoodPosture: boolean;
  postureDuration: number;
  hasNotified: boolean;
};

const initialState: PostureState = {
  isWebcamRunning: false,
  shouldRenderLandmarks: true,
  isGoodPosture: true,
  postureDuration: 0,
  hasNotified: false,
};

type PostureActions = {
  toggleWebcamStatus: () => void;
  updateWebcamStatus: (status: boolean) => void;
  updatePostureStatus: (status: boolean) => void;
  startPostureTimer: () => void;
  notifyUser: () => void;
  requestNotificationPermission: () => void;
  toggleShouldRenderLandmarks: () => void;
};

export type PostureSlice = PostureState & PostureActions;

let postureTimer: NodeJS.Timer;

export const createPostureSlice: StateCreator<
  StoreState,
  [],
  [],
  PostureSlice
> = (set, get) => {
  return {
    ...initialState,
    toggleWebcamStatus() {
      const currentStatus = get().isWebcamRunning;
      set((state) => ({ isWebcamRunning: !state.isWebcamRunning }));

      if (currentStatus) {
        clearInterval(postureTimer);
        set({ postureDuration: 0 });
      } else {
        get().requestNotificationPermission();
        get().startPostureTimer();
      }
    },

    updateWebcamStatus(status) {
      set({ isWebcamRunning: status });
    },
    updatePostureStatus(status) {
      const oldStatus = get().isGoodPosture;

      if (oldStatus !== status) {
        // 1. Update state
        set({ isGoodPosture: status, postureDuration: 0 });

        // 2. Stop previous timer
        clearInterval(postureTimer);

        // 3. Run new timer updating "postureDuration"
        postureTimer = setInterval(() => {
          set((state) => ({ postureDuration: state.postureDuration + 1 }));
        }, 100);
      }
    },
    startPostureTimer() {
      // 1. Stop previous timer
      clearInterval(postureTimer);

      // 2. Run new timer updating "postureDuration"
      postureTimer = setInterval(() => {
        set((state) => ({ postureDuration: state.postureDuration + 1 }));
      }, 100);
    },
    notifyUser() {
      // Detect if the user is on a mobile device
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);

      // Get the current posture status
      const { isGoodPosture, hasNotified } = get();

      const showNotification = () => {
        const message = isMobile
          ? "Please check your posture on your mobile device."
          : "Please check your posture on your desktop.";

        if (Notification.permission === "granted") {
          new Notification(message);
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              new Notification(message);
            }
          });
        }
      };

      if (!isGoodPosture && !hasNotified) {
        showNotification();
        set({ hasNotified: true });
      }
      if (isGoodPosture && hasNotified) {
        set({ hasNotified: false });
      }
    },
    requestNotificationPermission() {
      if (!("Notification" in window)) {
        alert("This browser does not support desktop notifications.");
        return;
      }
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
        } else {
          console.log("Notification permission denied.");
        }
      });
    },
    toggleShouldRenderLandmarks: () => {
      set((state) => ({ shouldRenderLandmarks: !state.shouldRenderLandmarks }));
      console.log(get().shouldRenderLandmarks);
    },
  };
};
