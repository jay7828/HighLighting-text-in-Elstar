
import React, { useState, useEffect, useRef } from 'react';
import { Auth } from 'aws-amplify';
import { TranscribeStreamingClient, StartStreamTranscriptionCommand, StartStreamTranscriptionCommandInput } from '@aws-sdk/client-transcribe-streaming';

const GroupSingleMenuItemView: React.FC = () => {
  const [transcription, setTranscription] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [processor, setProcessor] = useState<ScriptProcessorNode | null>(null);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    return () => {
      // Clean up the audio stream and WebSocket connection when component unmounts
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
      if (processor) {
        processor.disconnect();
      }
      if (audioContext) {
        audioContext.close();
      }
      if (webSocket) {
        webSocket.close();
      }
    };
  }, [audioStream, processor, audioContext, webSocket]);

  const getToken = async (): Promise<string | undefined> => {
    try {
      const session = await Auth.currentSession();
      return session.getIdToken().getJwtToken();
    } catch (error) {
      console.error('Error fetching Cognito token:', error);
      return undefined;
    }
  };

  const handleStart = async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Failed to get Cognito token');
      }

      // Set up WebSocket connection
      const presignedUri = `wss://transcribestreaming.us-west-2.amazonaws.com:8443/medical-stream-transcription-websocket
        ?language-code=en-US
        &media-encoding=flac
        &sample-rate=16000
        &session-id=${Date.now()}
        &specialty=PRIMARYCARE
        &type=CONVERSATION
        &show-speaker-label=true
        &X-Amz-Algorithm=AWS4-HMAC-SHA256
        &X-Amz-Credential=${YOUR_AWS_CREDENTIALS}
      const ws = new WebSocket(presignedUri);
      setWebSocket(ws);

      ws.onopen = () => {
        console.log('WebSocket connection opened.');
        setIsStreaming(true);
        startAudioCapture();
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.transcripts && message.transcripts.length > 0) {
            setTranscription(prev => `${prev} ${message.transcripts[0].transcript}`);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed.');
        setIsStreaming(false);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsStreaming(false);
      };
    } catch (error) {
      console.error('Error starting WebSocket connection:', error);
    }
  };

  const startAudioCapture = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(mediaStream);

      const audioContextInstance = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(audioContextInstance);

      const input = audioContextInstance.createMediaStreamSource(mediaStream);
      const scriptProcessor = audioContextInstance.createScriptProcessor(4096, 1, 1);
      setProcessor(scriptProcessor);

      input.connect(scriptProcessor);
      scriptProcessor.connect(audioContextInstance.destination);

      scriptProcessor.onaudioprocess = (event: AudioProcessingEvent) => {
        if (webSocket && webSocket.readyState === WebSocket.OPEN) {
          const audioData = event.inputBuffer.getChannelData(0);
          const audioBlob = new Blob([new Uint8Array(audioData.buffer)], { type: 'audio/flac' });
          webSocket.send(audioBlob);
        }
      };
    } catch (error) {
      console.error('Error setting up audio capture:', error);
    }
  };

  const handleStop = () => {
    if (webSocket) {
      webSocket.close();
      setIsStreaming(false);
    }
  };

  return (
    <div>
      <h2>Real-Time Medical Transcription</h2>
      <button onClick={isStreaming ? handleStop : handleStart}>
        {isStreaming ? 'Stop Streaming' : 'Start Streaming'}
      </button>
      <div>
        <h3>Transcription Output:</h3>
        <p>{transcription || 'No transcription available'}</p>
      </div>
    </div>
  );
};

export default GroupSingleMenuItemView;
