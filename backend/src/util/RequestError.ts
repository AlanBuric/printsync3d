import { getReasonPhrase, StatusCodes } from 'npm:http-status-codes@2.3.0';

export default class RequestError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number = StatusCodes.BAD_REQUEST, message?: string) {
    super(message ?? getReasonPhrase(statusCode));

    this.statusCode = statusCode;
  }
}
