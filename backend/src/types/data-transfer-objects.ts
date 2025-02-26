import type { PrinterStatus, StoredModel, StoredPrinter } from './types.js';
import type { ValidationError } from 'express-validator';

export type ErrorResponse = {
  error: string;
};

export type ValidationErrorResponse = {
  errors: ValidationError[];
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
}

export type ModelsResponse = Record<string, ModelInformation>;
