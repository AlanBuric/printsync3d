import { describe, test } from 'jsr:@std/testing/bdd';
import { expect } from 'jsr:@std/expect';
import { parseTemperatureReport } from './reporting.ts';
import { TemperatureReport } from '../../types/types.ts';

describe('Temperature report string to TemperatureReport object parsing tests', () => {
  const testCases: TemperatureReportParsingTestCase[] = [
    {
      printerResponse:
        'ok T:20.2 /0.0 B:19.1 /0.0 T0:20.2 /0.0 @:0 B@:0 P:19.8 A:26.4',
      temperatureReport: {
        extruder: 'T:20.2 /0.0',
        extruders: {
          0: 'T0:20.2 /0.0',
        },
        bed: 'B:19.1 /0.0',
      },
    },
    {
      printerResponse: 'ok T:190 /210 T0:90 /100 T1:80/150 B:80 /50 C:28 /50',
      temperatureReport: {
        extruder: 'T:190 /210',
        extruders: {
          0: 'T0:90 /100',
          1: 'T1:80/150',
        },
        bed: 'B:80 /50',
        chamber: 'C:28 /50',
      },
    },
  ];

  testCases.forEach((testCase) =>
    test(
      testCase.printerResponse,
      () =>
        expect(parseTemperatureReport(testCase.printerResponse)).toMatchObject(
          testCase.temperatureReport,
        ),
    )
  );
});

interface TemperatureReportParsingTestCase {
  printerResponse: string;
  temperatureReport: TemperatureReport;
}
