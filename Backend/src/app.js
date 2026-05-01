const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

//Import cái tổng đài Route vào
const apiRoutes = require("./routes/index");

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

//Gắn đường dẫn gốc '/api' cho tất cả các route
app.use("/api", apiRoutes);

// Route mặc định để test server
app.get("/", (req, res) => {
  res.status(200).json({ message: "Chào mừng đến với API của HOMELINK AI" });
});

app.use('/uploads', (req, res, next) => {
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Access-Control-Allow-Origin', '*');
  next();
}, express.static('uploads'));

module.exports = app;
