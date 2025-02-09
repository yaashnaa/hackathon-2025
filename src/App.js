
import './App.css';
import LandingPage from './components/landingPage';
import TextToSpeech from './components/textToSpeech';
import TempPoseDetect from './components/tempPoseDetect';
import CaptureImage from './components/captureImage';
import PoseFeedback from './components/poseFeedback';
function App() {
  return (
    <div className="App">
{/* 
      <LandingPage />
      <TextToSpeech /> */}
      {/* <TempPoseDetect /> */}
      <PoseFeedback />
    </div>
  );
}

export default App;
