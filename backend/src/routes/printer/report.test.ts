import { describe, expect, test } from 'vitest';
import { parseTemperatureReport } from './reporting.js';

describe('Temperature report string to TemperatureReport object parsing tests', () => {
  test('ok T:20.2 /0.0 B:19.1 /0.0 T0:20.2 /0.0 @:0 B@:0 P:19.8 A:26.4', () => {
    const report = parseTemperatureReport(
      'ok T:20.2 /0.0 B:19.1 /0.0 T0:20.2 /0.0 @:0 B@:0 P:19.8 A:26.4',
    );

    expect(report.extruder).toBe('T:20.2 /0.0');
    expect(report.bed).toBe('B:19.1 /0.0');
    expect(report.extruders).not.toBeNull();
    expect(report.extruders[0]).toBe('T0:20.2 /0.0');
  });

  test('ok T:190 /210 T0:90 /100 T1:80/150 B:80 /50 C:28 /50', () => {
    const report = parseTemperatureReport('ok T:190 /210 T0:90 /100 T1:80/150 B:80 /50 C:28 /50');

    expect(report).toMatchObject({
      extruder: 'T:190 /210',
      extruders: {
        0: 'T0:90 /100',
        1: 'T1:80/150',
      },
      bed: 'B:80 /50',
      chamber: 'C:28 /50',
    });
  });
});
