import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "./uploads/", // temp folder
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // limit 5MB
});
