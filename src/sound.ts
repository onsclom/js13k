const audioContext = new AudioContext();

export function playShootSound() {
  const oscillator = audioContext.createOscillator();
  oscillator.type = "sawtooth";
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
  gainNode.gain.setValueAtTime(1, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    0.1,
    audioContext.currentTime + 0.2,
  );
  gainNode.gain.exponentialRampToValueAtTime(
    0.1,
    audioContext.currentTime + 0.2,
  );
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
}
