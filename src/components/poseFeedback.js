import React, { useState, useEffect, useContext } from "react";
import CaptureImage from "./captureImage";
import { ImageContext } from "../context/imageContext";
const PoseFeedback = () => {
    const { correctPoseImages } = useContext(ImageContext);
  const [feedback, setFeedback] = useState("");
  const [userImage, setUserImage] = useState(null);

  const [model, setModel] = useState("gemini-1.5-pro");

  
  const handleImageCapture = (imageBase64) => {
    console.log("✅ Image captured:", imageBase64);
    setUserImage(imageBase64); // Store captured image in state
  };
//   console.log("User Image (raw):", userImage);
  console.log("Correct Pose (raw):", correctPoseImages[0]);
//   console.log("Correct Pose Array:", correctPoseImages);


  const sendToGemini = async () => {
    if (!userImage || correctPoseImages.length === 0) {
      console.error("❌ No user image captured or no correct pose images");
      return;
    }
  
    const API_KEY = process.env.REACT_APP_API_KEY;
    // For example, pick the first correct pose
    
    const rawCorrectPose = correctPoseImages[0];    // e.g. "/9j/4AAQ..."
    const rawUserImage = userImage;                 // e.g. "iVBORw0K..."
  
    // Re-add prefix if needed
    // const correctPoseWithPrefix = `data:image/png;base64,${rawCorrectPose}`;
    // const userImageWithPrefix = `data:image/png;base64,${rawUserImage}`;
    const correctPoseWithPrefix = `${rawCorrectPose}`;
    const userImageWithPrefix = `${rawUserImage}`;
  
    // console.log("🔎 final correct pose:", correctPoseWithPrefix.slice(0,100)); // partial log
    // console.log("🔎 final user image:", userImageWithPrefix.slice(0,100));
    // console.log("🕵️ Checking final correct pose:", rawCorrectPose.slice(0, 50));
    // console.log("🕵️ Checking final user image:", rawUserImage.slice(0, 50));
    
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            { text: "Compare these two images. The first is correct, the second is user’s. Provide feedback on the posture and mistakes on the second picture in 2 sentance ." },
            { inline_data: { mime_type: "image/png", data: correctPoseWithPrefix } },
            { inline_data: { mime_type: "image/png", data: userImageWithPrefix } },
          ],
        },
      ],
    };
    console.log("Using Gemini model:", "gemini-1.5-pro");

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );
  
      const data = await response.json();
      console.log("✅ Gemini API Response:", data);
  
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error("No valid response from Gemini.");
      }
  
      setFeedback(data.candidates[0].content.parts[0].text);
    } catch (error) {
      console.error("❌ Error sending image to Gemini:", error);
      setFeedback("Error fetching feedback from Gemini.");
    }
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
