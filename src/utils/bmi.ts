import { BmiClassification } from '@/types';
import { palette } from '@/theme/colors';

export function calculateBmi(weightKg: number, heightCm: number): number {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) {
    return 0;
  }
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Number(bmi.toFixed(1));
}

export const BMI_RANGES: BmiClassification[] = [
  {
    category: 'underweight',
    labelKey: 'bmiCatUnderweight',
    color: palette.bmiUnderweight,
    min: 0,
    max: 18.49,
  },
  {
    category: 'normal',
    labelKey: 'bmiCatNormal',
    color: palette.bmiNormal,
    min: 18.5,
    max: 24.99,
  },
  {
    category: 'overweight',
    labelKey: 'bmiCatOverweight',
    color: palette.bmiOverweight,
    min: 25.0,
    max: 29.99,
  },
  {
    category: 'obese1',
    labelKey: 'bmiCatObese1',
    color: palette.bmiObese1,
    min: 30.0,
    max: 34.99,
  },
  {
    category: 'obese2',
    labelKey: 'bmiCatObese2',
    color: palette.bmiObese2,
    min: 35.0,
    max: 39.99,
  },
  {
    category: 'obese3',
    labelKey: 'bmiCatObese3',
    color: palette.bmiObese3,
    min: 40.0,
    max: 100.0,
  },
];

export function getBmiClassification(bmi: number): BmiClassification {
  if (bmi <= 0) {
    return BMI_RANGES[1]; // default to normal if invalid
  }
  for (const range of BMI_RANGES) {
    if (bmi >= range.min && bmi <= range.max) {
      return range;
    }
  }
  return BMI_RANGES[BMI_RANGES.length - 1];
}
