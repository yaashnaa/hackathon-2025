import React from "react";
import { motion } from "framer-motion";
import LandingPageImg from "../assets/landingpageimg-removebg-preview.png";
import "../styles/templandingPage.css";
import ParticleBackground from "./particleBackground"; // Move this import after others

const tempLandingPage = () => {
  return (
    <>
     <ParticleBackground />
    <motion.h1
        style={{ fontSize: "7rem", fontWeight: "bold", marginBottom: "20px" }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        ZenPose
      </motion.h1>
  
    <div className='main-content'>
    <p>
        Test your yoga skills! Complete as many yoga poses as possible in{" "}
        <strong>one minute</strong> to earn points. The AI will track your poses
        and score you in real-time.
      </p>
        <img src={LandingPageImg} alt="Landing Page" />
        <button className='button-74'> Start Game</button>
        </div>
    </>
  )
}

export default tempLandingPage