(() => {
  // =========================================================================
  // SINTETIZADOR RETRÔ 8-BIT (WEB AUDIO API - ZERO ARQUIVOS EXTERNOS)
  // =========================================================================
  let audioCtx = null;
  let muted = false;

  function ensureContext() {
    if (muted) return null;
    try {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
        }
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    } catch (e) {
      return null;
    }
  }

  function playTone(freq, duration, type = 'square', volume = 0.06, delay = 0) {
    const ctx = ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  window.AudioEngine = {
    playBlip: () => {
      playTone(680, 0.035, 'square', 0.025, 0);
    },
    playClick: () => {
      playTone(520, 0.06, 'square', 0.05, 0);
      playTone(780, 0.07, 'square', 0.05, 0.045);
    },
    playOpen: () => {
      playTone(330, 0.06, 'square', 0.05, 0);
      playTone(440, 0.06, 'square', 0.05, 0.05);
      playTone(660, 0.09, 'square', 0.05, 0.1);
    },
    playExecute: () => {
      playTone(440, 0.07, 'triangle', 0.08, 0);
      playTone(554, 0.07, 'triangle', 0.08, 0.06);
      playTone(659, 0.07, 'triangle', 0.08, 0.12);
      playTone(880, 0.16, 'square', 0.06, 0.18);
    },
    playAlert: () => {
      playTone(240, 0.12, 'sawtooth', 0.06, 0);
      playTone(190, 0.18, 'sawtooth', 0.06, 0.13);
    },
    playVictory: () => {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((n, idx) => {
        playTone(n, idx === 3 ? 0.28 : 0.1, 'square', 0.06, idx * 0.11);
      });
    },
    playGameOver: () => {
      const notes = [392.0, 349.23, 311.13, 261.63];
      notes.forEach((n, idx) => {
        playTone(n, idx === 3 ? 0.35 : 0.14, 'sawtooth', 0.06, idx * 0.14);
      });
    },
    toggleMute: () => {
      muted = !muted;
      if (!muted) {
        playTone(660, 0.08, 'square', 0.05, 0);
      }
      return muted;
    },
    isMuted: () => muted
  };
})();