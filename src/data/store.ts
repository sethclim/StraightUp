import { create } from "zustand";
import { PostureSlice, createPostureSlice } from "./slices/postureSlice";

export type StoreState = PostureSlice;

const useStore = create<StoreState>()((...a) => ({
  ...createPostureSlice(...a),
}));

export default useStore;
