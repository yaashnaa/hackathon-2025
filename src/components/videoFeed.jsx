import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
// Register WebGL backend.
import '@tensorflow/tfjs-backend-webgl';

import comparePoses from '../utils/comparePoses';
import correctPoses from '../utils/constants';

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

const VideoFeed = ({isPoseCorrect, setIsPoseCorrect, videoRef, canvasRef, captureScreenshot}) => {
  const flipCanvasRef = useRef(null); // Hidden canvas for flipping the video
  const [detector, setDetector] = useState(null);
  const [currentDetection, setCurrentDetection] = useState(false);
  const [previousDetection, setPreviousDetection] = useState(false);
  const timerRef = useRef(null);
  const debounceDuration = 1000;

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
      let playPromise = video.play();

      if (playPromise !== undefined) {
        playPromise.then(() => {
          // Automatic playback started!
          // Show playing UI.
        })
          .catch((error) => {
            // Auto-play was prevented
            // Show paused UI.
        });
      };
    };

    startVideo();
  }, []);

  // Detect poses
  const detectPoses = async () => {
    if (detector && videoRef.current && canvasRef.current && flipCanvasRef.current) {
      const video = videoRef.current;
      const flipCanvas = flipCanvasRef.current;
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

      if (poses.length > 0) {
        const currentPose = poses[0]?.keypoints?.slice(5);
        console.log("Current Pose:", currentPose);
        const similarity = comparePoses(currentPose, correctPoses[0].slice(5), 0.8);
        const match = similarity > 0.8;
        setCurrentDetection(match);
        }
      }
    }

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
      <div>
        <h2>Is the pose correct?</h2>

        <p style={{ fontSize: '6rem' }}>
          {}
          {isPoseCorrect ? 'Yes' : 'No'}
        </p>
      </div>
    </>
  );
};


export default VideoFeed;