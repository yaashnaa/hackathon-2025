import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
// Register WebGL backend.
import '@tensorflow/tfjs-backend-webgl';

// Styled Components
const VideoContainer = styled.div`
  position: relative;
  width: 640px;
  height: 480px;
  border: 2px solid #000; /* Optional: Add a border */
  background: #333; /* Optional: Add a background color */
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

const VideoFeed = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const flipCanvasRef = useRef(null); // Hidden canvas for flipping the video
  const [detector, setDetector] = useState(null);

  // Load the pose detection model
  useEffect(() => {
    const loadModel = async () => {
      await tf.setBackend('webgl');
      const model = poseDetection.SupportedModels.MoveNet;
      const detectorConfig = {
        runtime: 'mediapipe'
      };
      const detector = await poseDetection.createDetector(model, detectorConfig);
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
      let playPromise = video.play()

      if (playPromise !== undefined) {
        playPromise.then(_ => {
          // Automatic playback started!
          // Show playing UI.
        })
        .catch(error => {
          // Auto-play was prevented
          // Show paused UI.
        });
      }
    };

    startVideo();
  }, []);

  // Detect poses and draw keypoints on the canvas
  const detectPoses = async () => {
    if (detector && videoRef.current && canvasRef.current && flipCanvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const flipCanvas = flipCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const flipCtx = flipCanvas.getContext('2d');

      // Clear the flip canvas
      flipCtx.clearRect(0, 0, flipCanvas.width, flipCanvas.height);

      // Draw the flipped video onto the hidden canvas
      flipCtx.save();
      flipCtx.scale(-1, 1); // Flip horizontally
      flipCtx.translate(-flipCanvas.width, 0); // Move the canvas back into view
      flipCtx.drawImage(video, 0, 0, flipCanvas.width, flipCanvas.height);
      flipCtx.restore();

      // Detect poses using the flipped video
      const poses = await detector.estimatePoses(flipCanvas);

      // Draw keypoints on the main canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      poses.forEach((pose) => {
        pose.keypoints.forEach((keypoint) => {
          if (keypoint.score > 0.5) {
            ctx.beginPath();
            ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
          }
        });
      });
    }
  };

  // Run pose detection at regular intervals
  useEffect(() => {
    const interval = setInterval(() => {
      detectPoses();
    }, 100);

    return () => clearInterval(interval);
  }, [detector]);

  return (
    <VideoContainer>
      <VideoElement
        ref={videoRef}
        width="640"
        height="480"
        autoPlay
        muted
      />
      <CanvasElement
        ref={canvasRef}
        width="640"
        height="480"
      />
      {/* Hidden canvas for flipping the video */}
      <canvas
        ref={flipCanvasRef}
        width="640"
        height="480"
        style={{ display: 'none' }} // Hide the canvas
      />
    </VideoContainer>
  );
};

export default VideoFeed;