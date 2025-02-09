import "./App.css";
import LandingPage from "./components/landingPage";
import TextToSpeech from "./components/textToSpeech";
import CaptureImage from "./components/captureImage";
import PoseFeedback from "./components/poseFeedback";
import { ImageProvider } from "./context/imageContext";
function App() {
  return (
    <div className="App">
      {/* 
      <LandingPage />
      <TextToSpeech /> */}
      {/* <TempPoseDetect /> */}
      <ImageProvider>
        <PoseFeedback />
      </ImageProvider>
    </div>
  );
}

export default App;
