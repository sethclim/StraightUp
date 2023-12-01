import { StateCreator } from "zustand";
import { StoreState } from "../store";

type PostureState = {
  isWebcamRunning: boolean;
  shouldRenderLandmakrs: boolean;
  isGoodPosture: boolean;
  postureDuration: number;
};

const initialState: PostureState = {
  isWebcamRunning: false,
  shouldRenderLandmakrs: true,
  isGoodPosture: true,
  postureDuration: 0,
};

type PostureActions = {
  toggleWebcamStatus: () => void;
  updateWebcamStatus: (status: boolean) => void;
  updatePostureStatus: (status: boolean) => void;
  notifyUser: () => void;
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
      set((state) => ({ isWebcamRunning: !state.isWebcamRunning }));
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
    notifyUser() {
      // TODO:
      // Note: make sure to only send 1 notification, i.e. add a lock
    },
  };
};
