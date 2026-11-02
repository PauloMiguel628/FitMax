import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getBmiClassification, BMI_RANGES } from '@/utils/bmi';
import { useTranslation } from '@/i18n';

interface BmiGaugeProps {
  bmi: number;
}

export function BmiGauge({ bmi }: BmiGaugeProps) {
  const { colors, radius, typography } = useAppTheme();
  const { t } = useTranslation();

  const classification = getBmiClassification(bmi);

  // Mapeia o valor de BMI (entre 14 e 42) para uma porcentagem de 0 a 100%
  const clampedBmi = Math.max(14, Math.min(bmi, 42));
  const progressPercent = (clampedBmi - 14) / (42 - 14);

  // Dimensões do arco SVG
  const width = 260;
  const height = 140;
  const strokeWidth = 14;
  const radiusVal = 100;
  const cx = width / 2;
  const cy = height;

  // Ângulo de -180 a 0 graus (meio círculo superior)
  const angle = Math.PI - progressPercent * Math.PI;
  const pointerX = cx + (radiusVal) * Math.cos(angle);
  const pointerY = cy - (radiusVal) * Math.sin(angle);

  // Tradução do rótulo da categoria
  const catLabel = (t as any)[classification.labelKey] || classification.category;

  return (
    <View style={styles.container}>
      <View style={styles.svgWrapper}>
        <Svg width={width} height={height + 20}>
          <Defs>
            <SvgGradient id="bmiArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#38BDF8" />
              <Stop offset="30%" stopColor="#10B981" />
              <Stop offset="55%" stopColor="#FBBF24" />
              <Stop offset="75%" stopColor="#FB923C" />
              <Stop offset="100%" stopColor="#BE123C" />
            </SvgGradient>
          </Defs>

          {/* Arco de fundo */}
          <Path
            d={`M ${cx - radiusVal} ${cy} A ${radiusVal} ${radiusVal} 0 0 1 ${cx + radiusVal} ${cy}`}
            fill="none"
            stroke="url(#bmiArcGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Marcador ponteiro da posição do IMC */}
          {bmi > 0 && (
            <>
              <Circle
                cx={pointerX}
                cy={pointerY}
                r={10}
                fill={classification.color}
                stroke="#FFFFFF"
                strokeWidth={3}
              />
            </>
          )}
        </Svg>

        <View style={styles.centerScore}>
          <Text
            style={[
              typography.bmiNumber,
              styles.bmiValue,
              { color: colors.text },
            ]}
          >
            {bmi > 0 ? bmi.toFixed(1) : '--'}
          </Text>
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
            kg/m²
          </Text>
        </View>
      </View>

      {/* Badge da Classificação */}
      <View
        style={[
          styles.badge,
          {
            backgroundColor: classification.color + '22',
            borderColor: classification.color,
            borderRadius: radius.full,
          },
        ]}
      >
        <View
          style={[
            styles.badgeDot,
            { backgroundColor: classification.color },
          ]}
        />
        <Text
          style={[
            typography.label,
            styles.badgeText,
            { color: classification.color },
          ]}
        >
          {catLabel}
        </Text>
      </View>

      {/* Marcadores das faixas */}
      <View style={styles.rangesBar}>
        {BMI_RANGES.map((r) => (
          <View
            key={r.category}
            style={[
              styles.rangeSegment,
              {
                backgroundColor: r.color,
                opacity: r.category === classification.category ? 1 : 0.4,
                height: r.category === classification.category ? 6 : 4,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  svgWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerScore: {
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
  },
  bmiValue: {
    fontWeight: '900',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    marginTop: 10,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  badgeText: {
    fontWeight: '800',
  },
  rangesBar: {
    flexDirection: 'row',
    width: 220,
    marginTop: 14,
    gap: 4,
    alignItems: 'center',
  },
  rangeSegment: {
    flex: 1,
    borderRadius: 2,
  },
});
