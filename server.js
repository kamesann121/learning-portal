const express = require("express");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const USERS_FILE = path.join(__dirname, "users.json");
const BANNED_FILE = path.join(__dirname, "banned.json");

app.use(express.static("public"));
app.use(express.json());

// 🔐 ユーザー登録API（BANチェック付き）
app.post("/register", (req, res) => {
  const { username } = req.body;
  if (!username) return res.json({ success: false, reason: "名前が空です" });

  let banned = [];
  if (fs.existsSync(BANNED_FILE)) {
    banned = JSON.parse(fs.readFileSync(BANNED_FILE));
  }

  if (banned.includes(username)) {
    return res.json({ success: false, reason: "このユーザーは登録できません" });
  }

  let users = [];
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE));
  }

  if (users.includes(username)) {
    return res.json({ success: false, reason: "すでに登録されています" });
  }

  users.push(username);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users));
  res.json({ success: true });
});

// 🔑 ログインAPI（BAN＆登録チェック付き）
app.post("/login", (req, res) => {
  const { username } = req.body;
  if (!username) return res.json({ success: false, reason: "名前が空です" });

  let banned = [];
  if (fs.existsSync(BANNED_FILE)) {
    banned = JSON.parse(fs.readFileSync(BANNED_FILE));
  }

  if (banned.includes(username)) {
    return res.json({ success: false, reason: "このユーザーはBANされています" });
  }

  let users = [];
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE));
  }

  if (!users.includes(username)) {
    return res.json({ success: false, reason: "登録されていません" });
  }

  res.json({ success: true });
});

// 💬 Socket.IO チャット処理（BANユーザーは拒否）
io.on("connection", socket => {
  console.log("ユーザーが接続しました");

  socket.on("chat message", msg => {
    if (isBanned(msg.user)) return;
    io.emit("chat message", msg);
  });

  socket.on("chat image", data => {
    if (isBanned(data.user)) return;
    io.emit("chat image", data);
  });
});

// 🚫 BANチェック関数
function isBanned(username) {
  if (!username) return false;
  if (!fs.existsSync(BANNED_FILE)) return false;
  const banned = JSON.parse(fs.readFileSync(BANNED_FILE));
  return banned.includes(username);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🌊 サーバーが起動しました！ポート: ${PORT}`);
});
