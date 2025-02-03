import React, { createContext, useContext, useEffect, useRef, useState } from "react";

// Define the shape of the context value
interface AudioManagerContextType {
  playAudio: (file: string, force?: boolean) => void; // Function to play audio files
  audioEnabled: boolean; // Flag to enable/disable audio
  setAudioEnabled: React.Dispatch<React.SetStateAction<boolean>>; // State updater for audioEnabled
}

// Create the context with an undefined initial value (we'll provide this later)
const AudioManagerContext = createContext<AudioManagerContextType | undefined>(undefined);

interface AudioManagerProviderProps {
  children: React.ReactNode; // The children components that will consume the context
}

export const AudioManagerProvider: React.FC<AudioManagerProviderProps> = ({ children }) => {
  // Track the time when the last audio was played, preventing rapid repeated audio
  const lastAudioPlayed = useRef<number>(new Date().getTime());

  // Background audio reference for persistent looping background sound
  const bgAudio = useRef<HTMLAudioElement>(new Audio("/audios/bg.mp3"));

  // State to manage whether audio is enabled or not
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);

  // Function to play audio files with an optional 'force' argument
  const playAudio = (file: string, force = false): void => {
    if (!audioEnabled) return; // If audio is disabled, don't play anything

    const now = new Date().getTime();

    // Only play audio if it's been more than 100ms or if forced
    if (!force && now - lastAudioPlayed.current < 100) return;

    lastAudioPlayed.current = now; // Update the timestamp for last played audio

    const audio = new Audio(`/audios/${file}.mp3`);
    audio.play(); // Play the audio file
  };

  // Effect to control background music playback based on audioEnabled state
  useEffect(() => {
    if (audioEnabled) {
      bgAudio.current.play(); // Start the background music if audio is enabled
      bgAudio.current.loop = true; // Make sure the background audio loops
    } else {
      bgAudio.current.pause(); // Pause the background music if audio is disabled
    }
  }, [audioEnabled]); // This effect runs whenever audioEnabled changes

  return (
    <AudioManagerContext.Provider value={{ playAudio, audioEnabled, setAudioEnabled }}>
      {children} {/* Render children components wrapped with this context provider */}
    </AudioManagerContext.Provider>
  );
};

// Custom hook to access the audio manager context
export const useAudioManager = (): AudioManagerContextType => {
  const audioManager = useContext(AudioManagerContext);

  // Ensure this hook is used within the AudioManagerProvider, or it will throw an error
  if (!audioManager) {
    throw new Error("useAudioManager must be used within an AudioManagerProvider");
  }
  return audioManager;
};
