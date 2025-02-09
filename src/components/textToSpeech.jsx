import React, { useState, useEffect } from "react";

const TextToSpeechComponent = () => {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  useEffect(() => {
    const populateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    populateVoices();
    window.speechSynthesis.onvoiceschanged = populateVoices;
  }, []);

  const textToSpeech = () => {
    if (text.trim() === "") return;
    const speechSynthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);

    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) utterance.voice = voice;

    speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Text-to-Speech Converter</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text here..."
        style={{ display: "block", margin: "10px auto", width: "80%", height: "100px" }}
      />
      <div>
        <label>Select Voice: </label>
        <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)}>
          {voices.map((voice, index) => (
            <option key={index} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </div>
      <button onClick={textToSpeech} disabled={!text.trim()}>
        Play Text
      </button>
    </div>
  );
};

export default TextToSpeechComponent;
