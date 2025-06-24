import React, { useState, useEffect, useRef, useContext } from "react";
import styled from "styled-components";
import { ElevenLabsClient } from "elevenlabs";
import VideoFeed from "./videoFeed";
import { ImageContext } from "../context/imageContext";

const FeedbackContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  /* margin-top: 2rem; */
`;

export default function PoseFeedback({
  poseIndex = 0,
  onFeedbackComplete,
  hasMatched,
  onPauseTimer,
  onResumeTimer,
  onSimilarityUpdate,
}) {
  const [lockedReference, setLockedReference] = useState(null);
  const { correctPoseImages } = useContext(ImageContext);
  const [referenceBase64, setReferenceBase64] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [isPoseCorrect, setIsPoseCorrect] = useState(false);
  const captureTimerRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const captureDuration = 1000;
  const [showModal, setShowModal] = useState(false);
  const [userScreenshot, setUserScreenshot] = useState(null);
  const [lockedPoseIndex, setLockedPoseIndex] = useState(poseIndex);

  const [similarityScore, setSimilarityScore] = useState(0);

  // const client = new ElevenLabsClient({
  //   apiKey: process.env.REACT_APP_AI_VOICE_API_KEY,
  // });
  useEffect(() => {
    setFeedback("");
  }, [poseIndex]);

  useEffect(() => {
    if (correctPoseImages.length > 0) {
      setReferenceBase64(correctPoseImages[poseIndex]);
    }
  }, [correctPoseImages, poseIndex]);

  useEffect(() => {
    if (isPoseCorrect) {
      captureTimerRef.current = setTimeout(() => {
        captureScreenshot();
      }, captureDuration);
    } else {
      clearTimeout(captureTimerRef.current);
    }
  }, [isPoseCorrect]);

  // useEffect(() => {
  //   if (feedback) {
  //     handleTextRead(feedback);
  //   }
  // }, [feedback]);

  //   useEffect(() => {
  //     if (aiRecording) {
  //  const audio = new Audio(aiRecording);
  // audio.play();
  //     }
  //   }, [aiRecording]);

  const captureScreenshot = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || showModal) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    const dataUrl = canvas.toDataURL("image/png");
    const base64image = dataUrl.replace(/^data:image\/png;base64,/, "");
    console.log("🖼️ Captured screenshot, sending:", {
      poseIndex,
      lockedPoseIndex,
      referenceBase64,
      base64image: base64image.slice(0, 50) + "…", // just to confirm it’s non-empty
    });

    // lock both poseIndex and the exact reference you’re using
    setLockedPoseIndex(poseIndex);
    setLockedReference(referenceBase64);

    setUserScreenshot(dataUrl);
    sendToGemini(base64image);

    setShowModal(true);
    onPauseTimer?.();
  };

  // const handleTextRead = async (text) => {
  //   const audio = await client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
  //     text: text,
  //     model_id: "eleven_multilingual_v2",
  //     output_format: "mp3_44100_128",
  //   });
  //   setAiRecording(audio);
  // };

  const sendToGemini = async (userImage) => {
    if (!userImage || !referenceBase64) {
      console.error("❌ Missing user or reference image.");
      return;
    }
    if (hasMatched) return;
    const prompt = `
      You are a very encouraging yoga instructor. You are teaching a yoga class and
      your student is trying to do a yoga pose. The first image is the reference of
      the yoga pose, and the second image is the student. Ignoring everything except
      for the form of the figures in each of the images, compare the student's form
      to the reference pose. Give the student some encouraging feedback on if they are
      posing correctly, or what they can do differently if they are not matching
      the reference pose. Keep your feedback concise and limit yourself to a maximum
      of 3 sentences.
    `;

    const API_KEY = process.env.REACT_APP_API_KEY;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inline_data: { mime_type: "image/png", data: referenceBase64 } },
            { inline_data: { mime_type: "image/png", data: userImage } },
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
      const feedbackText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log("✅ Gemini Response:", data);
      if (!feedbackText) {
        console.warn("No valid feedback returned.");
        setFeedback("Couldn't generate feedback.");
        return;
      }

      setFeedback(feedbackText);

      // ✅ Notify YogaPage to update pose
      // if (typeof onFeedbackComplete === "function") {
      //   onFeedbackComplete();
      // }
    } catch (err) {
      console.error("❌ Gemini error:", err);
      setFeedback("Error retrieving feedback.");
    }
  };

  return (
    <FeedbackContainer>
      <VideoFeed
        isPoseCorrect={isPoseCorrect}
        setIsPoseCorrect={setIsPoseCorrect}
        videoRef={videoRef}
        canvasRef={canvasRef}
        poseIndex={poseIndex}
        captureScreenshot={captureScreenshot}
        onSimilarityUpdate={(score) => {
          setSimilarityScore(score); 
          onSimilarityUpdate?.(score); 
        }}
      />
      {showModal && (
        <div className="pose-modal">
          <div className="modal-content">
            <h2>Nice pose! Here's your feedback</h2>
            <div className="modal-images">
              <div>
                <h4>Reference</h4>
                <img
                  alt="Reference Pose"
                  src={`data:image/png;base64,${referenceBase64}`}
                />
              </div>
              <div>
                <h4>Your Pose</h4>
                <img src={userScreenshot} alt="Your pose" />
              </div>
            </div>
            {feedback ? (
              <p>{feedback}</p>
            ) : (
              <p className="muted">Hold your pose...</p>
            )}
            <button
              onClick={() => {
                setShowModal(false);
                onResumeTimer?.();
                onFeedbackComplete?.(); // advance to next pose
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </FeedbackContainer>
  );
}
