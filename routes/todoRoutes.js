const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const { body, param, query, validationResult } = require("express-validator");
const multer = require("multer");
const todoController = require("../controllers/todoController");

/**
 * @swagger
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       required:
 *         - title
 *         - platform
 *       properties:
 *         title:
 *           type: string
 *           description: Judul todo
 *         content:
 *           type: string
 *           description: Konten todo
 *         platform:
 *           type: string
 *           enum: [instagram, facebook, twitter, tiktok]
 *           description: Platform sosial media
 *         status:
 *           type: string
 *           enum: [draft, scheduled, posted]
 *           default: draft
 *           description: Status todo
 *         scheduledDate:
 *           type: string
 *           format: date-time
 *           description: Tanggal jadwal posting
 *         media:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - type
 *               - url
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [url, file]
 *                 description: Tipe media
 *               url:
 *                 type: string
 *                 description: URL media
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tag-tag untuk todo
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *           default: medium
 *           description: Prioritas todo
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Waktu pembuatan
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Waktu terakhir update
 */

// Middleware untuk menangani error
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation middleware
const validateTodo = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title harus diisi")
    .isString()
    .withMessage("Title harus berupa text")
    .isLength({ min: 3 })
    .withMessage("Title minimal 3 karakter"),

  body("platform")
    .notEmpty()
    .withMessage("Platform harus diisi")
    .isIn(["instagram", "facebook", "twitter", "tiktok"])
    .withMessage("Platform tidak valid"),

  body("status")
    .optional()
    .isIn(["draft", "scheduled", "posted"])
    .withMessage("Status tidak valid"),

  body("scheduledDate")
    .optional()
    .custom((value, { req }) => {
      if (req.body.status === "scheduled" && !value) {
        throw new Error("Tanggal jadwal harus diisi untuk status scheduled");
      }
      return true;
    }),

  body("media")
    .isArray()
    .withMessage("Media harus berupa array")
    .notEmpty()
    .withMessage("Media harus diisi minimal 1"),

  body("media.*.type")
    .isIn(["url", "file"])
    .withMessage("Tipe media harus url atau file"),

  body("media.*.url")
    .notEmpty()
    .withMessage("URL media harus diisi")
    .custom((value, { req }) => {
      if (value.startsWith("/uploads/") || value.startsWith("http")) {
        return true;
      }
      throw new Error("URL tidak valid");
    }),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority tidak valid"),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags harus berupa array")
    .custom((value) => {
      if (!value.every((tag) => typeof tag === "string")) {
        throw new Error("Semua tags harus berupa string");
      }
      return true;
    }),

  // Middleware untuk mengecek hasil validasi
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map((err) => err.msg),
      });
    }
    next();
  },
];

// Validation untuk filter
const validateFilters = [
  query("status")
    .optional()
    .isIn(["draft", "scheduled", "posted"])
    .withMessage("Status tidak valid"),

  query("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority tidak valid"),

  query("platform")
    .optional()
    .isIn(["instagram", "facebook", "twitter", "tiktok"])
    .withMessage("Platform tidak valid"),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Format tanggal mulai tidak valid"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("Format tanggal akhir tidak valid")
    .custom((value, { req }) => {
      if (req.query.startDate && value < req.query.startDate) {
        throw new Error("Tanggal akhir harus setelah tanggal mulai");
      }
      return true;
    }),

  // Middleware untuk mengecek hasil validasi
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map((err) => err.msg),
      });
    }
    next();
  },
];

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: Mengambil semua todo
 *     tags: [Todos]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pencarian berdasarkan title atau content
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, scheduled, posted]
 *         description: Filter berdasarkan status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter berdasarkan prioritas
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [instagram, facebook, twitter, tiktok]
 *         description: Filter berdasarkan platform
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter dari tanggal
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter sampai tanggal
 *     responses:
 *       200:
 *         description: Daftar todo berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Todo'
 */
router.get("/", validateFilters, todoController.getTodos.bind(todoController));

/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: Membuat todo baru
 *     tags: [Todos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - platform
 *               - media
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               platform:
 *                 type: string
 *                 enum: [instagram, facebook, twitter, tiktok]
 *               status:
 *                 type: string
 *                 enum: [draft, scheduled, posted]
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               media:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - type
 *                     - url
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [url, file]
 *                     url:
 *                       type: string
 *     responses:
 *       201:
 *         description: Todo berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 */
router.post("/", validateTodo, todoController.createTodo.bind(todoController));

/**
 * @swagger
 * /api/todos/{id}:
 *   get:
 *     summary: Mengambil todo berdasarkan ID
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID todo
 *     responses:
 *       200:
 *         description: Todo berhasil ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Todo tidak ditemukan
 */
router.get("/:id", todoController.getTodoById.bind(todoController));

/**
 * @swagger
 * /api/todos/{id}:
 *   put:
 *     summary: Mengupdate todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID todo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - platform
 *               - media
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               platform:
 *                 type: string
 *                 enum: [instagram, facebook, twitter, tiktok]
 *               status:
 *                 type: string
 *                 enum: [draft, scheduled, posted]
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               media:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - type
 *                     - url
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [url, file]
 *                     url:
 *                       type: string
 *     responses:
 *       200:
 *         description: Todo berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 */
router.put(
  "/:id",
  validateTodo,
  todoController.updateTodo.bind(todoController)
);

/**
 * @swagger
 * /api/todos/{id}:
 *   delete:
 *     summary: Menghapus todo
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Todo berhasil dihapus
 *       404:
 *         description: Todo tidak ditemukan
 */
router.delete("/:id", todoController.deleteTodo.bind(todoController));

/**
 * @swagger
 * /api/todos/upload:
 *   post:
 *     summary: Upload file
 *     tags: [Todos]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File berhasil diupload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     url:
 *                       type: string
 */
router.post(
  "/upload",
  upload.single("file"),
  todoController.uploadFile.bind(todoController)
);

module.exports = router;
