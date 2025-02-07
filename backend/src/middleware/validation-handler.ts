import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { ValidationErrorResponse } from '../types/data-transfer-objects.ts';

export default function handleValidationResults(
  request: Request,
  response: Response<ValidationErrorResponse>,
  next: NextFunction,
): NextFunction {
  const results = validationResult(request);

  if (results.isEmpty()) {
    return next();
  }

  response.status(StatusCodes.BAD_REQUEST).send(results.array()[0].msg);
}
