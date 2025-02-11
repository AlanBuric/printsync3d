import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import {
  ClientErrorStatusCode,
  ServerErrorStatusCode,
} from 'hono/utils/http-status';

export default class RequestError extends Error {
  readonly statusCode: ServerErrorStatusCode | ClientErrorStatusCode;

  constructor(
    statusCode: ServerErrorStatusCode | ClientErrorStatusCode =
      StatusCodes.BAD_REQUEST,
    message?: string,
  ) {
    super(message ?? getReasonPhrase(statusCode));

    this.statusCode = statusCode;
  }
}
