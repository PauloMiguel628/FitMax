import { Easing } from 'react-native-reanimated';

export const motion = {
  // Durations (in ms)
  duration: {
    instant: 100,
    quick: 180,
    normal: 280,
    smooth: 400,
    deliberate: 600,
  },

  // Reanimated Spring Configs
  spring: {
    snappy: {
      damping: 18,
      stiffness: 220,
      mass: 0.8,
    },
    bouncy: {
      damping: 12,
      stiffness: 180,
      mass: 0.9,
    },
    gentle: {
      damping: 24,
      stiffness: 140,
      mass: 1,
    },
    pulse: {
      damping: 10,
      stiffness: 300,
      mass: 0.5,
    },
  },

  // Reanimated Easings
  easing: {
    standard: Easing.bezier(0.25, 0.1, 0.25, 1),
    decelerate: Easing.out(Easing.cubic),
    accelerate: Easing.in(Easing.cubic),
    emphasized: Easing.bezier(0.2, 0.0, 0, 1.0),
  },

  // Stagger delays
  stagger: 40,
} as const;
