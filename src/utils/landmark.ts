import { NormalizedLandmark } from "@mediapipe/tasks-vision";

export const calculateDistance2D = (
  A: NormalizedLandmark,
  B: NormalizedLandmark
) => {
  const dx = B.x - A.x;
  const dy = B.y - A.y;

  return Math.sqrt(dx * dx + dy * dy);
};

export const calculateDistance = (
  A: NormalizedLandmark,
  B: NormalizedLandmark
) => {
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const dz = B.z - A.z;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

export const calculateMidpoint = (
  A: NormalizedLandmark,
  B: NormalizedLandmark
): NormalizedLandmark => {
  return {
    x: (A.x + B.x) / 2,
    y: (A.y + B.y) / 2,
    z: (A.z + B.z) / 2,
  };
};

export function calculateAngle(
  A: NormalizedLandmark,
  B: NormalizedLandmark,
  C: NormalizedLandmark
): number {
  const BA = { x: A.x - B.x, y: A.y - B.y };

  const BC = { x: C.x - B.x, y: C.y - B.y };

  // Calculate dot product
  const dotProduct = BA.x * BC.x + BA.y * BC.y;

  // Calculate magnitudes
  const magnitudeAB = Math.sqrt(BA.x ** 2 + BA.y ** 2);
  const magnitudeBC = Math.sqrt(BC.x ** 2 + BC.y ** 2);

  const cosTheta = dotProduct / (magnitudeAB * magnitudeBC);

  const angleRadians = Math.acos(cosTheta);

  const angleDegrees = (180 / Math.PI) * angleRadians;

  return angleDegrees;
}
