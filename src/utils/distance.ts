import { Landmark } from "@mediapipe/tasks-vision";

export const calculateDistance2D = (pointA: Landmark, pointB: Landmark) => {
  const dx = pointB.x - pointA.x;
  const dy = pointB.y - pointA.y;

  return Math.sqrt(dx * dx + dy * dy);
};

export const calculateDistance = (pointA: Landmark, pointB: Landmark) => {
  const dx = pointB.x - pointA.x;
  const dy = pointB.y - pointA.y;
  const dz = pointB.z - pointA.z;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};
