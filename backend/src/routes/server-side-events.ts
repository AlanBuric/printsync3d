import { createChannel, createSession } from 'better-sse';
import type { Request, Response } from 'express';

export const sseChannel = createChannel();

export default async function handleServerSideEvents(request: Request, response: Response) {
  sseChannel.register(await createSession(request, response));
}
