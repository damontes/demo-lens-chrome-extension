import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);

export const getRandomId = () => nanoid();

export const randInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const formatSecondsToHourMinutes = (seconds: number) => {
  if (!seconds) {
    return '0h 0m';
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const generateMaskedValues = (config: any, count: number) => {
  const { range, preset = '' } = config ?? {};
  const [rawMin, rawMax] = range ?? [];
  const min = !rawMin ? 0 : Number(rawMin);
  const max = !rawMax ? 1000 : Number(rawMax);

  switch (preset) {
    case 'peak_mid':
      return smoothPeak(min, max, count);
    case 'valley_mid':
      return smoothValley(min, max, count);
    case 'increase':
      return linearRamp(min, max, count);
    case 'decrease':
      return linearRamp(max, min, count);
    case 'flat':
      return noisyFlat(min, max, count);
    case 'spike':
      return spikePattern(min, max, count);
    case 'random':
    default:
      return pureRandom(min, max, count);
  }
};

export const formatArraytoList = (array: string[]) => {
  const formatter = new Intl.ListFormat('en', {
    style: 'long',
    type: 'conjunction',
  });

  return formatter.format(array);
};

function smoothPeak(min: number, max: number, count: number) {
  const mid = Math.floor(count / 2);
  const values = [];

  for (let i = 0; i < count; i++) {
    const distanceFromCenter = Math.abs(mid - i) / mid;
    const base = lerp(max, min, distanceFromCenter);
    values.push(Math.round(base + randomInRange(-10, 10)));
  }

  return values;
}

function smoothValley(min: number, max: number, count: number) {
  const mid = Math.floor(count / 2);
  const values = [];

  for (let i = 0; i < count; i++) {
    const distanceFromCenter = Math.abs(mid - i) / mid;
    const base = lerp(min, max, distanceFromCenter);
    values.push(Math.round(base + randomInRange(-10, 10)));
  }

  return values;
}

function linearRamp(min: number, max: number, count: number, noise = 0.5): number[] {
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => {
    const base = min + i * step;
    const randomNoise = noise > 0 ? (Math.random() - 0.5) * noise * step : 0;
    return Math.round(base + randomNoise);
  });
}

function noisyFlat(min: number, max: number, count: number) {
  const avg = (min + max) / 2;
  return Array.from({ length: count }, () => Math.round(avg + randomInRange(-15, 15)));
}

function spikePattern(min: number, max: number, count: number): number[] {
  const values = pureRandom(min, max * 0.1, count); // mostly low values
  const spikeIndex = Math.floor(Math.random() * count); // random spike position
  values[spikeIndex] = Math.round(Math.random() * (max - max * 0.8) + max * 0.8); // big spike near max
  return values;
}

function pureRandom(min: number, max: number, count: number) {
  const isFloat = max <= 1;
  return Array.from({ length: count }, () => {
    const value = Math.random() * (max - min) + min;
    return isFloat ? Number(value.toFixed(2)) : Math.round(value);
  });
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function randomInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
