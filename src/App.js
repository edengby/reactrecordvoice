import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioURL, setRecordedAudioURL] = useState(null);
  const [isPlayingBack, setIsPlayingBack] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    // Cleanup on unmount: stop recording if it's still running
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    // Request permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioURL = URL.createObjectURL(audioBlob);
        setTimeout(() => {
          setRecordedAudioURL(audioURL);
          setIsPlayingBack(true);
        }, 2000);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordedAudioURL(null);
      setIsPlayingBack(false);

    } catch (err) {
      console.error("Microphone access denied or error: ", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
      <div className="App">
        <h1>Voice Recorder</h1>
        <div className="controls">
          {!isRecording && (
              <button onClick={startRecording} disabled={isRecording}>
                Start Recording
              </button>
          )}
          {isRecording && (
              <button onClick={stopRecording} disabled={!isRecording}>
                Stop Recording
              </button>
          )}
        </div>
        <div className="playback">
          {isPlayingBack && recordedAudioURL && (
              <audio controls src={recordedAudioURL} autoPlay />
          )}
        </div>
      </div>
  );
}

export default App;
