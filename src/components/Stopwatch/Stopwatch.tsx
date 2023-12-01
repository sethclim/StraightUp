import useStore from "../../data/store";
import { formatPostureDuration } from "../../utils/format";
import styles from "./stopwatch.module.css";

interface StopwatchProps {}

const Stopwatch: React.FC<StopwatchProps> = ({}) => {
  const isGoodPosture = useStore((state) => state.isGoodPosture);
  // Measured in increments of 0.1 seconds
  const postureDuration = useStore((state) => state.postureDuration);
  const notifyUser = useStore((state) => state.notifyUser);

  const postureType = isGoodPosture ? "Good" : "Bad";
  const formattedDuration = formatPostureDuration(postureDuration);

  // If bad posture exceeds 5 seconds, notify the user
  if (!isGoodPosture && postureDuration > 50) {
    notifyUser();
  }

  return (
    <div
      className={styles.container}
      style={{
        backgroundColor: isGoodPosture ? "#22bb33" : "#bb2124",
      }}
    >
      <span
        className={styles.label}
      >{`${postureType} Posture Time: ${formattedDuration}`}</span>
    </div>
  );
};

export default Stopwatch;
