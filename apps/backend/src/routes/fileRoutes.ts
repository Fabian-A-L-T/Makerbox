import express, { Router } from "express";
import FileController from "../controllers/FileController.js";
import checkAdmin from "../middlewares/checkAdmin.js";
import upload from "../middlewares/uploadFile.js";

const router: Router = express.Router();

router.post('/upload/image', checkAdmin, upload.single('images'), FileController.uploadFile);
router.post('/upload/document', checkAdmin, upload.single('documents'), FileController.uploadFile);
router.post('/delete', checkAdmin, FileController.deleteFile);

export default router;
