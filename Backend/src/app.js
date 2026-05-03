// // app.js
// const express = require("express");
// const cors = require("cors");
// const helmet = require("helmet");
// const morgan = require("morgan");
// const path = require("path");
// const fs = require("fs");

// //Import routes
// const apiRoutes = require("./routes/index");
// const securityResidentRoutes = require("../src/modules/security/security.resident.routes")

// const app = express();


// app.use("/api/security", securityResidentRoutes);

// // ✅ CORS cấu hình đúng
// app.use(
//   cors({
//     origin: ["http://localhost:3000", "http://localhost:5173"], // Cho phép frontend
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   }),
// );

// app.use(
//   helmet({
//     crossOriginResourcePolicy: { policy: "cross-origin" }, // 👈 QUAN TRỌNG
//   }),
// );
// app.use(morgan("dev"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ✅ Serve static files với options đúng
// const uploadsPath = path.join(__dirname, "../uploads");
// app.use(
//   "/uploads",
//   express.static(uploadsPath, {
//     setHeaders: (res, path) => {
//       res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
//       res.setHeader("Access-Control-Allow-Origin", "*");
//     },
//   }),
// );

// // Kiểm tra thư mục

// // Gắn đường dẫn gốc '/api' cho tất cả các route
// app.use("/api", apiRoutes);

// // Route test để kiểm tra file
// app.get("/test-file/:filename", (req, res) => {
//   const filename = req.params.filename;
//   const filePath = path.join(uploadsPath, "avatars", filename);

//   if (fs.existsSync(filePath)) {
//     res.sendFile(filePath);
//   } else {
//     res.status(404).json({ error: "File not found" });
//   }
// });

// // Route mặc định
// app.get("/", (req, res) => {
//   res.status(200).json({ message: "Chào mừng đến với API của HOMELINK AI" });
// });

// module.exports = app;
// app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

// Import routes
const apiRoutes = require("./routes/index");
const securityResidentRoutes = require("../src/modules/security/security.resident.routes");

const app = express();

// ✅ 1. CORS - ĐẶT ĐẦU TIÊN (TRƯỚC TẤT CẢ ROUTES)
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ✅ 2. Các middleware khác
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 3. Serve static files
const uploadsPath = path.join(__dirname, "../uploads");
app.use(
  "/uploads",
  express.static(uploadsPath, {
    setHeaders: (res, path) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
  })
);

// ✅ 4. Routes - SAU CORS
app.use("/api/security", securityResidentRoutes);
app.use("/api", apiRoutes);

// Route test để kiểm tra file
app.get("/test-file/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsPath, "avatars", filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

// Route mặc định
app.get("/", (req, res) => {
  res.status(200).json({ message: "Chào mừng đến với API của HOMELINK AI" });
});

module.exports = app;