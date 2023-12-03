import { StateCreator } from "zustand";
import { StoreState } from "../store";

type PostureState = {
  isWebcamRunning: boolean;
  shouldRenderLandmakrs: boolean;
  isGoodPosture: boolean;
  postureDuration: number;
  hasNotified: boolean;
};

const initialState: PostureState = {
  isWebcamRunning: false,
  shouldRenderLandmakrs: true,
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

    if (!currentStatus) {
      get().requestNotificationPermission();
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
      //ToDo: Add function to notify users
    },
    requestNotificationPermission() {
      if (!("Notification" in window)) {
        alert("This browser does not support desktop notifications.");
        return;
      }
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
        } else {
          console.log("Notification permission denied.");
        }
      });
    },  
  };
};
