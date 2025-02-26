import type { TemperatureReport, TemperatureStatus } from '../../types/types.js';

const PATTERN = /(T\d*|B@|B|C|@|P|A)\s*:\s*(\d+(?:\.\d+)?)(?:\s*\/\s*(\d+(?:\.\d+)?))?/g;

export function parseTemperatureReport(line: string): TemperatureReport {
  const result: TemperatureReport = {
    extruders: [],
  };

  let match: RegExpExecArray | null;
  while ((match = PATTERN.exec(line)) != null) {
    const label = match[1];
    const actualStr = match[2];
    const targetStr = match[3];

    const actual = parseFloat(actualStr);
    const target = targetStr !== undefined ? parseFloat(targetStr) : undefined;
    const status: TemperatureStatus = { actual, target };

    if (label === 'T') {
      result.extruder = status;
    } else if (/^T\d+$/.test(label)) {
      const extruderIndex = parseInt(label.slice(1), 10);
      result.extruders[extruderIndex] = status;
    } else if (label === 'B') {
      result.bed = status;
    } else if (label === 'C') {
      result.chamber = status;
    } else if (label === '@') {
      result.hotendPower = actual;
    } else if (label === 'B@') {
      result.bedPower = actual;
    } else if (label === 'P') {
      result.pinda = actual;
    } else if (label === 'A') {
      result.ambient = actual;
    }
  }

  return result;
}
