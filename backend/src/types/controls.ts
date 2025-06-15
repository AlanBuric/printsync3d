export type PreheatControlType = 'preheatPla' | 'preheatAbs' | 'preheatPet';

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
  coolDown: ['M140 S0', 'M104 S0'],
  loadFilament: ['M701'],
  unloadFilament: ['M702'],
  autoHome: ['G28'],
  meshBedLeveling: ['G80', 'G29'],
  resetXyz: ['M502'],
  resume: ['M24'],
  pause: ['M25'],
  cancel: ['M526'],
} as const;

export default PRINTER_CONTROLS;
export const PRINTER_CONTROL_TYPES = Object.keys(PRINTER_CONTROLS);
