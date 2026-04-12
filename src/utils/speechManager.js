import * as Speech from 'expo-speech';

/**
 * SpeechManager
 * Global wrapper for expo-speech to ensure consistent voice characteristics
 * aligned with the MATATAG Grade 1 guidelines.
 */
class SpeechManager {
  constructor() {
    this.isSpeaking = false;
  }

  /**
   * Stop any ongoing speech
   */
  stop() {
    Speech.stop();
    this.isSpeaking = false;
  }

  /**
   * Speak instruction with the 'Guide' character characteristics.
   * Guide is slightly slower and patient.
   * @param {string} text - The instruction to speak
   */
  speakInstruction(text) {
    if (!text) return;
    this.stop();
    
    Speech.speak(text, {
      language: 'en',
      rate: 0.85,  // Slower for instructions
      pitch: 1.1,  // Friendly tone
      onStart: () => { this.isSpeaking = true; },
      onDone: () => { this.isSpeaking = false; },
      onStopped: () => { this.isSpeaking = false; },
      onError: () => { this.isSpeaking = false; }
    });
  }

  /**
   * Speak feedback with the 'Feedback' character characteristics.
   * Feedback is slightly more energetic.
   * @param {string} text - The feedback to speak
   * @param {boolean} isCorrect - Whether the feedback is for a correct answer
   */
  speakFeedback(text, isCorrect = true) {
    if (!text) return;
    this.stop();

    Speech.speak(text, {
      language: 'en',
      rate: 1.0,   // Normal to slightly peppy
      pitch: isCorrect ? 1.2 : 1.1, // Higher pitch for success
      onStart: () => { this.isSpeaking = true; },
      onDone: () => { this.isSpeaking = false; },
      onStopped: () => { this.isSpeaking = false; },
      onError: () => { this.isSpeaking = false; }
    });
  }
}

export default new SpeechManager();
