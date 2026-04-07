const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
require("dotenv").config();

const app = express();

// Middleware
/*Dùng để log khi request đến server
dev → ngắn gọn, có màu (dev dùng)
combined → chuẩn Apache (production)
tiny → cực gọn
short → trung bình*/
app.use(morgan("dev"));

/*Ẩn thông tin server (X-Powered-By)
Thêm header bảo mật
Ngăn hack cơ bản*/
app.use(helmet());

/*Nén response body để giảm kích thước*/
app.use(compression());
app.use(express.json());

//init DB
// require("./src/dbs/init.mongodb.lv0");
require("./dbs/init.mongodb");

// Routes
app.use("", require("./routers"));

module.exports = app;
