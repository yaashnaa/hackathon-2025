import React, { useEffect, useRef, useState, useCallback } from "react";
import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";

const YogaPoseDetector = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [userPose, setUserPose] = useState({});
  const [lastLogTime, setLastLogTime] = useState(0);
  const LOG_INTERVAL = 3000; // Log every 3 seconds

  const THRESHOLDS = {
    shoulders: 0.15,
    hips: 0.12,
    knees: 0.1,
    ankles: 0.08,
    wrists: 0.18, // More flexible for arm movement
  };

  function getThreshold(key) {
    if (key.includes("Shoulder")) return THRESHOLDS.shoulders;
    if (key.includes("Hip")) return THRESHOLDS.hips;
    if (key.includes("Knee")) return THRESHOLDS.knees;
    if (key.includes("Ankle")) return THRESHOLDS.ankles;
    if (key.includes("Wrist")) return THRESHOLDS.wrists;
    return 0.1; // Default
  }

  //   const onPoseResults = useCallback((results) => {
  //     if (!results.poseLandmarks) return;

  //     const currentTime = Date.now(); // Get current timestamp
  //     if (currentTime - lastLogTime < LOG_INTERVAL) return; // Skip if not enough time has passed
  //     setLastLogTime(currentTime); // Update last log time

  //     console.log("Detected Pose Landmarks:", results.poseLandmarks);

  //     // Continue with pose detection...
  //   }, [lastLogTime]);

  const [feedback, setFeedback] = useState("Align your pose...");

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.1,
      minTrackingConfidence: 0.1,
    });

    pose.onResults(onPoseResults);

    if (videoRef.current) {
      const camera = new cam.Camera(videoRef.current, {
        onFrame: async () => {
          await pose.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []);

  const correctPose = {
    leftShoulder: { x: 0.548, y: 0.279 },
    rightShoulder: { x: 0.457, y: 0.28 },
    leftHip: { x: 0.505, y: 0.536 },
    rightHip: { x: 0.444, y: 0.511 },
    leftKnee: { x: 0.486, y: 0.726 },
    rightKnee: { x: 0.363, y: 0.552 },
    leftAnkle: { x: 0.477, y: 0.89 },
    rightAnkle: { x: 0.435, y: 0.694 },
  };

  const logPoseData = (results) => {
    console.log("Detected Pose Landmarks:", results.poseLandmarks);
  };

  const onPoseResults = useCallback(
    (results) => {
      if (!results.poseLandmarks) return; // Exit if no pose detected

      const landmarks = results.poseLandmarks;

      // Extract user keypoints (Use fallback `{}` to avoid undefined errors)
      const updatedUserPose = {
        leftShoulder: landmarks[11] || {},
        rightShoulder: landmarks[12] || {},
        leftHip: landmarks[23] || {},
        rightHip: landmarks[24] || {},
        leftKnee: landmarks[25] || {},
        rightKnee: landmarks[26] || {},
        leftAnkle: landmarks[27] || {},
        rightAnkle: landmarks[28] || {}, // Add right ankle if needed
      };

      setUserPose(updatedUserPose); // ✅ Save pose in state

      // 🔥 Fix: Validate Keypoints Before Comparing `.x` and `.y`
      let correctPoints = 0;
      let totalPoints = Object.keys(correctPose).length;

      for (let key in correctPose) {
        if (
          !updatedUserPose[key] ||
          updatedUserPose[key].x === undefined ||
          updatedUserPose[key].y === undefined
        ) {
          continue; // Ignore missing keypoints
        }

        const dx = Math.abs(correctPose[key].x - updatedUserPose[key].x);
        const dy = Math.abs(correctPose[key].y - updatedUserPose[key].y);

        if (dx <= getThreshold(key) && dy <= getThreshold(key)) {
            console.log(`${key} is misaligned (dx: ${dx.toFixed(2)}, dy: ${dy.toFixed(2)})`);
          correctPoints++;
        }
      }

      const accuracy = (correctPoints / totalPoints) * 100;
      setFeedback(`Pose Accuracy: ${accuracy.toFixed(2)}%`);

      // setFeedback(isCorrect ? "Great Tree Pose!" : "Adjust your posture.");
      drawPose(results);
    },
    [drawPose]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      console.log("User Pose:", userPose);
    }, 30000000);
  });
  function drawPose(results) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;

    results.poseLandmarks.forEach((landmark) => {
      ctx.beginPath();
      ctx.arc(
        landmark.x * canvas.width,
        landmark.y * canvas.height,
        5,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = "blue";
      ctx.fill();
      ctx.stroke();
    });

    console.log("Detected Pose Landmarks:", results.poseLandmarks);
  }

  return (
    <>
      <div style={{ textAlign: "center", padding: "20px" }}>
        <h2>Yoga Pose Detector</h2>
        {/* <div>
          <h3>Keypoint Accuracy</h3>
          <ul>
            {Object.keys(correctPose).map((key) => (
              <li key={key}>
                {key}:{" "}
                {Math.abs(correctPose[key].x - userPose[key].x).toFixed(2)},
                {Math.abs(correctPose[key].y - userPose[key].y).toFixed(2)}
              </li>
            ))}
          </ul>
        </div> */}

        <p>{feedback}</p>
        <video ref={videoRef} autoPlay playsInline></video>
        <canvas
          ref={canvasRef}
          width="640"
          height="480"
          style={{ border: "1px solid black" }}
        ></canvas>
      </div>
    </>
  );
};

export default YogaPoseDetector;
