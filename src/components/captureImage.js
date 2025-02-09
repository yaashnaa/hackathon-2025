import React, { useState, useRef } from "react";
import correctTree from "../assets/correctTree.jpg";
import correctTriangle from "../assets/correctTriangle.jpg";
import correctWarrior from "../assets/correctWarrior.jpg";

// Image is being captured manually for now, replace later with screenshot function 

const CaptureImage = ({ onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
    const [image, setImage] = useState(null);
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Convert to Base64
    const base64String = canvas.toDataURL("image/png").split(",")[1]; // Remove header

    if (typeof onCapture === "function") {  // ✅ Check if `onCapture` is a function before calling
      onCapture(base64String);
      console.log('captured image');
      console.log(base64String);
    } else {
      console.error("❌ onCapture is not a function");
    }
  };

  return (
    <div>
      <video ref={videoRef} autoPlay width="640" height="480"></video>
      <canvas ref={canvasRef} width="640" height="480" style={{ display: "none" }}></canvas>
      <button onClick={startCamera}>Start Camera</button>
      <button onClick={captureImage}>Capture Image</button>
    </div>
  );
};

export default CaptureImage;
