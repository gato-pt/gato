let currentUser = null;

// Contas God Mode
const godAccounts = ["gato", "zeh"];
const godModePasswords = { "gato": "GatoByZeh@", "zeh": "ZehIsDiva&" };

// ===== INICIALIZAÇÃO =====
window.addEventListener("load", () => {
  const savedUser = JSON.parse(localStorage.getItem("currentUser"));
  if (savedUser) {
    currentUser = savedUser.username;
    document.getElementById("loginSection").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    document.getElementById("welcome").innerText = "Bem-vindo @" + currentUser;
    initializeUsers();
    loadFeed();
    loadMessages();
    checkGodMode();
  }
});

// ===== INICIALIZAÇÃO DE USUÁRIOS GOD MODE =====
function initializeUsers() {
  let users = JSON.parse(localStorage.getItem("users") || "[]");
  godAccounts.forEach(user => {
    if (!users.find(u => u.username === user)) {
      users.push({ username: user, password: godModePasswords[user], verified: true });
    }
  });
  localStorage.setItem("users", JSON.stringify(users));
}

// ===== LOGIN / CRIAÇÃO DE CONTA =====
document.getElementById("loginBtn").addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!username || !password) return alert("Preenche todos os campos!");

  let users = JSON.parse(localStorage.getItem("users") || "[]");
  let userObj = users.find(u => u.username === username);

  if (godAccounts.includes(username)) {
    if (password !== godModePasswords[username]) return alert("Senha incorreta!");
    currentUser = username;
    if (!userObj) {
      users.push({ username, password: godModePasswords[username], verified: true });
    }
  } else {
    if (!userObj) {
      users.push({ username, password, verified: false });
      alert("Conta criada! Bem-vindo @" + username);
    } else {
      if (userObj.password !== password) return alert("Senha incorreta!");
      alert("Login efetuado! Bem-vindo @" + username);
    }
    currentUser = username;
  }

  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify({ username }));
  document.getElementById("loginSection").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  document.getElementById("welcome").innerText = "Bem-vindo @" + currentUser;

  loadFeed();
  loadMessages();
  checkGodMode();
});

// ===== LOGOUT =====
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  currentUser = null;
  document.getElementById("loginSection").classList.remove("hidden");
  document.getElementById("app").classList.add("hidden");
});

// ===== CRIAR POST =====
document.getElementById("addPostBtn").addEventListener("click", () => {
  const text = document.getElementById("postText").value.trim();
  if (!text) return alert("Escreve algo para postar!");

  let blogs = JSON.parse(localStorage.getItem("blogs") || "{}");
  if (!blogs[currentUser]) blogs[currentUser] = { title: currentUser + "'s Blog", posts: [] };

  blogs[currentUser].posts.push({ text: text, date: new Date() });
  localStorage.setItem("blogs", JSON.stringify(blogs));
  document.getElementById("postText").value = "";
  loadFeed();
});

// ===== FEED NACIONAL =====
function loadFeed() {
  const feed = document.getElementById("feed");
  feed.innerHTML = "";

  let blogs = JSON.parse(localStorage.getItem("blogs") || "{}");
  let users = JSON.parse(localStorage.getItem("users") || "[]");

  for (let user in blogs) {
    let userObj = users.find(u => u.username === user);
    blogs[user].posts.slice().reverse().forEach((post, index) => {
      const div = document.createElement("div");
      div.className = "post";
      let verifiedMark = userObj && userObj.verified ? " ✔️" : "";
      div.innerHTML = `<strong>@${user}${verifiedMark}</strong> (${new Date(post.date).toLocaleString()}):<br>${post.text}`;

      if (godAccounts.includes(currentUser)) {
        const delBtn = document.createElement("button");
        delBtn.innerText = "Deletar";
        delBtn.style.marginTop = "5px";
        delBtn.onclick = () => {
          blogs[user].posts.splice(blogs[user].posts.length - 1 - index, 1);
          localStorage.setItem("blogs", JSON.stringify(blogs));
          loadFeed();
        };
        div.appendChild(delBtn);
      }

      feed.appendChild(div);
    });
  }
}

// ===== MENSAGENS PRIVADAS =====
document.getElementById("sendMsgBtn").addEventListener("click", () => {
  const toUser = document.getElementById("msgTo").value.trim();
  const text = document.getElementById("msgText").value.trim();
  if (!toUser || !text) return alert("Preenche todos os campos!");

  let users = JSON.parse(localStorage.getItem("users") || "[]");
  if (!users.find(u => u.username === toUser)) return alert("Esse GATTAG não existe!");

  let messages = JSON.parse(localStorage.getItem("messages") || "{}");
  if (!messages[toUser]) messages[toUser] = [];
  messages[toUser].push({ from: currentUser, text: text, date: new Date() });
  localStorage.setItem("messages", JSON.stringify(messages));

  document.getElementById("msgText").value = "";
  loadMessages();
});

function loadMessages() {
  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = "";

  let messages = JSON.parse(localStorage.getItem("messages") || "{}");
  if (!messages[currentUser]) return;

  messages[currentUser].slice().reverse().forEach(msg => {
    const div = document.createElement("div");
    div.className = "message";
    div.innerHTML = `<strong>@${msg.from}</strong> (${new Date(msg.date).toLocaleString()}): ${msg.text}`;
    messagesDiv.appendChild(div);
  });
}

// ===== GOD MODE =====
function checkGodMode() {
  const godSection = document.getElementById("godModeSection");
  if (godAccounts.includes(currentUser)) {
    godSection.style.display = "block";
    loadGodUsers();
  } else {
    godSection.style.display = "none";
  }
}

function loadGodUsers() {
  const godDiv = document.getElementById("godUsers");
  godDiv.innerHTML = "";

  let users = JSON.parse(localStorage.getItem("users") || "[]");
  let blogs = JSON.parse(localStorage.getItem("blogs") || "{}");

  users.forEach(u => {
    const div = document.createElement("div");
    div.className = "god-user";
    div.innerHTML = `<span>@${u.username} ${u.verified ? "✔️" : ""}</span>`;

    if (!godAccounts.includes(u.username)) {
      const verifyBtn = document.createElement("button");
      verifyBtn.innerText = u.verified ? "Desverificar" : "Verificar";
      verifyBtn.onclick = () => {
        u.verified = !u.verified;
        localStorage.setItem("users", JSON.stringify(users));
        loadGodUsers();
        loadFeed();
      };
      div.appendChild(verifyBtn);

      if (blogs[u.username] && blogs[u.username].posts.length > 0) {
        const delPostsBtn = document.createElement("button");
        delPostsBtn.innerText = "Deletar Posts";
        delPostsBtn.onclick = () => {
          blogs[u.username].posts = [];
          localStorage.setItem("blogs", JSON.stringify(blogs));
          loadGodUsers();
          loadFeed();
        };
        div.appendChild(delPostsBtn);
      }
    }

    godDiv.appendChild(div);
  });
}
