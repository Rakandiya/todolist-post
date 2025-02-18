const winston = require("winston");
const path = require("path");

// Buat folder logs jika belum ada
const fs = require("fs");
if (!fs.existsSync("logs")) {
  fs.mkdirSync("logs");
}

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Log error ke file
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    // Log semua level ke file
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
    // Log ke console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

module.exports = logger;
