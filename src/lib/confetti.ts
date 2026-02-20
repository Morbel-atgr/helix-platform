import confetti from 'canvas-confetti';

export function fireConfetti() {
  const colors = ['#34d399', '#60a5fa', '#f472b6', '#fbbf24', '#a78bfa'];
  const defaults = { colors, ticks: 150, gravity: 1.1, scalar: 0.95 };

  // Left cannon
  confetti({
    ...defaults,
    particleCount: 40,
    angle: 60,
    spread: 50,
    origin: { x: 0, y: 0.7 },
  });

  // Right cannon
  confetti({
    ...defaults,
    particleCount: 40,
    angle: 120,
    spread: 50,
    origin: { x: 1, y: 0.7 },
  });
}
