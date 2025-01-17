import { NextFunction, Request, Response } from 'express';
import RequestError from '../util/RequestError.js';
import { StatusCodes } from 'http-status-codes';
import { ErrorResponse } from '../types/data-transfer-objects.js';

export default function handleServerError(
  error: any,
  request: Request,
  response: Response<ErrorResponse>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): any {
  if (error instanceof RequestError) {
    return response.status(error.statusCode).send({ error: error.message });
  }

  console.error(
    `An error was caught in the Express route ${request.method} ${request.originalUrl}:`,
    error,
  );
  response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
}
