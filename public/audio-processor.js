class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
    }
  
    process(inputs, outputs, parameters) {
      const input = inputs[0];
      if (input) {
        const audioData = input[0];
        if (audioData) {
          // Convert Float32Array to a format suitable for transmission
          const audioBytes = new Float32Array(audioData.length);
          audioBytes.set(audioData);
  
          // Send the audio data to the main thread for further processing
          this.port.postMessage(audioBytes);
        }
      }
      return true; // Keep processor alive
    }
  }
  
  registerProcessor('audio-processor', AudioProcessor);
  