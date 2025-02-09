import "./App.css";
import LandingPage from "./components/landingPage";
import TextToSpeech from "./components/textToSpeech";
import CaptureImage from "./components/captureImage";
import PoseFeedback from "./components/poseFeedback";
import { ImageProvider } from "./context/imageContext";
import TempLandingPage from "./components/tempLandingPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import YogaPage from "./components/YogaPage"; 

function App() {
  return (
    <Router>
    <div className="App">

      <TempLandingPage />

      <Routes>
          {/* Define Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/yoga" element={<YogaPage />} />
      </Routes>

      {/* 
      <LandingPage />
      <TextToSpeech /> */}
      {/* <TempPoseDetect /> */}
      {/* <ImageProvider>
        <PoseFeedback />
      </ImageProvider> */}
    </div>
    </Router>
  );
}

export default App;
