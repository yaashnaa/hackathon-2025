import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "../styles/landingPage.css";
import "../App.css";
import NightImage from "../assets/night-removebg-preview.png";
import HeartRate from "../assets/heartRate-removebg-preview.png";
import MorningImg from "../assets/morning-removebg-preview.png";
import VideoFeed from "./videoFeed";
export default function ZenPose() {
  const [gameStarted, setGameStarted] = useState(false);
  const navigate = useNavigate(); 
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <motion.h1
        style={{ fontSize: "7rem", fontWeight: "bold", marginBottom: "20px" }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        ZenPose
      </motion.h1>
      <p>
        Test your yoga skills! Complete as many yoga poses as possible in{" "}
        <strong>one minute</strong> to earn points. The AI will track your poses
        and score you in real-time.
      </p>
      <VideoFeed />
      <div className="options">
        <div className="button-81" onClick={() => navigate("/yoga")} style={{ cursor: "pointer" }}>
          <div className="options-image">
            Morning Revival
            <div className="image-container">
              <img src={MorningImg} alt="Yoga pose" />
            </div>
          </div>
        </div>
        <div className="button-81">
          {" "}
          <div className="options-image">
            HeartRate Revival
            <div className="image-container">
              <img src={HeartRate} alt="Yoga pose" />
            </div>
          </div>
        </div>
        <div className="button-81">
          <div className="options-image">
            Wind down
            <div className="image-container">
              <img src={NightImage} alt="Yoga pose" />
            </div>
          </div>
        </div>
      </div>

      {/* <motion.button
        style={{ backgroundColor: "#28a745", color: "white", padding: "12px 24px", borderRadius: "8px", fontSize: "1.2rem", fontWeight: "bold", border: "none", cursor: "pointer", transition: "all 0.3s" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setGameStarted(true)}
      >
        {gameStarted ? "Game In Progress..." : "Start Game"}
      </motion.button>
      <div style={{ marginTop: "30px", fontSize: "1rem", textAlign: "center", maxWidth: "500px", backgroundColor: "white", color: "black", padding: "16px", borderRadius: "10px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
        <h2 style={{ fontWeight: "bold", fontSize: "1.5rem", marginBottom: "10px" }}>How to Play</h2>
        <ul style={{ textAlign: "left", paddingLeft: "20px" }}>
          <li>Stand in front of your webcam.</li>
          <li>The AI will recognize and validate your yoga poses.</li>
          <li>Each successfully held pose gives points.</li>
          <li>Try to complete as many as possible in 60 seconds!</li>
        </ul>
      </div> */}
    </div>
  );
}
