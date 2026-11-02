import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (_, file, cb) => {
    let fieldName = file.fieldname.toLowerCase();
    let path = `uploads/${fieldName}`;
    fs.mkdirSync(path, { recursive: true });
    cb(null, path);
  },
  filename  : (_, file, cb)  => {
    const filename = path.parse(file.originalname).name + '-' + Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${filename}${ext}`);
  }
});

const upload = multer({ storage });

export default upload;