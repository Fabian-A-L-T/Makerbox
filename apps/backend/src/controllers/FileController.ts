import type { Request, Response } from "express";
import fs from "fs";

export default class FileController {
    static async deleteFile(req: Request, res: Response) {
        const { fileUrl } = req.body;
        if (fileUrl && fileUrl.startsWith('uploads')) {
            fs.unlink(fileUrl, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'Error deleting file' });
                }
                res.json({ message: 'File deleted successfully' });
            });
        } else {
            res.status(400).json({ message: 'Invalid file URL' });
        }
    }

    static async uploadFile(req: Request, res: Response) {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        res.json({ url: req.file.path });
    }
}
