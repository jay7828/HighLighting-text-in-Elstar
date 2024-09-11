import React, { useState, useRef } from 'react';
import { TranscribeClient, StartTranscriptionJobCommand } from '@aws-sdk/client-transcribe';
import { Amplify } from 'aws-amplify';

const RealTimeSpeechToText: React.FC = () => {
  const [transcription, setTranscription] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const getToken = async (): Promise<string | undefined> => {
    try {
      const session = await Amplify.getConfig();
      return session.Auth?.Cognito.identityPoolId;
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

      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(mediaStream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(audioBlob);

        const s3Url = await uploadToS3(audioBlob); // Implement this function based on your S3 setup

        await startTranscriptionJob(s3Url);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const handleStop = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadToS3 = async (blob: Blob): Promise<string> => {
    // Implement S3 upload here
    return 'https://example-bucket.s3.amazonaws.com/audio-file.wav';
  };

  const startTranscriptionJob = async (s3Url: string) => {
    try {
      const transcribeClient = new TranscribeClient({
        region: 'us-east-1',
        credentials: essentialCredentials(Auth.currentCredentials()), // Use AWS Amplify credentials
      });

      const command = new StartTranscriptionJobCommand({
        TranscriptionJobName: `job-${Date.now()}`,
        LanguageCode: 'en-US',
        Media: { MediaFileUri: s3Url },
        MediaFormat: 'wav',
        OutputBucketName: 'your-output-bucket', // S3 bucket where results will be stored
      });

      await transcribeClient.send(command);

      setTranscription('Transcription job started. Check the output bucket for results.');
    } catch (error) {
      console.error('Error starting transcription job:', error);
    }
  };

  return (
    <div>
      <h2>Audio Recording and Transcription</h2>
      <button onClick={isRecording ? handleStop : handleStart}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <div>
        <h3>Transcription Output:</h3>
        <p>{transcription || 'No transcription available'}</p>
      </div>
    </div>
  );
};

export default RealTimeSpeechToText;
