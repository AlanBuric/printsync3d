import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';
import ModelService from './service.ts';
import type { ModelInformation } from '../../types/data-transfer-objects.ts';
import { getDatabase } from '../../database/database.ts';
import getLoggingPrefix from '../../util/logging.ts';
import { join } from '@std/path';

function validateModelId(modelId: string | null): string | null {
  return modelId && modelId.trim() !== '' ? modelId.trim() : null;
}

const ModelRouter = new Hono()
  .get('/', async (context) => context.json(await ModelService.getAllModels()))
  .get('/:modelId', async (context) => {
    const modelId = validateModelId(context.req.param('modelId'));

    if (!modelId) {
      return context.text('Model ID is required', StatusCodes.BAD_REQUEST);
    }

    const model: ModelInformation = await ModelService.getModel(modelId);

    return context.json(model);
  })
  .get('/:modelId/download', async (context) => {
    const modelId = validateModelId(context.req.param('modelId'));

    if (!modelId) {
      return context.text('Model ID is required', StatusCodes.BAD_REQUEST);
    }

    const filePath = join(
      ModelService.MODEL_UPLOAD_DIRECTORY,
      `${modelId}.gcode`,
    );

    try {
      const file = await Deno.open(filePath, { read: true });
      const headers = new Headers();

      headers.set('Content-Type', 'application/octet-stream');
      headers.set(
        'Content-Disposition',
        `attachment; filename="${modelId}.gcode"`,
      );

      return new Response(file.readable, { headers });
    } catch (_ignored) {
      return context.status(StatusCodes.NOT_FOUND);
    }
  })
  .patch('/:modelId', async (context) => {
    const modelId = validateModelId(context.req.param('modelId'));

    if (!modelId) {
      return context.text('Model ID is required', StatusCodes.BAD_REQUEST);
    }

    const { displayName } = await context.req.json<{ displayName: string }>();

    if (typeof displayName !== 'string' || displayName.trim() === '') {
      return context.text('Display name is required', StatusCodes.BAD_REQUEST);
    }

    await ModelService.editModel(modelId, displayName);

    return context.text('', StatusCodes.OK);
  })
  .delete('/:modelId', async (context) => {
    const modelId = validateModelId(context.req.param('modelId'));

    if (!modelId) {
      return context.text('Model ID is required', StatusCodes.BAD_REQUEST);
    }

    await ModelService.deleteModel(modelId);

    return context.text('', StatusCodes.OK);
  })
  .post('/', async (context) => {
    let formData: FormData;

    try {
      formData = await context.req.formData();
    } catch {
      return context.text(
        'Failed to parse multipart form data',
        StatusCodes.BAD_REQUEST,
      );
    }

    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return context.text('No files uploaded', StatusCodes.BAD_REQUEST);
    }

    const fileNames = (await Promise.allSettled(
      files.filter((file) => file instanceof File).map((file) =>
        ModelService.addFile(file)
      ),
    )).map((settled) => settled.status === 'fulfilled' ? settled.value : null);
    await getDatabase().write();

    console.info(`${getLoggingPrefix()} Uploaded ${files.length} models.`);

    return context.json(fileNames, StatusCodes.CREATED);
  });

export default ModelRouter;
