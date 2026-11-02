import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useAppTheme } from '@/hooks/useAppTheme';

interface TimerRingProps {
  elapsedMs: number;
  isRunning: boolean;
  progress?: number; // 0..1 opcional para modo contagem regressiva ou descanso
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export function TimerRing({
  elapsedMs,
  isRunning,
  progress,
  size = 280,
  strokeWidth = 10,
  children,
}: TimerRingProps) {
  const { colors } = useAppTheme();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Se progress (0..1) for informado (contagem regressiva/descanso), usa o progresso direto; caso contrário, ciclo de 60s
  const ratio =
    typeof progress === 'number'
      ? Math.max(0, Math.min(1, progress))
      : (elapsedMs % 60000) / 60000;
  const strokeDashoffset = circumference - ratio * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <SvgGradient id="timerRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primaryLight} />
            <Stop offset="100%" stopColor={colors.primary} />
          </SvgGradient>
        </Defs>

        {/* Círculo de trilha */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Círculo de progresso animado */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#timerRingGrad)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={styles.contentWrapper}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 12,
  },
  svg: {
    position: 'absolute',
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
