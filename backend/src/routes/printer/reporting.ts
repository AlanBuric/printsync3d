import { TemperatureReport } from '../../types/types.js';

export function parseTemperatureReport(line: string): TemperatureReport {
  const pattern = /(T\d*|B|C)\s*:\s*\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)?/g;

  const result: TemperatureReport = {
    extruders: {},
  };

  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line)) !== null) {
    const label = match[1];
    const entire = match[0].trim();

    switch (label) {
      case 'B':
        result.bed = entire;
        break;
      case 'C':
        result.chamber = entire;
        break;
      case 'T':
        result.extruder = entire;
        break;
      default:
        if (/^T\d+$/.test(label)) {
          const extruderIndex = parseInt(label.slice(1));
          result.extruders[extruderIndex] = entire;
        }
    }
  }

  return result;
}
