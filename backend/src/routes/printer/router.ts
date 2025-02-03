import { Request, Response, Router } from "npm:express@5.0.1";
import PrinterService from "./service.ts";
import { PrinterStatus } from "../../types/types.ts";
import { body, matchedData, param } from "npm:express-validator@7.2.1";
import handleValidationResults from "../../middleware/validation-handler.ts";
import { StatusCodes } from "npm:http-status-codes@2.3.0";
import PRINTER_CONTROLS, { PRINTER_CONTROL_TYPES } from "./known-controls.ts";
import ModelService from "../model/service.ts";
import { ErrorResponse } from "../../types/data-transfer-objects.ts";
import { MinMaxOptions } from "npm:express-validator@7.2.1/lib/options.js";
import { getDatabase } from "../../database/database.ts";
import PrinterController from "./controller.ts";
import { MODEL_ID_VALIDATOR } from "../model/router.ts";

const PRINTER_ID_VALIDATOR = param("printerId")
  .notEmpty()
  .withMessage("Printer ID is a required string")
  .isString()
  .withMessage("Printer ID needs to be a string");
const printerDisplayNameMinMax: MinMaxOptions = { min: 1, max: 50 };

const PrinterRouter = Router()
  .get(
    "",
    (_request: Request, response: Response<PrinterStatus[]>) =>
      response.send(PrinterController.getPrinters()),
  )
  .post("/refresh", async (_request: Request, response: Response) => {
    await PrinterService.refreshConnections();
    response.send(PrinterController.getPrinters());
  })
  .get(
    "/:printerId",
    PRINTER_ID_VALIDATOR,
    handleValidationResults,
    (request: Request, response: Response<PrinterStatus>) =>
      response.send(
        PrinterController.getPrinter(matchedData(request).printerId),
      ),
  )
  .patch(
    "/:printerId",
    PRINTER_ID_VALIDATOR,
    body("displayName")
      .trim()
      .notEmpty()
      .withMessage("Display name is required")
      .bail()
      .isLength(printerDisplayNameMinMax)
      .withMessage(
        `Printer display name must be between ${printerDisplayNameMinMax.min} and ${printerDisplayNameMinMax.max} characters long`,
      )
      .escape(),
    handleValidationResults,
    (request: Request, response: Response<ErrorResponse>) => {
      const { printerId, displayName } = matchedData(request);
      const printer = getDatabase().data.printers[printerId];

      if (!printer) {
        return response.sendStatus(StatusCodes.NOT_FOUND);
      }

      printer.displayName = displayName;
    },
  )
  .delete(
    "/:printerId",
    PRINTER_ID_VALIDATOR,
    (request: Request, response: Response) => {
      const { printerId } = matchedData(request);
      PrinterService.removePrinter(printerId);
      response.sendStatus(StatusCodes.OK);
    },
  )
  .get(
    "/control",
    (_request: Request, response: Response) =>
      response.send(Object.keys(PRINTER_CONTROLS)),
  )
  .post(
    "/:printerId/control",
    PRINTER_ID_VALIDATOR,
    body("controlType")
      .notEmpty()
      .withMessage("Control type is a required string")
      .isIn(PRINTER_CONTROL_TYPES)
      .withMessage(
        `Control type needs to be one of the following strings: ${
          PRINTER_CONTROL_TYPES.join(", ")
        }`,
      ),
    handleValidationResults,
    (request: Request, response: Response) => {
      const { printerId, controlType } = matchedData(request);

      PrinterService.sendGCode(printerId, controlType);

      response.sendStatus(StatusCodes.OK);
    },
  )
  .post(
    "/:printerId/print/:modelId",
    PRINTER_ID_VALIDATOR,
    MODEL_ID_VALIDATOR,
    handleValidationResults,
    (request: Request, response: Response) => {
      const { printerId, modelId } = matchedData(request);
      const printer = PrinterService.getConnectedPrinter(printerId);

      if (printer.status.currentModel) {
        return response
          .status(StatusCodes.FORBIDDEN)
          .send("Printer already has a selected model");
      }

      PrinterService.printGCodeModel(
        printer,
        ModelService.getModelFileStream(modelId),
        modelId,
      );

      response.sendStatus(StatusCodes.OK);
    },
  );

export default PrinterRouter;
