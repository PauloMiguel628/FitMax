import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Line,
  Text as SvgText,
} from 'react-native-svg';
import { WeightEntry } from '@/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatShortDateTime } from '@/utils/date';
import { useTranslation } from '@/i18n';

interface WeightChartProps {
  entries: WeightEntry[];
}

export function WeightChart({ entries }: WeightChartProps) {
  const { width: screenWidth } = useWindowDimensions();
  const { colors, typography, radius } = useAppTheme();
  const { t, locale } = useTranslation();

  if (!entries || entries.length === 0) {
    return null;
  }

  // Ordena cronologicamente por data e hora (recordedAt || date)
  const allSorted = [...entries].sort((a, b) => {
    const keyA = a.recordedAt || a.date;
    const keyB = b.recordedAt || b.date;
    return keyA.localeCompare(keyB);
  });

  // Exibe até os últimos 7 pontos no gráfico para manter excelente legibilidade
  const sorted = allSorted.slice(-7);

  const chartWidth = screenWidth - 68;
  const chartHeight = 175;
  const paddingTop = 32;
  const paddingBottom = 24;
  const paddingHorizontal = 28;

  const weights = sorted.map((e) => e.weightKg);
  const minWeight = Math.floor(Math.min(...weights) - 1.5);
  const maxWeight = Math.ceil(Math.max(...weights) + 1.5);
  const weightRange = Math.max(1, maxWeight - minWeight);

  const getX = (index: number) => {
    if (sorted.length === 1) return chartWidth / 2;
    return (
      paddingHorizontal +
      (index / (sorted.length - 1)) * (chartWidth - paddingHorizontal * 2)
    );
  };

  const getY = (val: number) => {
    const norm = (val - minWeight) / weightRange;
    return (
      chartHeight -
      paddingBottom -
      norm * (chartHeight - paddingTop - paddingBottom)
    );
  };

  // Constrói o caminho SVG da linha
  let pathD = '';
  let fillPathD = '';

  if (sorted.length === 1) {
    const y = getY(sorted[0].weightKg);
    const startX = paddingHorizontal;
    const endX = chartWidth - paddingHorizontal;
    pathD = `M ${startX} ${y} L ${endX} ${y}`;
    fillPathD = `M ${startX} ${chartHeight - paddingBottom} L ${startX} ${y} L ${endX} ${y} L ${endX} ${chartHeight - paddingBottom} Z`;
  } else {
    sorted.forEach((entry, i) => {
      const x = getX(i);
      const y = getY(entry.weightKg);
      if (i === 0) {
        pathD += `M ${x} ${y}`;
        fillPathD += `M ${x} ${chartHeight - paddingBottom} L ${x} ${y}`;
      } else {
        pathD += ` L ${x} ${y}`;
        fillPathD += ` L ${x} ${y}`;
      }
    });
    const lastX = getX(sorted.length - 1);
    const firstX = getX(0);
    fillPathD += ` L ${lastX} ${chartHeight - paddingBottom} L ${firstX} ${chartHeight - paddingBottom} Z`;
  }

  const firstWeight = allSorted[0].weightKg;
  const currentWeight = allSorted[allSorted.length - 1].weightKg;
  const diff = Number((currentWeight - firstWeight).toFixed(1));
  const diffFormatted = diff > 0 ? `+${diff} kg` : `${diff} kg`;

  return (
    <View style={styles.container}>
      {/* Resumo Rápido de Evolução (Inicial, Atual e Variação) */}
      <View
        style={[
          styles.summaryRow,
          {
            backgroundColor: colors.surfaceElevated,
            borderRadius: radius.lg,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.summaryCol}>
          <Text style={[typography.bodySmall, { color: colors.textSecondary, fontSize: 11 }]}>
            {t.weightInitialLabel}
          </Text>
          <Text style={[typography.bodyMedium, { color: colors.text, fontWeight: '800' }]}>
            {firstWeight} kg
          </Text>
        </View>

        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

        <View style={styles.summaryCol}>
          <Text style={[typography.bodySmall, { color: colors.textSecondary, fontSize: 11 }]}>
            {t.weightCurrentLabel}
          </Text>
          <Text style={[typography.bodyMedium, { color: colors.primary, fontWeight: '800' }]}>
            {currentWeight} kg
          </Text>
        </View>

        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

        <View style={styles.summaryCol}>
          <Text style={[typography.bodySmall, { color: colors.textSecondary, fontSize: 11 }]}>
            {t.weightVariationLabel}
          </Text>
          <Text
            style={[
              typography.bodyMedium,
              {
                color: diff === 0 ? colors.textSecondary : diff > 0 ? '#F59E0B' : colors.success,
                fontWeight: '800',
              },
            ]}
          >
            {diffFormatted}
          </Text>
        </View>
      </View>

      <Svg width={chartWidth} height={chartHeight}>
        <Defs>
          <SvgGradient id="weightLineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.38} />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity={0.02} />
          </SvgGradient>
        </Defs>

        {/* Linhas horizontais de referência */}
        <Line
          x1={paddingHorizontal}
          y1={paddingTop}
          x2={chartWidth - paddingHorizontal}
          y2={paddingTop}
          stroke={colors.border}
          strokeDasharray="4 4"
        />
        <Line
          x1={paddingHorizontal}
          y1={(paddingTop + chartHeight - paddingBottom) / 2}
          x2={chartWidth - paddingHorizontal}
          y2={(paddingTop + chartHeight - paddingBottom) / 2}
          stroke={colors.border}
          strokeDasharray="4 4"
        />
        <Line
          x1={paddingHorizontal}
          y1={chartHeight - paddingBottom}
          x2={chartWidth - paddingHorizontal}
          y2={chartHeight - paddingBottom}
          stroke={colors.border}
          strokeDasharray="4 4"
        />

        {/* Área preenchida sob a curva */}
        <Path d={fillPathD} fill="url(#weightLineGrad)" />

        {/* Linha do gráfico */}
        <Path
          d={pathD}
          fill="none"
          stroke={colors.primary}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Pontos com valor em kg acima de cada registro */}
        {sorted.map((entry, idx) => {
          const cx = getX(idx);
          const cy = getY(entry.weightKg);
          return (
            <React.Fragment key={entry.id}>
              <Circle
                cx={cx}
                cy={cy}
                r={5.5}
                fill={colors.primary}
                stroke="#FFFFFF"
                strokeWidth={2}
              />
              <SvgText
                x={cx}
                y={Math.max(14, cy - 10)}
                fill={colors.text}
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
              >
                {`${entry.weightKg}kg`}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Rótulos de data e hora abaixo do gráfico */}
      <View style={styles.labelsRow}>
        <Text style={[typography.bodySmall, { color: colors.textSecondary, fontSize: 11 }]}>
          {formatShortDateTime(sorted[0].recordedAt || sorted[0].date, locale)}
        </Text>
        {sorted.length > 2 && (
          <Text style={[typography.bodySmall, { color: colors.textSecondary, fontSize: 11 }]}>
            {formatShortDateTime(
              sorted[Math.floor(sorted.length / 2)].recordedAt ||
                sorted[Math.floor(sorted.length / 2)].date,
              locale
            )}
          </Text>
        )}
        {sorted.length > 1 && (
          <Text style={[typography.bodySmall, { color: colors.textSecondary, fontSize: 11 }]}>
            {formatShortDateTime(
              sorted[sorted.length - 1].recordedAt || sorted[sorted.length - 1].date,
              locale
            )}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  summaryCol: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 24,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 12,
    marginTop: 4,
  },
});
