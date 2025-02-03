import type { NextFunction, Request, Response } from 'npm:express@5.0.1';
import { validationResult } from 'npm:express-validator@7.2.1';
import { StatusCodes } from 'npm:http-status-codes@2.3.0';
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
