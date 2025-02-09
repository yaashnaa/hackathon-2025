import { useState, useEffect, useRef } from "react";
import "../styles/yogaPage.css"; // Ensure this is the correct path
import heartRate from "../assets/heartRate.jpg";
import yogaPose1 from "../assets/correctTree.jpg"; // Add multiple yoga poses
import yogaPose2 from "../assets/correctWarrior.jpg";
import yogaPose3 from "../assets/correctTriangle.jpg";
import yogaPose4 from "../assets/correcthalfmoon.jpg";
import yogaPose5 from "../assets/correctsanskrit.jpg";
import ProgressBar from "react-bootstrap/ProgressBar";
import "bootstrap/dist/css/bootstrap.min.css";
import plant from "../assets/plant.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import timerSound from "../assets/timerSound.mp3"; // Ensure this sound file exists

export default function YogaPage() {
  const [timer, setTimer] = useState(15); // 15-second timer
  const [paused, setPaused] = useState(false);
  const [points, setPoints] = useState(0); // Points tracking
  const [currentImage, setCurrentImage] = useState(heartRate); // Track displayed image
  const videoRef = useRef(null);
  const audioRef = useRef(new Audio(timerSound)); // Sound effect reference

  // Array of images to cycle through
  const images = [heartRate, yogaPose1, yogaPose2, yogaPose3];

  // Timer countdown logic
  useEffect(() => {
    if (!paused && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }

    if (timer === 0) {
      setTimeout(() => {
        setTimer(15); // Reset timer
        setPoints((prevPoints) => prevPoints + 1); // Add point on reset
        setCurrentImage(images[(points + 1) % images.length]); // Change image
        audioRef.current.play(); // Play sound
      }, 1000); // Delay reset by 1 sec to avoid flickering
    }
  }, [paused, timer, points]);

  // Get webcam feed
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Error accessing webcam:", err));
  }, []);

  // Format time to MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Calculate progress percentage
  const progress = ((15 - timer) / 15) * 100;

  return (
    <>
      {/* Navbar at the Top */}
      <div className="navbar">
        <button className="nav-button" onClick={() => window.history.back()}>
          <FontAwesomeIcon icon="fa-solid fa-arrow-left" />
        </button>
        <span className="timer">{formatTime(timer)}</span>
        <button className="nav-button" onClick={() => setPaused(!paused)}>
          {paused ? <FontAwesomeIcon icon="fa-solid fa-play" /> : <FontAwesomeIcon icon="fa-solid fa-pause" style={{color: "#ffffff",}} />}
        </button>
      </div>

      {/* Main Container */}
      <div className="yoga-container">
        <div className="content-container">
          {/* Left Section: Pose Image on Top, Plant Below */}
          <div className="left-section">
            <div className="image-container">
              <img src={currentImage} alt="Yoga Pose" className="pose-image" />
            </div>
            <div className="image-container">
              <img src={plant} alt="Decorative Plant" className="plant-image" />
            </div>
            <div className="score-container">
              <h3>Points: {points}</h3>
            </div>
            {/* Progress Bar at the Bottom */}
            <div className="progress-bar-container">
              <ProgressBar now={progress} label={`${Math.round(progress)}%`} />
            </div>

        
         
          </div>

          {/* Right Section: Webcam */}
          <div className="right-section">
            <div className="video-container">
              <video ref={videoRef} autoPlay playsInline className="webcam-feed"></video>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
