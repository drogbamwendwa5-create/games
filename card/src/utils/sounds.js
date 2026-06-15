// Sound effects using Web Audio API
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(frequency, duration, type = 'sine', volume = 0.3) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    // Silently fail if audio is not available
  }
}

export function playFlipSound() {
  playTone(800, 0.1, 'sine', 0.2);
}

export function playMatchSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  playTone(523, 0.15, 'sine', 0.3); // C5
  setTimeout(() => playTone(659, 0.15, 'sine', 0.3), 100); // E5
  setTimeout(() => playTone(784, 0.2, 'sine', 0.3), 200); // G5
}

export function playMismatchSound() {
  playTone(300, 0.15, 'square', 0.15);
  setTimeout(() => playTone(250, 0.2, 'square', 0.15), 150);
}

export function playWinSound() {
  const notes = [523, 587, 659, 698, 784, 880, 988, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, 'sine', 0.2), i * 100);
  });
}