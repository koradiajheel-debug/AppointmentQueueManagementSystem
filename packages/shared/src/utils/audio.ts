// Web Speech API and Web Audio chime synthesizer

class AudioService {
  private synth: SpeechSynthesis | null = null;
  private audioCtx: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  // Synthesize pleasant chime using Web Audio API oscillator
  public playChime() {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      // Pleasant airport/hospital two-tone chime (G5 -> C6)
      osc1.frequency.setValueAtTime(783.99, now); // G5
      osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.18); // C6

      osc2.frequency.setValueAtTime(392.00, now);
      osc2.frequency.exponentialRampToValueAtTime(523.25, now + 0.18);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.85);
      osc2.stop(now + 0.85);
    } catch (e) {
      console.warn('Audio chime playback not allowed or failed:', e);
    }
  }

  // Text to speech announcement
  public speak(text: string, lang: 'en' | 'hi' = 'en') {
    if (!this.synth) return;

    try {
      // Play chime first, then speak after brief delay
      this.playChime();

      setTimeout(() => {
        if (!this.synth) return;
        this.synth.cancel(); // Stop any pending speech

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95; // Slightly slower for clear hospital/bank lobby announcements
        utterance.pitch = 1.0;
        utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';

        const voices = this.synth.getVoices();
        const preferredVoice = voices.find(
          (v) => (lang === 'hi' ? v.lang.includes('hi') : v.lang.includes('en')) && v.name.includes('Google')
        ) || voices.find((v) => (lang === 'hi' ? v.lang.includes('hi') : v.lang.startsWith('en')));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        this.synth.speak(utterance);
      }, 400);
    } catch (err) {
      console.warn('Speech synthesis failed:', err);
    }
  }

  public announceToken(tokenNo: string, counterNumber: string, serviceName?: string) {
    const text = `Token number ${tokenNo.split('').join(' ')}, please proceed to Counter ${counterNumber}. ${
      serviceName ? `for ${serviceName}` : ''
    }`;
    this.speak(text, 'en');
  }
}

export const audio = new AudioService();
