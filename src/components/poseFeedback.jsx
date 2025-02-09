import React, { useState, useEffect, useContext, useRef, use } from "react";
import { ElevenLabsClient, play } from "elevenlabs";
// import CaptureImage from "./captureImage";
import VideoFeed from "./videoFeed";
import { ImageContext } from "../context/imageContext";
import styled from "styled-components";
const PoseFeedback = () => {
  console.log(process.env.REACT_APP_AI_VOICE_API_KEY);
  const client = new ElevenLabsClient({
    apiKey: process.env.REACT_APP_AI_VOICE_API_KEY,
  });

  const { correctPoseImages } = useContext(ImageContext);
  const [feedback, setFeedback] = useState("");
  // const [userImage, setUserImage] = useState(null);
  const [isPoseCorrect, setIsPoseCorrect] = useState(false);
  const [aiRecording, setAiRecording] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const captureTimerRef = useRef(null);
  const captureDuration = 1000;

  // Effect to handle screenshot capture
  useEffect(() => {
    if (isPoseCorrect) {
      captureTimerRef.current = setTimeout(() => {
        captureScreenshot();
      }, captureDuration);
    } else {
      clearTimeout(captureTimerRef.current);
    }
  }, [isPoseCorrect]);

  const captureScreenshot = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      const context = canvas.getContext('2d');
      context.save();
      context.scale(-1, 1);
      context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      const base64image = dataUrl.replace(/^data:image\/png;base64,/, '');

      // setUserImage(base64image);

      sendToGemini(base64image);
    }
  }

  
//   const handleImageCapture = (imageBase64) => {
//     console.log("✅ Image captured:", imageBase64);
//     setUserImage(imageBase64); // Store captured image in state
//   };
// //   console.log("User Image (raw):", userImage);
//   console.log("Correct Pose (raw):", correctPoseImages[0]);
// //   console.log("Correct Pose Array:", correctPoseImages);


  const sendToGemini = async (userImage) => {
    if (!userImage || correctPoseImages.length === 0) {
      console.error("❌ No user image captured or no correct pose images");
      return;
    }

    const prompt = `
    You are a very encouraging yoga instructor. You are teaching a yoga class and
    your student is trying to do a yoga pose. The first image is the reference of
    the yoga pose, and the second image is the student. Ignoring everything except
    for the form of the figures in each of the images, compare the student's form
    to the reference pose. Give the student some encouraging feedback on if they are
    posing correctly, or what they can do differently if they are not matching
    the reference pose. Keep your feedback concise and limit yourself to a maximum
    of 3 sentences.
    `
  
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
            { text: prompt },
            { inline_data: { mime_type: "image/png", data: correctPoseWithPrefix } },
            { inline_data: { mime_type: "image/png", data: userImageWithPrefix } },
          ],
        },
      ],
    };

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${API_KEY}`,
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

  useEffect(() => {
    if (feedback) {
      handleTextRead(feedback);
    }
  }, [feedback]);

  useEffect(() => {
    if (aiRecording) {
      play(aiRecording);
    }
  }, [aiRecording]);

  const handleTextRead = async (text) => {
    const audio = await client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
      text: text,
      model_id: "eleven_multilingual_v2",
      output_format: "mp3_44100_128",
    })
    setAiRecording(audio);
  }
  
  return (
    <div>
      <h2>Pose Feedback</h2>
      {/* <CaptureImage onCapture={handleImageCapture} /> */}
      <FeedbackContainer>
        <VideoFeed
          isPoseCorrect={isPoseCorrect}
          setIsPoseCorrect={setIsPoseCorrect}
          videoRef={videoRef}
          canvasRef={canvasRef}
          captureScreenshot={captureScreenshot}
        />
        <p>{feedback}</p>
      </FeedbackContainer>
    </div>
  );
};

const FeedbackContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 2rem;
`

export default PoseFeedback;
