const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// publicフォルダを静的ファイルとして提供
app.use(express.static("public"));

io.on("connection", socket => {
  console.log("ユーザーが接続しました");

  // テキストメッセージ受信
  socket.on("chat message", msg => {
    io.emit("chat message", msg);
  });

  // 画像メッセージ受信
  socket.on("chat image", data => {
    io.emit("chat image", data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`サーバーが起動しました！ポート: ${PORT}`);
});
