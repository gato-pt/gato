// ===== VARIÁVEIS GLOBAIS =====
let currentUser = null;

// ===== INICIALIZAÇÃO - LOGIN AUTOMÁTICO =====
window.addEventListener("load", () => {
  const savedUser = JSON.parse(localStorage.getItem("currentUser"));
  if (savedUser) {
    currentUser = savedUser.username;
    document.getElementById("loginSection").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    document.getElementById("welcome").innerText = "Bem-vindo @" + currentUser;
    loadFeed();
    loadMessages();
  }
});

// ===== LOGIN / CRIAÇÃO DE CONTA =====
document.getElementById("loginBtn").addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!username || !password) return alert("Preenche todos os campos!");

  let users = JSON.parse(localStorage.getItem("users") || "[]");
  let userObj = users.find(u => u.username === username);

  if (!userObj) {
    // Criar conta
    users.push({ username, password });
    localStorage.setItem("users", JSON.stringify(users));
    alert("Conta criada! Bem-vindo @" + username);
  } else {
    // Login
    if (userObj.password !== password) return alert("Senha incorreta!");
    alert("Login efetuado! Bem-vindo @" + username);
  }

  currentUser = username;
  localStorage.setItem("currentUser", JSON.stringify({ username }));
  document.getElementById("loginSection").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  document.getElementById("welcome").innerText = "Bem-vindo @" + username;

  loadFeed();
  loadMessages();
});

// ===== LOGOUT =====
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  currentUser = null;
  document.getElementById("loginSection").classList.remove("hidden");
  document.getElementById("app").classList.add("hidden");
});

// ===== CRIAR BLOG =====
document.getElementById("createBlogBtn").addEventListener("click", () => {
  const title = document.getElementById("blogTitle").value.trim();
  if (!title) return alert("Escreve o nome do blog!");

  let blogs = JSON.parse(localStorage.getItem("blogs") || "{}");
  blogs[currentUser] = { title: title, posts: [] };
  localStorage.setItem("blogs", JSON.stringify(blogs));
  alert("Blog criado!");
  document.getElementById("blogTitle").value = "";
});

// ===== CRIAR POST =====
document.getElementById("addPostBtn").addEventListener("click", () => {
  const text = document.getElementById("postText").value.trim();
  if (!text) return alert("Escreve algo para postar!");

  let blogs = JSON.parse(localStorage.getItem("blogs") || "{}");
  if (!blogs[currentUser]) return alert("Cria um blog primeiro!");

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

  for (let user in blogs) {
    blogs[user].posts.slice().reverse().forEach(post => {
      const div = document.createElement("div");
      div.className = "post";
      div.innerHTML = `<strong>@${user}</strong> (${new Date(post.date).toLocaleString()}):<br>${post.text}`;
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
