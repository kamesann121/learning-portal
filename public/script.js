window.addEventListener("DOMContentLoaded", () => {
  // パスワード＆表示制御
  let unlocked = false;
  const portal = document.getElementById("gamePortal");
  document.addEventListener("keydown", e => {
    if (e.ctrlKey && e.key.toLowerCase() === "a") {
      document.getElementById("passwordSection").style.display = "block";
    }
  });
  window.toggleGamePortal = function () {
    const input = document.getElementById("password").value;
    if (!unlocked && input === "810") {
      portal.style.display = "block";
      unlocked = true;
    } else if (unlocked) {
      portal.style.display = portal.style.display === "none" ? "block" : "none";
    } else {
      alert("パスワードが違います。");
    }
  };

  // 名前保存＆復元
  const usernameInput = document.getElementById("usernameInput");
  if (usernameInput) {
    const savedName = localStorage.getItem("username");
    if (savedName) {
      usernameInput.value = savedName;
    }
    usernameInput.addEventListener("input", e => {
      localStorage.setItem("username", e.target.value);
    });
  }

  // Socket.IO チャット
  const socket = io();

  window.sendMessage = function () {
    const msg = document.getElementById("chatInput").value.trim();
    const username = document.getElementById("usernameInput").value.trim() || "匿名";
    if (msg) {
      socket.emit("chat message", `${username}: ${msg}`);
      document.getElementById("chatInput").value = "";
    }
  };

  window.sendImage = function () {
    const fileInput = document.getElementById("imageInput");
    const file = fileInput.files[0];
    const username = document.getElementById("usernameInput").value.trim() || "匿名";

    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const imageData = e.target.result;
        socket.emit("chat image", {
          user: username,
          image: imageData
        });
      };
      reader.readAsDataURL(file);
      fileInput.value = "";
    }
  };

  socket.on("chat message", msg => {
    const m = document.createElement("div");
    m.textContent = msg;
    document.getElementById("messages").appendChild(m);
    document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
  });

  socket.on("chat image", data => {
    const m = document.createElement("div");
    m.innerHTML = `<strong>${data.user}:</strong><br><img src="${data.image}" style="max-width:200px; border-radius:8px;">`;
    document.getElementById("messages").appendChild(m);
    document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
  });

  // 言語＆テーマ切り替え
  const translations = {
    ru: {
      portalTitle: "🎮 Игровой портал",
      chatTitle: "💬 Чат",
      sendBtn: "Отправить",
      passwordHeading: "🔐 Требуется пароль для доступа",
      toggleBtn: "Переключить"
    },
    zh: {
      portalTitle: "🎮 游戏门户",
      chatTitle: "💬 聊天室",
      sendBtn: "发送",
      passwordHeading: "🔐 需要密码访问",
      toggleBtn: "切换"
    },
    ko: {
      portalTitle: "🎮 게임 포털",
      chatTitle: "💬 채팅방",
      sendBtn: "보내기",
      passwordHeading: "🔐 비밀번호が 필요합니다",
      toggleBtn: "전환"
    }
  };

  window.changeLanguage = function () {
    const lang = document.getElementById("languageSelect").value;
    const t = translations[lang];
    document.getElementById("portalTitle").textContent = t.portalTitle;
    document.getElementById("chatTitle").textContent = t.chatTitle;
    document.getElementById("sendBtn").textContent = t.sendBtn;
    document.querySelector("#passwordSection h2").textContent = t.passwordHeading;
    document.querySelector("#passwordSection button").textContent = t.toggleBtn;
  };

  let darkMode = true;
  window.toggleTheme = function () {
    darkMode = !darkMode;
    document.body.style.backgroundColor = darkMode ? "#f4f4f4" : "#1a1a1a";
    document.body.style.color = darkMode ? "#000" : "#fff";
    document.getElementById("themeToggle").textContent = darkMode ? "ダークモード" : "ライトモード";
  };
});
