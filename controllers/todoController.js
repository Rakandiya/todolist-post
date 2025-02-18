const Todo = require("../models/Todo");
const fs = require("fs").promises;
const path = require("path");
const logger = require("../utils/logger");

class TodoController {
  async validateFileExists(mediaUrl) {
    if (mediaUrl.startsWith("/uploads/")) {
      const filePath = path.join(
        process.cwd(),
        mediaUrl.replace("/uploads/", "uploads/")
      );
      try {
        await fs.access(filePath);
        logger.debug(`File tervalidasi: ${mediaUrl}`);
        return true;
      } catch {
        logger.error(`File tidak ditemukan: ${mediaUrl}`);
        throw new Error(`File tidak ditemukan: ${mediaUrl}`);
      }
    }
    return true;
  }

  async deleteFile(filename) {
    try {
      const filePath = path.join(process.cwd(), filename);
      try {
        await fs.access(filePath);
        await fs.unlink(filePath);
        logger.info(`File berhasil dihapus: ${filename}`);
        return true;
      } catch (err) {
        logger.warn(`File tidak ditemukan saat menghapus: ${filename}`);
        return false;
      }
    } catch (err) {
      logger.error(`Error saat menghapus file: ${filename}`, err);
      return false;
    }
  }

  async createTodo(req, res) {
    try {
      const todoData = req.body;

      // Validasi keberadaan file
      if (todoData.media) {
        for (const media of todoData.media) {
          await this.validateFileExists(media.url);
        }
      }

      const todo = new Todo(todoData);
      const savedTodo = await todo.save();
      logger.info(`Todo berhasil dibuat dengan ID: ${savedTodo._id}`);

      res.status(201).json({
        success: true,
        data: savedTodo,
      });
    } catch (error) {
      logger.error("Error saat membuat todo:", error);
      res.status(400).json({
        success: false,
        message: "Gagal membuat todo",
        error: error.message,
      });
    }
  }

  async updateTodo(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const oldTodo = await Todo.findById(id);
      if (!oldTodo) {
        throw new Error("Todo tidak ditemukan");
      }

      // Validasi keberadaan file baru
      if (updateData.media) {
        for (const media of updateData.media) {
          await this.validateFileExists(media.url);
        }

        // Hapus semua file lama yang tidak ada di data baru
        const oldFiles = oldTodo.media
          .filter((m) => m.type === "file")
          .map((m) => m.url.replace("/uploads/", "uploads/"));

        const newFiles = updateData.media
          .filter((m) => m.type === "file")
          .map((m) => m.url.replace("/uploads/", "uploads/"));

        // Hapus file lama yang tidak ada di data baru
        for (const oldFile of oldFiles) {
          if (!newFiles.includes(oldFile)) {
            logger.info(`Menghapus file lama: ${oldFile}`);
            await this.deleteFile(oldFile);
          }
        }
      }

      const todo = await Todo.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      res.json({
        success: true,
        data: todo,
      });
    } catch (error) {
      logger.error("Error saat update todo:", error);
      res.status(400).json({
        success: false,
        message: "Gagal mengupdate todo",
        error: error.message,
      });
    }
  }

  async getTodos(req, res) {
    try {
      const query = {};

      if (req.query.search) {
        query.$text = { $search: req.query.search };
      }

      if (req.query.status) {
        query.status = req.query.status;
      }

      if (req.query.priority) {
        query.priority = req.query.priority;
      }

      if (req.query.platform) {
        query.platform = req.query.platform;
      }

      if (req.query.startDate || req.query.endDate) {
        query.createdAt = {};
        if (req.query.startDate) {
          query.createdAt.$gte = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
          query.createdAt.$lte = new Date(req.query.endDate);
        }
      }

      const todos = await Todo.find(query).sort({ createdAt: -1 });
      res.json({
        success: true,
        data: todos,
      });
    } catch (error) {
      logger.error("Error saat mengambil todos:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil todos",
        error: error.message,
      });
    }
  }

  async getTodoById(req, res) {
    try {
      const todo = await Todo.findById(req.params.id);
      if (!todo) {
        throw new Error("Todo tidak ditemukan");
      }
      res.json({
        success: true,
        data: todo,
      });
    } catch (error) {
      logger.error("Error saat mengambil todo:", error);
      res.status(404).json({
        success: false,
        message: "Todo tidak ditemukan",
        error: error.message,
      });
    }
  }

  async deleteTodo(req, res) {
    try {
      const todo = await Todo.findById(req.params.id);
      if (!todo) {
        throw new Error("Todo tidak ditemukan");
      }

      // Hapus file yang terkait
      const files = todo.media
        .filter((m) => m.type === "file")
        .map((m) => m.url);

      for (const file of files) {
        await this.deleteFile(file);
      }

      await Todo.findByIdAndDelete(req.params.id);
      res.json({
        success: true,
        message: "Todo berhasil dihapus",
      });
    } catch (error) {
      logger.error("Error saat menghapus todo:", error);
      res.status(404).json({
        success: false,
        message: "Gagal menghapus todo",
        error: error.message,
      });
    }
  }

  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Tidak ada file yang diupload",
        });
      }

      // Validasi file yang diupload
      await this.validateFileExists(`/uploads/${req.file.filename}`);

      res.json({
        success: true,
        message: "File berhasil diupload",
        data: {
          type: "file",
          url: `/uploads/${req.file.filename}`,
        },
      });
    } catch (error) {
      logger.error("Error saat upload file:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengupload file",
        error: error.message,
      });
    }
  }
}

module.exports = new TodoController();
