import { describe, expect, test } from 'vitest';
import { parseTemperatureReport } from './reporting.js';
import { TemperatureReport } from '../../types/types.js';

describe('Temperature report parser', () => {
  test.each<TemperatureReportTestCase>([
    [
      'ok T:201 B:117',
      {
        extruder: { actual: 201 },
        extruders: [],
        bed: { actual: 117 },
      },
    ],
    [
      'ok T:201 /202 B:117 /120',
      {
        extruder: { actual: 201, target: 202 },
        extruders: [],
        bed: { actual: 117, target: 120 },
      },
    ],
    [
      'ok T:201 /202 B:117 /120 C:49.3 /50',
      {
        extruder: { actual: 201, target: 202 },
        extruders: [],
        bed: { actual: 117, target: 120 },
        chamber: { actual: 49.3, target: 50 },
      },
    ],
    [
      'ok T:201 /202 T0:110 /110 T1:23 /0 B:117 /120 C:49.3 /50',
      {
        extruder: { actual: 201, target: 202 },
        extruders: [
          { actual: 110, target: 110 },
          { actual: 23, target: 0 },
        ],
        bed: { actual: 117, target: 120 },
        chamber: { actual: 49.3, target: 50 },
      },
    ],
    [
      'ok T0:110 /110 T1:23 /0 B:117 /120',
      {
        extruders: [
          { actual: 110, target: 110 },
          { actual: 23, target: 0 },
        ],
        bed: { actual: 117, target: 120 },
      },
    ],
    [
      'ok T:20.2 /0.0 B:19.1 /0.0 T0:20.2 /0.0 @:0 B@:0 P:19.8 A:26.4',
      {
        extruder: { actual: 20.2, target: 0.0 },
        extruders: [{ actual: 20.2, target: 0.0 }],
        bed: { actual: 19.1, target: 0.0 },
        hotendPower: 0,
        bedPower: 0,
        pinda: 19.8,
        ambient: 26.4,
      },
    ],
  ])('%s', (report, expected) => {
    expect(parseTemperatureReport(report)).toMatchObject(expected);
  });
});

type TemperatureReportTestCase = [string, TemperatureReport];
