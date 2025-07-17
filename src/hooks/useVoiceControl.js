import { useState, useEffect, useCallback, useRef } from 'react';

const useVoiceControl = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef(null);
  const manuallyStoppedRef = useRef(false);
  const timeoutRef = useRef(null);
  const autoOffTimerRef = useRef(null);

  // Check browser compatibility on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      // Initialize speech recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Keep listening continuously
      recognition.interimResults = true; // Enable interim results for better UX
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      // Auto-off timer: Stop voice recognition after 3.5 minutes of inactivity
      const resetAutoOffTimer = () => {
        // Clear existing timer
        if (autoOffTimerRef.current) {
          clearTimeout(autoOffTimerRef.current);
        }
        
        // Set new timer for 3.5 minutes (210 seconds)
        autoOffTimerRef.current = setTimeout(() => {
          if (recognitionRef.current && isListening) {
            console.log('Auto-off: Voice recognition stopped after 3.5 minutes of inactivity');
            manuallyStoppedRef.current = true;
            recognitionRef.current.stop();
            setError('Voice control automatically turned off after 3.5 minutes of inactivity.');
          }
        }, 210000); // 3.5 minutes = 210000 milliseconds
      };

      // Event listeners
      recognition.onstart = () => {
        setIsListening(true);
        setError('');
        manuallyStoppedRef.current = false;
        console.log('Voice recognition started');
        // Start auto-off timer when voice recognition starts
        resetAutoOffTimer();
      };

      recognition.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const recognizedText = lastResult[0].transcript.trim();
          console.log('Voice command recognized:', recognizedText);
          
          // Check for "Quit Listening" command
          if (recognizedText.toLowerCase().includes('quit listening')) {
            console.log('Quit Listening command detected - stopping voice recognition');
            manuallyStoppedRef.current = true;
            recognitionRef.current.stop();
            setError('Voice control stopped by voice command.');
            return;
          }
          
          setTranscript(recognizedText);
          // Reset auto-off timer when speech is detected
          resetAutoOffTimer();
        }
      };

      recognition.onerror = (event) => {
        let errorMessage = 'Speech recognition error';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'No microphone found. Please check your microphone.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error occurred. Please check your connection.';
            break;
          case 'aborted':
            errorMessage = 'Speech recognition was aborted.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        setError(errorMessage);
        setIsListening(false);
        console.error('Speech recognition error:', event.error);
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log('Voice recognition ended');
        
        // Auto-restart if not manually stopped
        if (!manuallyStoppedRef.current) {
          try {
            setTimeout(() => {
              if (recognitionRef.current) {
                recognitionRef.current.start();
              }
            }, 100); // Small delay before restart
          } catch (err) {
            console.error('Error restarting speech recognition:', err);
          }
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (autoOffTimerRef.current) {
        clearTimeout(autoOffTimerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    if (!recognitionRef.current) {
      setError('Speech recognition is not initialized.');
      return;
    }

    if (isListening) {
      return; // Already listening
    }

    try {
      setError('');
      setTranscript('');
      recognitionRef.current.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setError('Failed to start voice recognition. Please try again.');
    }
  }, [isSupported, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      manuallyStoppedRef.current = true;
      recognitionRef.current.stop();
    }
    // Clear auto-off timer when manually stopped
    if (autoOffTimerRef.current) {
      clearTimeout(autoOffTimerRef.current);
      autoOffTimerRef.current = null;
    }
  }, [isListening]);


  // Clear transcript after a delay to reset for next command
  useEffect(() => {
    if (transcript) {
      const timeoutId = setTimeout(() => {
        setTranscript('');
      }, 3000); // Clear after 3 seconds

      return () => clearTimeout(timeoutId);
    }
  }, [transcript]);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening
  };
};

export default useVoiceControl;
