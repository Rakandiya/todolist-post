const multer = require("multer");
const path = require("path");
const fs = require("fs");
const logger = require("../utils/logger");

// Buat folder uploads jika belum ada
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4"];
  if (allowedTypes.includes(file.mimetype)) {
    logger.info(`File upload diterima: ${file.originalname}`, {
      mimetype: file.mimetype,
      size: file.size,
    });
    cb(null, true);
  } else {
    logger.warn(`Percobaan upload file tidak didukung: ${file.originalname}`, {
      mimetype: file.mimetype,
    });
    cb(new Error("Format file tidak didukung"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

module.exports = upload;
