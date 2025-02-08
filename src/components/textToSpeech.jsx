import React, { useState } from "react";

const TextToSpeech = () => {
  const [text, setText] = useState("");
  const feedback = {
    positive: [
      "Great job! Keep going!",
      "You're doing amazing!",
      "Try to focus on your breathing.",
      "Stay balanced and centered.",
      "You're improving with each attempt!",
      "Keep a steady posture and relax.",
    ],
    negative: [
      "Don't rush, take your time.",
      "Try to hold your posture correctly.",
      "Focus more on balance.",
      "Make sure to breathe properly.",
      "Keep your back straight to avoid strain.",
    ],
  };

  const textToSpeech = () => {
    if (text.trim() === "") return;
    const speechSynthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  return (
    <>
      <div style={{ textAlign: "center", padding: "20px" }}>
        <h2>Text-to-Speech Converter</h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text here..."
          style={{
            display: "block",
            margin: "10px auto",
            width: "80%",
            height: "100px",
          }}
        />
        <button onClick={textToSpeech} disabled={!text.trim()}>
          Play Text
        </button>
        <h3>Suggested Feedback:</h3>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <div>
            <h4>Positive Feedback</h4>
            <ul>
              {feedback.positive.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Negative Feedback</h4>
            <ul>
              {feedback.negative.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default TextToSpeech;
