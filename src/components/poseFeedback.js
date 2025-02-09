import React, { useState } from "react";
import CaptureImage from "./captureImage"; // Import the CaptureImage component

const PoseFeedback = () => {
  const [feedback, setFeedback] = useState("");
  const [userImage, setUserImage] = useState(null);
  const handleImageCapture = (imageBase64) => {
    console.log("✅ Image captured:", imageBase64);
    setUserImage(imageBase64); // Store captured image in state
  };
  const sendToGemini = async () => {
    const API_KEY = process.env.REACT_APP_API_KEY; // Replace with your API key
    const correctPoseBase64 = "YOUR_CORRECT_POSE_IMAGE_BASE64"; // Replace with correct pose image

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            { text: "Compare these two images. The first image is the correct yoga pose, and the second image is the user’s pose. Give feedback on alignment, balance, and posture corrections." },
            { inline_data: { mime_type: "image/png", data: correctPoseBase64 } },
            { inline_data: { mime_type: "image/png", data: userImage } },
          ],
        },
      ],
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json();
    setFeedback(data.candidates?.[0]?.content?.parts?.[0]?.text || "No feedback received.");
  };

  return (
    <div>
      <h2>Pose Feedback</h2>
      <CaptureImage onCapture={handleImageCapture} />
      <button onClick={sendToGemini}>Get Pose Feedback</button>
      <p>{feedback}</p>
    </div>
  );
};

export default PoseFeedback;
