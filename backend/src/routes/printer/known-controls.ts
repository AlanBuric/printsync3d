const PRINTER_CONTROLS = {
  'preheat-pla': ['M140 R60', 'M104 R215'],
  'preheat-abs': ['M140 R100', 'M104 R240'],
  'preheat-pet': ['M140 R90', 'M104 R230'],
  'move-up': ['G1 Z10 F3000'],
  'move-down': ['G1 Z-10 F3000'],
  'move-left': ['G1 X-10 F3000'],
  'move-right': ['G1 X10 F3000'],
  'move-forward':['G1 Y10 F3000'],
  'move-backward':['G1 Y-10 F3000'],
  cooldown: ['M140 R0', 'M104 R0'],
  'load-filament': ['M701'],
  'unload-filament': ['M702'],
  'auto-home': ['G28'],
  'mesh-bed-leveling': ['G80', 'G29'],
  'reset-xyz': ['M502'],
  start: ['M75'],
  pause: ['M77'],
  resume: ['M24'],
  cancel: ['M577'],
} as const;

export default PRINTER_CONTROLS;
export const PRINTER_CONTROL_TYPES = Object.keys(PRINTER_CONTROLS);
