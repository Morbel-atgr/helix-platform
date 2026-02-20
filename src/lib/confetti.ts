import confetti from 'canvas-confetti';

export function fireConfetti() {
  confetti({
    particleCount: 60,
    spread: 55,
    origin: { y: 0.7 },
    colors: ['#34d399', '#60a5fa', '#f472b6', '#fbbf24', '#a78bfa'],
    ticks: 120,
    gravity: 1.2,
    scalar: 0.9,
    drift: 0,
  });
}
