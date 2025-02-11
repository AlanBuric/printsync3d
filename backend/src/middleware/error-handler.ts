import type { Context } from 'hono';
import RequestError from '../util/RequestError.ts';
import { StatusCodes } from 'http-status-codes';
import { ErrorHandler, HTTPResponseError } from 'hono/types';

const errorHandler: ErrorHandler = (
  error: Error | HTTPResponseError,
  context: Context,
) => {
  if (error instanceof RequestError) {
    return context.text(error.message, error.statusCode);
  }

  console.error(
    `An error was caught in the route ${context.req.method} ${context.req.url}:`,
    error,
  );

  return context.text(
    'Internal server error',
    StatusCodes.INTERNAL_SERVER_ERROR,
  );
};

export default errorHandler;
