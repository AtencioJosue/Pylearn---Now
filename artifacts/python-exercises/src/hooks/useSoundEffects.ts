/**
 * Sound effects hook using the Web Audio API.
 * Generates success (check) and error (buzz) sounds programmatically
 * so no external audio files are needed.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

/** 
 * Plays a bright, satisfying "check / ding" sound for correct answers.
 * Two ascending tones that feel rewarding.
 */
export function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // First tone — lower
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, now);     // C5
    osc1.frequency.setValueAtTime(659.25, now + 0.1); // E5
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Second tone — higher, slightly delayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(783.99, now + 0.12); // G5
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0.3, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.5);

    // Third sparkle tone for extra satisfaction
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = "triangle";
    osc3.frequency.setValueAtTime(1046.5, now + 0.22); // C6
    gain3.gain.setValueAtTime(0, now);
    gain3.gain.setValueAtTime(0.15, now + 0.22);
    gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.22);
    osc3.stop(now + 0.6);
  } catch {
    // Silently fail if audio is not supported
  }
}

/**
 * Plays a short, low "buzz / bonk" sound for incorrect answers.
 * A descending tone with a slight wobble.
 */
export function playErrorSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Low buzz tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(200, now);
    osc1.frequency.exponentialRampToValueAtTime(120, now + 0.25);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second wobble tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "square";
    osc2.frequency.setValueAtTime(180, now + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(100, now + 0.3);
    gain2.gain.setValueAtTime(0.08, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.3);
  } catch {
    // Silently fail if audio is not supported
  }
}
