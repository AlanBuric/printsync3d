import { NextFunction, Request, Response } from 'npm:express@5.0.1';
import RequestError from '../util/RequestError.ts';
import { StatusCodes } from 'npm:http-status-codes@2.3.0';

export default function handleServerError(
  error: any,
  request: Request,
  response: Response<string>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): Response {
  if (error instanceof RequestError) {
    return response.status(error.statusCode).send(error.message);
  }

  console.error(
    `An error was caught in the Express route ${request.method} ${request.originalUrl}:`,
    error,
  );
  response.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Internal server error");
}
