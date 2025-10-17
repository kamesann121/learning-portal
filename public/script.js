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
    if (!unlocked && input === "114514ジェラシー") {
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

  // プロフィール画像保存＆復元
  const profileInput = document.getElementById("profileImageInput");
  let profileImageData = localStorage.getItem("profileImage");

  if (profileInput) {
    profileInput.addEventListener("change", () => {
      const file = profileInput.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = function (e) {
          profileImageData = e.target.result;
          localStorage.setItem("profileImage", profileImageData);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // 🌟 アイコン選択機能
  const iconList = document.getElementById("iconList");
  const icons = ["icon1.png", "icon2.png", "icon3.png", "icon4.png"];

  icons.forEach(src => {
    const img = document.createElement("img");
    img.src = `/images/${src}`;
    img.style.width = "40px";
    img.style.height = "40px";
    img.style.borderRadius = "50%";
    img.style.cursor = "pointer";
    img.style.border = "2px solid transparent";
    img.style.margin = "5px";
    img.onclick = () => {
      profileImageData = img.src;
      localStorage.setItem("profileImage", profileImageData);
      document.querySelectorAll("#iconList img").forEach(i => i.classList.remove("selected"));
      img.classList.add("selected");
    };
    iconList.appendChild(img);
  });

  // Socket.IO チャット
  const socket = io();

  window.sendMessage = function () {
    const msg = document.getElementById("chatInput").value.trim();
    const username = document.getElementById("usernameInput").value.trim() || "匿名";
    if (msg) {
      socket.emit("chat message", {
        user: username,
        text: msg,
        icon: profileImageData || null
      });
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
          image: imageData,
          icon: profileImageData || null
        });
      };
      reader.readAsDataURL(file);
      fileInput.value = "";
    }
  };

  socket.on("chat message", data => {
    const m = document.createElement("div");
    m.innerHTML = `
      <div style="display:flex; align-items:flex-start; margin-bottom:15px;">
        <div style="text-align:center; margin-right:10px;">
          ${data.icon ? `<img src="${data.icon}" style="width:40px; height:40px; border-radius:50%; display:block;">` : ""}
          <div style="font-size:12px; color:#ccc; margin-top:2px;">${data.user}</div>
        </div>
        <div style="background:#444; color:#fff; padding:10px 15px; border-radius:10px; max-width:70%;">
          ${data.text}
        </div>
      </div>
    `;
    document.getElementById("messages").appendChild(m);
    document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
  });

  socket.on("chat image", data => {
    const m = document.createElement("div");
    m.innerHTML = `
      <div style="display:flex; align-items:flex-start; margin-bottom:15px;">
        <div style="text-align:center; margin-right:10px;">
          ${data.icon ? `<img src="${data.icon}" style="width:40px; height:40px; border-radius:50%; display:block;">` : ""}
          <div style="font-size:12px; color:#ccc; margin-top:2px;">${data.user}</div>
        </div>
        <div style="background:#444; color:#fff; padding:10px 15px; border-radius:10px; max-width:70%;">
          <img src="${data.image}" style="max-width:200px; border-radius:8px;">
        </div>
      </div>
    `;
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
      passwordHeading: "🔐 비밀번호가 필요합니다",
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
