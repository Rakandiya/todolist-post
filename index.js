const express = require("express");
const mongoose = require("mongoose");
const app = express();
require("dotenv").config();

const port = process.env.PORT || 3000;
const todoRoutes = require("./routes/todoRoutes");
const logger = require("./utils/logger");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./utils/swagger");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Tambahkan middleware logging untuk request
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  next();
});

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    const mongoOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    // Tambahkan kredensial jika tersedia
    if (process.env.MONGODB_USER && process.env.MONGODB_PASS) {
      mongoOptions.auth = {
        username: process.env.MONGODB_USER,
        password: process.env.MONGODB_PASS,
      };
    }

    await mongoose.connect(mongoURI, mongoOptions);
    logger.info("Berhasil terhubung ke MongoDB");
  } catch (err) {
    logger.error("Gagal terhubung ke MongoDB:", err);
    process.exit(1);
  }
};

connectDB();

// Basic route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/todos", todoRoutes);

app.use("/uploads", express.static("uploads"));

// Swagger documentation route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.listen(port, () => {
  logger.info(`Server berjalan di port ${port}`);
});
