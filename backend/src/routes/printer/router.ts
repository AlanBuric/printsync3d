import { Hono } from "hono";
import PrinterService from "./service.ts";
import { StatusCodes } from "http-status-codes";
import PRINTER_CONTROLS, { PRINTER_CONTROL_TYPES } from "./known-controls.ts";
import ModelService from "../model/service.ts";
import { getDatabase } from "../../database/database.ts";
import PrinterController from "./controller.ts";
import { PrinterControlType } from "../../types/types.ts";

const PrinterRouter = new Hono()
  .get("/", (context) => context.json(PrinterController.getPrinters()))
  .post("/refresh", async (context) => {
    await PrinterService.refreshConnections();

    return context.json(PrinterController.getPrinters());
  })
  .get("/:printerId", (context) => {
    const printerId = context.req.param("printerId");

    if (!printerId || printerId.trim() === "") {
      return context.text("Printer ID is a required string", 400);
    }

    return context.json(PrinterController.getPrinter(printerId));
  })
  .patch("/:printerId", async (context) => {
    const printerId = context.req.param("printerId");

    if (!printerId || printerId.trim() === "") {
      return context.text("Printer ID is a required string", 400);
    }

    const body = await context.req.json();
    let displayName = body.displayName;

    if (typeof displayName !== "string" || displayName.trim() === "") {
      return context.text("Display name is required", 400);
    }

    displayName = displayName.trim();

    const min = 1,
      max = 50;

    if (displayName.length < min || displayName.length > max) {
      return context.text(
        `Printer display name must be between ${min} and ${max} characters long`,
        400
      );
    }

    const printer = getDatabase().data.printers[printerId];

    if (!printer) {
      return context.text("Printer not found", StatusCodes.NOT_FOUND);
    }

    printer.displayName = displayName;

    return context.text("Updated", 200);
  })
  .delete("/:printerId", (context) => {
    const printerId = context.req.param("printerId");

    if (!printerId || printerId.trim() === "") {
      return context.text("Printer ID is a required string", 400);
    }

    PrinterService.removePrinter(printerId);

    return context.text("", StatusCodes.OK);
  })
  .get("/control", (context) => context.json(Object.keys(PRINTER_CONTROLS)))
  .post("/:printerId/control", async (context) => {
    const printerId = context.req.param("printerId");

    if (!printerId || printerId.trim() === "") {
      return context.text("Printer ID is a required string", 400);
    }

    const body = await context.req.json();
    const controlType: PrinterControlType = body.controlType;

    if (!PRINTER_CONTROL_TYPES.includes(controlType)) {
      return context.text(
        `Control type needs to be one of the following strings: ${PRINTER_CONTROL_TYPES.join(
          ", "
        )}`,
        400
      );
    }

    PrinterService.sendGCode(
      PrinterService.getConnectedPrinter(printerId),
      controlType
    );

    return context.text("", StatusCodes.OK);
  })
  .post("/:printerId/print/:modelId", async (context) => {
    const printerId = context.req.param("printerId");
    const modelId = context.req.param("modelId");

    if (!printerId || printerId.trim() === "") {
      return context.text("Printer ID is a required string", 400);
    } else if (!modelId || modelId.trim() === "") {
      return context.text("Model ID is a required string", 400);
    }

    const printer = PrinterService.getConnectedPrinter(printerId);

    if (printer.status?.currentModel) {
      return context.text(
        "Printer already has a selected model",
        StatusCodes.CONFLICT
      );
    }

    const modelFileStream = await ModelService.getModelFileStream(modelId);

    PrinterService.printGCodeModel(printer, modelFileStream, modelId);

    return context.text("", StatusCodes.OK);
  });

export default PrinterRouter;
