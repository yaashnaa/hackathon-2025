import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
// Register WebGL backend.
import "@tensorflow/tfjs-backend-webgl";
import { computePoseSimilarity } from "../utils/comparePoses";

import comparePoses from "../utils/comparePoses";
import correctPoses from "../utils/constants";
function calculateAngle(p1, p2, p3) {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

  const angleRad = Math.acos(dot / (mag1 * mag2));
  return angleRad * (180 / Math.PI);
}

// Styled Components
function drawAngles(ctx, keypoints) {
  const angleTriplets = [
    ["left_hip", "left_knee", "left_ankle"],
    ["right_hip", "right_knee", "right_ankle"],
    ["left_shoulder", "left_elbow", "left_wrist"],
    ["right_shoulder", "right_elbow", "right_wrist"],
  ];

  angleTriplets.forEach(([p1, p2, p3]) => {
    const pt1 = keypoints.find((k) => k.name === p1);
    const pt2 = keypoints.find((k) => k.name === p2);
    const pt3 = keypoints.find((k) => k.name === p3);

    if (
      pt1 &&
      pt2 &&
      pt3 &&
      pt1.score > 0.5 &&
      pt2.score > 0.5 &&
      pt3.score > 0.5
    ) {
      const angle = calculateAngle(pt1, pt2, pt3);

      // Draw lines
      ctx.strokeStyle = "lime";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pt1.x, pt1.y);
      ctx.lineTo(pt2.x, pt2.y);
      ctx.lineTo(pt3.x, pt3.y);
      ctx.stroke();

      // Draw angle text
      ctx.fillStyle = "yellow";
      ctx.font = "14px Arial";
      ctx.fillText(`${Math.round(angle)}°`, pt2.x + 5, pt2.y - 5);
    }
  });
}

const VideoContainer = styled.div`
  position: relative;
  width: 640px;
  height: 500px;
`;

const VideoElement = styled.video`
  transform: scaleX(-1); /* Flip the video horizontally */
  width: 100%; /* Make the video fill the container */
  height: 100%;
`;

const CanvasElement = styled.canvas`
  position: absolute; /* Position the canvas absolutely within the container */
  top: 0;
  left: 0;
  width: 100%; /* Make the canvas fill the container */
  height: 100%;
  pointer-events: none; /* Allow clicks to pass through to the video */
`;

const VideoFeed = ({
  isPoseCorrect,
  setIsPoseCorrect,
  videoRef,
  canvasRef,
  poseIndex,
  captureScreenshot,
  onSimilarityUpdate,
}) => {
  const flipCanvasRef = useRef(null); // Hidden canvas for flipping the video
  const [detector, setDetector] = useState(null);
  const [currentDetection, setCurrentDetection] = useState(false);
  const [previousDetection, setPreviousDetection] = useState(false);
  const timerRef = useRef(null);
  const debounceDuration = 1000;
  const matchHistoryRef = useRef([]);

  useEffect(() => {
    if (currentDetection !== previousDetection) {
      setPreviousDetection(currentDetection);
      clearTimeout(timerRef.current);

      if (currentDetection) {
        setIsPoseCorrect(true);
      } else {
        timerRef.current = setTimeout(() => {
          setIsPoseCorrect(false);
        }, debounceDuration);
      }
    }
  }, [currentDetection, previousDetection, isPoseCorrect]);

  // Load the pose detection model
  useEffect(() => {
    const loadModel = async () => {
      await tf.setBackend("webgl");
      const model = poseDetection.SupportedModels.MoveNet;
      const detectorConfig = {
        runtime: "mediapipe",
      };
      const detector = await poseDetection.createDetector(
        model,
        detectorConfig
      );
      setDetector(detector);
    };

    loadModel();
  }, []);

  // Start the video stream
  useEffect(() => {
    const startVideo = async () => {
      const video = videoRef.current;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      video.srcObject = stream;
      let playPromise = video.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Automatic playback started!
            // Show playing UI.
          })
          .catch((error) => {
            // Auto-play was prevented
            // Show paused UI.
          });
      }
    };

    startVideo();
  }, []);

  // Detect poses
  const detectPoses = async () => {
    if (
      detector &&
      videoRef.current &&
      canvasRef.current &&
      flipCanvasRef.current
    ) {
      const video = videoRef.current;
      const flipCanvas = flipCanvasRef.current;
      const flipCtx = flipCanvas.getContext("2d");

      // Clear and flip canvas
      flipCtx.clearRect(0, 0, flipCanvas.width, flipCanvas.height);
      flipCtx.save();
      flipCtx.scale(-1, 1);
      flipCtx.translate(-flipCanvas.width, 0);
      flipCtx.drawImage(video, 0, 0, flipCanvas.width, flipCanvas.height);
      flipCtx.restore();

      // Detect poses
      const poses = await detector.estimatePoses(flipCanvas);
      if (poses.length > 0) {
        const currentPose = poses[0]?.keypoints?.slice(5);
        const drawCtx = canvasRef.current.getContext("2d");
        drawCtx.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        drawAngles(drawCtx, poses[0].keypoints);

        const referencePose = correctPoses[poseIndex];
        const similarity = computePoseSimilarity(currentPose, referencePose, {
          angleWeight: 0.8,
          distanceWeight: 0.4,
          confidenceThreshold: 0.7,
        });
        console.log("Current Pose:", currentPose);
        console.log("🧍 Detected poses:", poses);
        console.log("📊 Similarity Score:", similarity);
        onSimilarityUpdate?.(similarity);
        const keypoints = poses[0].keypoints;
        console.log("🔍 Keypoints:", keypoints);
        const match = similarity >= 0.73;

        // Pose hold smoothing logic
        const now = Date.now();
        matchHistoryRef.current.push({ time: now, match });

        // Keep only matches within the last 1500ms
        matchHistoryRef.current = matchHistoryRef.current.filter(
          (entry) => now - entry.time < 1500
        );

        const recentValid = matchHistoryRef.current.filter(
          (entry) => entry.match
        );

        const isMatchStable = recentValid.length >= 2;
        setCurrentDetection(isMatchStable);

        console.log("✅ Pose match (stable):", isMatchStable);
      }
    }
  };

  // Run pose detection at regular intervals
  useEffect(() => {
    const interval = setInterval(() => {
      detectPoses();
    }, 1000);

    return () => clearInterval(interval);
  }, [detector]);

  return (
    <>
      <VideoContainer>
        <VideoElement ref={videoRef} width="640" height="480" autoPlay muted />
        <CanvasElement ref={canvasRef} width="640" height="480" />

        <canvas
          ref={flipCanvasRef}
          width="640"
          height="480"
          style={{ display: "none" }} // Hide the canvas
        />
      </VideoContainer>
      {/* <div>
        <h2>Is the pose correct?</h2>

        <p style={{ fontSize: "6rem" }}>
          {}
          {isPoseCorrect ? "Yes" : "No"}
        </p>
      </div> */}
    </>
  );
};

export default VideoFeed;
