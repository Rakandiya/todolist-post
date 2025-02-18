# Todo Social Media Management API

Aplikasi API untuk manajemen konten sosial media dengan fitur penjadwalan posting dan pengelolaan media.

## 📑 Daftar Isi

- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Instalasi](#instalasi)
- [Penggunaan API](#penggunaan-api)
- [Dokumentasi API](#dokumentasi-api)
- [Struktur Proyek](#struktur-proyek)

## ✨ Fitur

- **Manajemen Todo**
  - Create, Read, Update, Delete (CRUD) todo
  - Pencarian dan filter todo
  - Penjadwalan posting
- **Manajemen Media**
  - Upload file media
  - Mendukung URL eksternal
  - Validasi file otomatis
- **Platform Support**
  - Instagram
  - Facebook
  - Twitter
  - TikTok
- **Fitur Tambahan**
  - Sistem tag
  - Prioritas todo (low/medium/high)
  - Status tracking (draft/scheduled/posted)
  - Logging sistem

## 🛠 Teknologi

- **Backend**
  - Node.js
  - Express.js
  - MongoDB
  - Mongoose
  - Nodemon (Development)
- **Tools & Library**
  - Swagger UI (Dokumentasi API)
  - Winston (Logging)
  - Multer (Upload File)
  - Express Validator (Validasi)

## 💻 Instalasi

1. **Clone Repositori**

   ```bash
   git clone https://github.com/Rakandiya/todolist-post.git
   cd todolist-post
   ```

2. **Install Dependensi**

   ```bash
   npm install
   ```

3. **Konfigurasi Environment**

   ```bash
   cp .env.example .env
   ```

   Sesuaikan konfigurasi di file .env:

   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/todo-app
   MONGODB_USER=your_username     # Optional
   MONGODB_PASS=your_password     # Optional
   ```

4. **Jalankan Aplikasi**

   Development (dengan Nodemon):

   ```bash
   nodemon index
   ```

## 🚀 Penggunaan API

### Endpoint Todo

| Method | Endpoint            | Deskripsi               |
| ------ | ------------------- | ----------------------- |
| GET    | `/api/todos`        | Mendapatkan semua todo  |
| POST   | `/api/todos`        | Membuat todo baru       |
| GET    | `/api/todos/:id`    | Mendapatkan detail todo |
| PUT    | `/api/todos/:id`    | Mengupdate todo         |
| DELETE | `/api/todos/:id`    | Menghapus todo          |
| POST   | `/api/todos/upload` | Upload media            |

### Contoh Request

```json
// Membuat Todo Baru
POST /api/todos
{
  "title": "Post Promo Akhir Tahun",
  "content": "Diskon hingga 50% untuk semua produk",
  "platform": "instagram",
  "status": "scheduled",
  "scheduledDate": "2024-12-31T15:00:00Z",
  "media": [
    {
      "type": "file",
      "url": "/uploads/promo-image.jpg"
    }
  ],
  "tags": ["promo", "diskon", "akhirtahun"],
  "priority": "high"
}
```

```json
// Response Success
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Post Promo Akhir Tahun",
    "content": "Diskon hingga 50% untuk semua produk",
    "platform": "instagram",
    "status": "scheduled",
    "scheduledDate": "2024-12-31T15:00:00Z",
    "media": [
      {
        "type": "file",
        "url": "/uploads/promo-image.jpg"
      }
    ],
    "tags": ["promo", "diskon", "akhirtahun"],
    "priority": "high",
    "createdAt": "2023-12-20T07:00:00Z",
    "updatedAt": "2023-12-20T07:00:00Z"
  }
}
```

### Filter & Pencarian

Query parameters yang didukung:

```
GET /api/todos?status=scheduled&platform=instagram&priority=high
GET /api/todos?search=promo&startDate=2023-12-01&endDate=2023-12-31
```

Parameter yang tersedia:

- `search`: Pencarian berdasarkan judul/konten
- `status`: Filter status (draft/scheduled/posted)
- `platform`: Filter platform sosial media
- `priority`: Filter prioritas (low/medium/high)
- `startDate`: Filter dari tanggal tertentu
- `endDate`: Filter sampai tanggal tertentu

## 📖 Dokumentasi API

Akses dokumentasi lengkap API melalui Swagger UI:

```
http://localhost:3000/api-docs
```

## 📁 Struktur Proyek

```
├── controllers/
│   └── todoController.js    # Logic controller
├── models/
│   └── Todo.js             # Model database
├── routes/
│   └── todoRoutes.js       # Definisi route
├── middlewares/
│   └── uploadMiddleware.js # Middleware upload
├── utils/
│   ├── logger.js          # Konfigurasi logger
│   └── swagger.js         # Konfigurasi Swagger
├── uploads/               # Folder media
├── index.js              # Entry point
└── README.md
```

## 🔍 Error Handling

Format response error:

```json
{
  "success": false,
  "message": "Gagal membuat todo",
  "errors": ["Title harus diisi", "Platform tidak valid"]
}
```

## 📝 Logging

Sistem logging menggunakan Winston:

- `logs/error.log`: Menyimpan log error
- `logs/combined.log`: Menyimpan semua aktivitas

Log format:

```json
{
  "level": "error",
  "timestamp": "2023-12-20T07:00:00Z",
  "message": "Gagal mengupload file",
  "metadata": {
    "userId": "123",
    "path": "/api/todos/upload"
  }
}
```

## 📄 Lisensi

[MIT License](LICENSE)

## 👥 Kontak

Mochammad Rakandiya

- Email: rakandiya.safwan@gmail.com
- GitHub: [rakandiya](https://github.com/Rakandiya)
- LinkedIn: [Mochammad Rakandiya](https://www.linkedin.com/in/rakandiya-shafwan/)

Link Proyek: [https://github.com/Rakandiya/todolist-post.git](https://github.com/Rakandiya/todolist-post.git)
