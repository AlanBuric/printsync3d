export type TemperatureStatus = {
  actual: number;
  target?: number;
};

/**
 * Parsed response from a generalized M105 temperature report.
 * Source: https://reprap.org/wiki/G-code#M105:_Get_Extruder_Temperature
 */
export type TemperatureReport = {
  /**
   * In a single-extruder setup, only `T` will be reported.
   * In a multi-extruder setup, some firmware variants omit `T0` – in that case,
   * `T` should be considered the temperature of the first tool.
   */
  extruder?: TemperatureStatus;
  /**
   * Temperatures of specific extruders, if multiple, prefix `T0:, T1:, ... Tn:`
   */
  extruders: TemperatureStatus[];
  /**
   * Bed temperature, prefix `B:`
   */
  bed?: TemperatureStatus;
  /**
   * Chamber temperature, prefix `C:`
   */
  chamber?: TemperatureStatus;
  /**
   * Hotend power, prefix `@:`
   */
  hotendPower?: number;
  /**
   * Bed power, prefix `B@:`
   */
  bedPower?: number;
  /**
   * Actual PINDA temperature for Prusa MK2.5/s, MK3/s, prefix `P:`
   */
  pinda?: number;
  /**
   * Ambient actual temperature (for Prusa MK3/s), prefix `A:`
   */
  ambient?: number;
};

export type PrinterControlType =
  | 'preheatPla'
  | 'preheatAbs'
  | 'preheatPet'
  | 'moveUp'
  | 'moveDown'
  | 'moveLeft'
  | 'moveRight'
  | 'moveForward'
  | 'moveBackward'
  | 'coolDown'
  | 'loadFilament'
  | 'unloadFilament'
  | 'autoHome'
  | 'meshBedLeveling'
  | 'resetXyz'
  | 'resume'
  | 'pause'
  | 'cancel';

export type PreheatControlType = 'preheatPla' | 'preheatAbs' | 'preheatPet';

export type PrinterStatus = {
  temperatureReport: TemperatureReport;
  lastPreheatOption?: PreheatControlType;
  isFilamentLoaded: boolean;
  currentModel?: string;
};

export type ErrorResponse = {
  error: string;
};

export type PrinterResponse = PrinterStatus & {
  /**
   * Display name of the model as originally uploaded by the user or custom set afterward.
   */
  displayName: string;
  printerId: string;
};

export interface ModelResponse {
  modelId: string;
  editableName?: string | null;
  /**
   * Display name of the model as originally uploaded by the user or custom set afterward.
   */
  displayName: string;
  /**
   * Size of the model file in bytes.
   */
  size: number;
  /**
   * Creation timestamp, or last modification timestamp if unavailable, of this file.
   */
  creationTimestamp?: number;
}

export interface Model extends ModelResponse {
  editableName: string;
}
