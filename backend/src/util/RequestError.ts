import { getReasonPhrase, StatusCodes } from "http-status-codes";

export default class RequestError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number = StatusCodes.BAD_REQUEST, message?: string) {
    super(message ?? getReasonPhrase(statusCode));

    this.statusCode = statusCode;
  }
}
