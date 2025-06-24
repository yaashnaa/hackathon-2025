import { useState, useEffect, useRef, useContext } from "react";
import "../styles/yogaPage.css";
// import heartRate from "../assets/heartRate.jpg";
import yogaPose1 from "../assets/correctTree.jpg";
import yogaPose2 from "../assets/correctWarrior.jpg";
import yogaPose3 from "../assets/correctTriangle.jpg";
import yogaPose4 from "../assets/correcthalfmoon.jpg";
import yogaPose5 from "../assets/correctsanskrit.jpg";
import ProgressBar from "react-bootstrap/ProgressBar";
import "bootstrap/dist/css/bootstrap.min.css";
import plant from "../assets/plant.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import timerSound from "../assets/timerSound.mp3";
import PoseFeedback from "./poseFeedback";
import { ImageContext } from "../context/imageContext";

export default function YogaPage() {
  const [timer, setTimer] = useState(15);
  const [paused, setPaused] = useState(false);
  const [points, setPoints] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const images = [yogaPose1, yogaPose2, yogaPose3, yogaPose4, yogaPose5];

  const [currentImage, setCurrentImage] = useState(images[0]); // ✅ fix here

  // const [currentImage, setCurrentImage] = useState(heartRate);
  const videoRef = useRef(null);
  const audioRef = useRef(new Audio(timerSound));
  const [poseProgress, setPoseProgress] = useState(0); // value from 0 to 1

  const [hasMatched, setHasMatched] = useState(false);
  const [poseIndex, setPoseIndex] = useState(0);

  const [pausedByModal, setPausedByModal] = useState(false);

  const handlePauseTimer = () => {
    setPaused(true);
    setPausedByModal(true);
  };

  const handleResumeTimer = () => {
    setPaused(false);
    setPausedByModal(false);
  };
  useEffect(() => {
    if (!paused && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
    if (timer === 0) {
      setTimeout(() => {
        setTimer(15);
        setHasMatched(false);
        setPoseIndex((prev) => {
          const nextIndex = prev + 1;
          if (nextIndex >= images.length) {
            setGameOver(true);
            setPaused(true);
            return prev; // Stay on last pose
          }
          return nextIndex;
        });
        audioRef.current.play();
      }, 1000);
    }
  }, [paused, timer, points]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <>
      <div className="navbar">
        <button className="nav-button" onClick={() => window.history.back()}>
          <FontAwesomeIcon icon="fa-solid fa-arrow-left" />
        </button>
        <span className="timer">{formatTime(timer)}</span>
        <button className="nav-button" onClick={() => setPaused(!paused)}>
          {paused ? (
            <FontAwesomeIcon icon="fa-solid fa-play" />
          ) : (
            <FontAwesomeIcon
              icon="fa-solid fa-pause"
              style={{ color: "#ffffff" }}
            />
          )}
        </button>
      </div>
      <div className="score-container">
        <h3>Points: {points}</h3>
      </div>
      <div className="yoga-container">
        <div className="content-container">
          <div className="left-section">
            <div className="image-container">
              <img
                src={images[poseIndex]}
                alt="Yoga Pose"
                className="pose-image"
              />
            </div>
            {/* <div className="image-container">
              <img src={plant} alt="Decorative Plant" className="plant-image" />
            </div> */}
            <div className="progess"></div>
          </div>

          <div className="right-section">
            <div className="background">
              <PoseFeedback
                poseIndex={poseIndex}
                hasMatched={hasMatched}
                onPauseTimer={handlePauseTimer}
                onSimilarityUpdate={setPoseProgress} 
                onResumeTimer={handleResumeTimer}
                onFeedbackComplete={() => {
          
                  setPoints((prev) => prev + 1);

           
                  const next = poseIndex + 1;
                  if (next >= images.length) {
                    setGameOver(true);
                    setPaused(true);
                    return;
                  }
                  setPoseIndex(next);

                  // 3️⃣ reset timer & un-pause
                  setTimer(15);
                  setPaused(false);
                  setHasMatched(false);

                  // 4️⃣ play your alert sound
                  audioRef.current.play();
                }}
              />
            </div>

            <div className="progress-bar-container">
              <ProgressBar
                style={{
                  backgroundColor: "#f0f0f0",
                  // height: "1.5rem",
                  borderRadius: "10px",
                }}
                now={Math.round(poseProgress * 100)}
                label={`${Math.round(poseProgress * 100)}%`}
              />
              <div
                className="similarity-score"
                style={{ marginTop: "0.5rem", fontSize: "1.2rem" }}
              >
                Similarity Score:{" "}
                <strong>{Math.round(poseProgress * 100)}%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
      {gameOver && (
        <div className="pose-modal">
          <div className="modal-content">
            <h2>Well done!</h2>
            <p>You completed all poses.</p>
            <h3>Total Points: {points}</h3>
            <button
              onClick={() => {
                setPoints(0);
                setPoseIndex(0);
                setCurrentImage(images[0]);
                setTimer(15);
                setGameOver(false);
                setHasMatched(false);
                setPaused(false);
              }}
              className="nav-button"
              style={{
                backgroundColor: "var(--primary)",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
              }}
            >
              Restart
            </button>
          </div>
        </div>
      )}
    </>
  );
}
