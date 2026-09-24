/**
 * Pleasant Web Audio API synthesized chimes and notification sounds.
 * Requires zero external audio assets.
 */

let audioCtx = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a gentle, peaceful double-chime for Pomodoro completion
 */
export function playCompletionChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // First bell note (E5 ~ 659Hz)
    playTone(ctx, 659.25, now, 0.9, "sine", 0.25);
    // Second bell note harmonizing (G#5 ~ 830Hz)
    playTone(ctx, 830.61, now + 0.18, 1.2, "sine", 0.25);
    // Third bell note completing chord (B5 ~ 987Hz)
    playTone(ctx, 987.77, now + 0.36, 1.6, "sine", 0.28);
  } catch {
    // Audio might be blocked by autoplay policies until user interacts
  }
}

/**
 * Plays a soft, subtle tick when starting or resuming the timer
 */
export function playStartTick() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    playTone(ctx, 523.25, now, 0.2, "sine", 0.15); // C5
    playTone(ctx, 659.25, now + 0.08, 0.25, "sine", 0.18); // E5
  } catch {
    // Ignore autoplay restriction
  }
}

function playTone(ctx, freq, startTime, duration, type = "sine", maxGain = 0.2) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(maxGain, startTime + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}
