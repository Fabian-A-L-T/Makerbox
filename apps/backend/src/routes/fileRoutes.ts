import express, { Router } from "express";
import FileController from "../controllers/FileController.js";
import checkAdmin from "../middlewares/checkAdmin.js";
import upload from "../middlewares/uploadFile.js";
import { route } from "../openapi/wrapper.js";
import { file, object, string } from "valibot";
import { messageSchema, uploadedFile } from "../utils/schemas.js";

const router: Router = express.Router();
const PATH = '/api/files';
const requireAuth = true;

route(router, PATH, { method: 'post', path: '/upload/image', middlewares: [checkAdmin, upload.single('images')], handler: FileController.uploadFile,
  summary: 'Subir imagen',
  tags: ['Archivos'],
  requireAuth,
  body: object({file: uploadedFile({ mimeTypes: ['image/jpeg', 'image/png', 'image.gif', 'image/webp'] })}),
  responses: {
    200: { description: 'Lista de herramientas', schema: object({url: string()})},
    400: { description: 'No se ha enviado un archivo', schema: messageSchema },
    403: { description: 'Prohibido', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'post', path: '/upload/document', middlewares: [checkAdmin, upload.single('documents')], handler: FileController.uploadFile,
  summary: 'Subir documento',
  tags: ['Archivos'],
  requireAuth,
  body: object({file: uploadedFile({ mimeTypes: ['image/jpeg', 'image/png', 'image.gif', 'image/webp'] })}),
  responses: {
    200: { description: 'Lista de herramientas', schema: object({url: string()})},
    400: { description: 'No se ha enviado un archivo', schema: messageSchema },
    403: { description: 'Prohibido', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});
route(router, PATH, { method: 'post', path: '/delete', middlewares: [checkAdmin], handler: FileController.deleteFile,
  summary: 'Eliminar archivo',
  tags: ['Archivos'],
  requireAuth,
  body: object({fileUrl: string()}),
  responses: {
    200: { description: 'Lista de herramientas', schema: messageSchema},
    400: { description: 'No se ha enviado un archivo', schema: messageSchema },
    403: { description: 'Prohibido', schema: messageSchema },
    500: { description: 'Error del servidor', schema: messageSchema },
  }
});

export default router;
