import type { Request, Response } from 'express';

/**
 * Healthcheck route handler.
 * Responds with a 200 OK status to indicate the service is running.
 * @param {Request} _request - The incoming request object (not used).
 * @param {Response} response - The response object to send the status.
 */
export default function healthcheck(_request: Request, response: Response): void {
  response.sendStatus(200);
}
