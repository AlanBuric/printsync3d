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

export type PrinterStatus = {
  temperatureReport: TemperatureReport;
  lastPreheatOption?: PreheatControlType;
  isFilamentLoaded: boolean;
  currentModel?: string;
};

const PRINTER_CONTROLS = {
  preheatPla: ['M140 S60', 'M104 S215'],
  preheatAbs: ['M140 S100', 'M104 S240'],
  preheatPet: ['M140 S90', 'M104 S230'],
  moveUp: ['G1 Z10 F3000'],
  moveDown: ['G1 Z-10 F3000'],
  moveLeft: ['G1 X-10 F3000'],
  moveRight: ['G1 X10 F3000'],
  moveForward: ['G1 Y10 F3000'],
  moveBackward: ['G1 Y-10 F3000'],
  cooldown: ['M140 S0', 'M104 S0'],
  loadFilament: ['M701'],
  unloadFilament: ['M702'],
  autoHome: ['G28'],
  meshBedLeveling: ['G80', 'G29'],
  resetXyz: ['M502'],
  resume: ['M24'],
  pause: ['M25'],
  cancel: ['M526'],
} as const;

export type PrinterControlType = keyof typeof PRINTER_CONTROLS;

export type PreheatControlType = 'preheatPla' | 'preheatAbs' | 'preheatPet';

export type StoredPrinter = {
  /**
   * Display name of the model as originally uploaded by the user or custom set afterward.
   */
  displayName: string;
};

export type StoredModel = {
  /**
   * Display name of the model as originally uploaded by the user or custom set afterward.
   */
  displayName: string;
};

export type ErrorResponse = {
  error: string;
};

export type PrinterResponse = PrinterStatus & StoredPrinter & { printerId: string };

export type ModelInformation = StoredModel & {
  /**
   * Size of the model file in bytes.
   */
  size: number;
  /**
   * Creation timestamp, or last modification timestamp if unavailable, of this file.
   */
  creationTimestamp?: number;
};

export type ModelsResponse = Record<string, ModelInformation>;
