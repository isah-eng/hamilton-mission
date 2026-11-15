(() => {
  // =========================================================================
  // SINTETIZADOR RETRÔ 8-BIT + TRILHA SONORA ESPACIAL (WEB AUDIO API)
  // =========================================================================
  let audioCtx = null;
  let sfxMuted = false;
  let bgmMuted = false;
  let bgmRunning = false;
  let bgmTimer = null;
  let nextNoteTime = 0;
  let currentTick = 0;

  // 112 BPM com grade de 12 sub-ticks por tempo (suporta tercinas e colcheias)
  const BPM = 112;
  const TICK_SECONDS = 60 / BPM / 12;
  const LOOP_TICKS = 384; // 8 compassos em 4/4 (48 ticks por compasso)

  const NOTES = {
    C2: 65.41,
    Eb2: 77.78,
    F2: 87.31,
    G2: 98.0,
    Ab2: 103.83,
    Bb2: 116.54,
    G3: 196.0,
    C4: 261.63,
    D4: 293.66,
    Eb4: 311.13,
    E4: 329.63,
    F4: 349.23,
    G4: 392.0,
    Ab4: 415.3,
    A4: 440.0,
    Bb4: 466.16,
    C5: 523.25
  };

  // Fanfarra espacial original (tercinas heroicas + saltos de quinta e oitava)
  const LEAD_SEQUENCE = [
    // Compasso 1
    { tick: 0, freq: NOTES.G3, dur: 4 },
    { tick: 4, freq: NOTES.G3, dur: 4 },
    { tick: 8, freq: NOTES.G3, dur: 4 },
    { tick: 12, freq: NOTES.C4, dur: 22 },
    { tick: 36, freq: NOTES.G4, dur: 11 },
    // Compasso 2
    { tick: 48, freq: NOTES.F4, dur: 4 },
    { tick: 52, freq: NOTES.E4, dur: 4 },
    { tick: 56, freq: NOTES.D4, dur: 4 },
    { tick: 60, freq: NOTES.C5, dur: 22 },
    { tick: 84, freq: NOTES.G4, dur: 11 },
    // Compasso 3
    { tick: 96, freq: NOTES.F4, dur: 4 },
    { tick: 100, freq: NOTES.E4, dur: 4 },
    { tick: 104, freq: NOTES.D4, dur: 4 },
    { tick: 108, freq: NOTES.C5, dur: 22 },
    { tick: 132, freq: NOTES.G4, dur: 11 },
    // Compasso 4
    { tick: 144, freq: NOTES.F4, dur: 4 },
    { tick: 148, freq: NOTES.E4, dur: 4 },
    { tick: 152, freq: NOTES.F4, dur: 4 },
    { tick: 156, freq: NOTES.D4, dur: 22 },
    { tick: 180, freq: NOTES.G3, dur: 5 },
    { tick: 186, freq: NOTES.G3, dur: 5 },
    // Compasso 5 (elevação épica em Láb)
    { tick: 192, freq: NOTES.Ab4, dur: 16 },
    { tick: 210, freq: NOTES.G4, dur: 5 },
    { tick: 216, freq: NOTES.F4, dur: 11 },
    { tick: 228, freq: NOTES.Eb4, dur: 11 },
    // Compasso 6
    { tick: 240, freq: NOTES.Bb4, dur: 16 },
    { tick: 258, freq: NOTES.Ab4, dur: 5 },
    { tick: 264, freq: NOTES.G4, dur: 11 },
    { tick: 276, freq: NOTES.F4, dur: 11 },
    // Compasso 7 (ascensão de tensão)
    { tick: 288, freq: NOTES.G4, dur: 16 },
    { tick: 306, freq: NOTES.A4, dur: 5 },
    { tick: 312, freq: NOTES.Bb4, dur: 11 },
    { tick: 324, freq: NOTES.C5, dur: 11 },
    // Compasso 8 (cadência de retorno)
    { tick: 336, freq: NOTES.G4, dur: 22 },
    { tick: 360, freq: NOTES.G3, dur: 11 }
  ];

  // Pulso grave de acompanhamento
  const BASS_SEQUENCE = [
    { tick: 0, freq: NOTES.C2, dur: 18 },
    { tick: 24, freq: NOTES.G2, dur: 18 },
    { tick: 48, freq: NOTES.C2, dur: 18 },
    { tick: 72, freq: NOTES.G2, dur: 18 },
    { tick: 96, freq: NOTES.C2, dur: 18 },
    { tick: 120, freq: NOTES.G2, dur: 18 },
    { tick: 144, freq: NOTES.G2, dur: 18 },
    { tick: 168, freq: NOTES.G2, dur: 18 },
    { tick: 192, freq: NOTES.Ab2, dur: 18 },
    { tick: 216, freq: NOTES.Eb2, dur: 18 },
    { tick: 240, freq: NOTES.Bb2, dur: 18 },
    { tick: 264, freq: NOTES.F2, dur: 18 },
    { tick: 288, freq: NOTES.C2, dur: 18 },
    { tick: 312, freq: NOTES.G2, dur: 18 },
    { tick: 336, freq: NOTES.G2, dur: 18 },
    { tick: 360, freq: NOTES.G2, dur: 18 }
  ];

  function getContext() {
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
    if (sfxMuted) return;
    const ctx = getContext();
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

  function scheduleBgmNote(freq, startTime, durationSec, isLead) {
    if (bgmMuted) return;
    const ctx = getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (isLead) {
      // Filtro passa-baixa deixa a onda quadrada com timbre quente de trompa espacial
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1450, startTime);

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.022, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);

      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.032, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);

      osc.connect(gain);
    }

    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + durationSec + 0.02);
  }

  function runBgmScheduler() {
    if (!bgmRunning || bgmMuted) return;
    const ctx = getContext();
    if (!ctx || ctx.state !== 'running') return;

    // Agenda notas com 150ms de antecedência para manter o ritmo cravado
    while (nextNoteTime < ctx.currentTime + 0.15) {
      const leadHit = LEAD_SEQUENCE.find((n) => n.tick === currentTick);
      if (leadHit) {
        scheduleBgmNote(leadHit.freq, nextNoteTime, leadHit.dur * TICK_SECONDS, true);
      }

      const bassHit = BASS_SEQUENCE.find((n) => n.tick === currentTick);
      if (bassHit) {
        scheduleBgmNote(bassHit.freq, nextNoteTime, bassHit.dur * TICK_SECONDS, false);
      }

      nextNoteTime += TICK_SECONDS;
      currentTick = (currentTick + 1) % LOOP_TICKS;
    }
  }

  function startBgm() {
    if (bgmMuted) return;
    const ctx = getContext();
    if (!ctx) return;

    if (!bgmRunning) {
      bgmRunning = true;
      currentTick = 0;
      nextNoteTime = ctx.currentTime + 0.05;
      bgmTimer = setInterval(runBgmScheduler, 45);
    }
  }

  function stopBgm() {
    bgmRunning = false;
    if (bgmTimer) {
      clearInterval(bgmTimer);
      bgmTimer = null;
    }
  }

  // Desbloqueia e inicia a trilha espacial na primeira interação do usuário
  function unlockAudioOnFirstGesture() {
    const ctx = getContext();
    if (ctx && ctx.state === 'running' && !bgmMuted) {
      startBgm();
      window.removeEventListener('pointerdown', unlockAudioOnFirstGesture);
      window.removeEventListener('keydown', unlockAudioOnFirstGesture);
    }
  }

  window.addEventListener('pointerdown', unlockAudioOnFirstGesture);
  window.addEventListener('keydown', unlockAudioOnFirstGesture);

  window.AudioEngine = {
    playBlip: () => {
      playTone(680, 0.035, 'square', 0.022, 0);
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
      sfxMuted = !sfxMuted;
      if (!sfxMuted) {
        playTone(660, 0.08, 'square', 0.05, 0);
      }
      return sfxMuted;
    },
    isMuted: () => sfxMuted,
    toggleBgm: () => {
      bgmMuted = !bgmMuted;
      if (bgmMuted) {
        stopBgm();
      } else {
        startBgm();
      }
      return bgmMuted;
    },
    isBgmMuted: () => bgmMuted
  };
})();