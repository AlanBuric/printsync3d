import type { PrinterStatus, StoredModel, StoredPrinter } from './types.js';
import type { ValidationError } from 'express-validator';

export type ValidationErrorResponse = {
  errors: ValidationError[];
};

export type PrinterResponse = PrinterStatus & StoredPrinter & { printerId: string };

export type ModelResponse = StoredModel & {
  modelId: string;
  /**
   * Size of the model file in bytes.
   */
  size: number;
  /**
   * Creation timestamp, or last modification timestamp if unavailable, of this file.
   */
  creationTimestamp?: number;
};
