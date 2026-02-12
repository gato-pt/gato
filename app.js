let currentUser = null;
const godAccounts = ["gato","zeh"];
const godPasswords = { "gato":"GatoByZeh@", "zeh":"ZehIsDiva&" };

// ===== INICIALIZAÇÃO =====
window.addEventListener("load",()=>{
  const saved = JSON.parse(localStorage.getItem("currentUser"));
  if(saved) login(saved.username,false);
  initTabs();
});

// ===== LOGIN =====
document.getElementById("loginBtn").addEventListener("click",()=>{
  const u=document.getElementById("username").value.trim();
  const p=document.getElementById("password").value.trim();
  if(!u||!p)return alert("Preenche tudo!");
  login(u,true,p);
});

function login(u,manual=true,p=""){
  let users = JSON.parse(localStorage.getItem("users")||"[]");
  let userObj = users.find(x=>x.username===u);

  if(godAccounts.includes(u)){
    if(manual && p!==godPasswords[u]) return alert("Senha incorreta!");
    currentUser=u;
    if(!userObj) users.push({username:u,password:godPasswords[u],verified:true,god:true});
  } else {
    if(!userObj){
      if(!manual) return;
      users.push({username:u,password:p,verified:false,god:false,following:[],blogs:[]});
      alert("Conta criada! Bem-vindo @"+u);
    } else {
      if(manual && userObj.password!==p) return alert("Senha incorreta!");
      currentUser=u;
      if(manual) alert("Login efetuado! Bem-vindo @"+u);
    }
  }

  localStorage.setItem("users",JSON.stringify(users));
  localStorage.setItem("currentUser",JSON.stringify({username:currentUser}));
  document.getElementById("loginSection").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  document.getElementById("welcome").innerText="Bem-vindo @"+currentUser;

  loadFeed(); loadMyBlogs(); checkGodMode();
}

// ===== LOGOUT =====
document.getElementById("logoutBtn").addEventListener("click",()=>{
  localStorage.removeItem("currentUser");
  currentUser=null;
  document.getElementById("loginSection").classList.remove("hidden");
  document.getElementById("app").classList.add("hidden");
});

// ===== ABAS =====
function initTabs(){
  const btns=document.querySelectorAll(".tab-btn");
  const tabs=document.querySelectorAll(".tab");
  btns.forEach(b=>b.addEventListener("click",()=>{
    btns.forEach(x=>x.classList.remove("active"));
    tabs.forEach(t=>t.classList.remove("active"));
    b.classList.add("active");
    document.getElementById(b.dataset.tab).classList.add("active");
  }));
}

// ===== CRIAR BLOG =====
document.getElementById("createBlogBtn").addEventListener("click",()=>{
  const name=document.getElementById("blogName").value.trim();
  const desc=document.getElementById("blogDesc").value.trim();
  if(!name||!desc)return alert("Preenche todos os campos!");
  let blogs = JSON.parse(localStorage.getItem("blogs")||"{}");
  if(blogs[name]) return alert("Nome de blog já existe!");
  blogs[name]={owner:currentUser,desc:desc,posts:[],followers:[],verified:false,god:false};
  localStorage.setItem("blogs",JSON.stringify(blogs));

  // adicionar ao user
  let users=JSON.parse(localStorage.getItem("users")||"[]");
  let uObj=users.find(x=>x.username===currentUser);
  uObj.blogs.push(name);
  localStorage.setItem("users",JSON.stringify(users));

  document.getElementById("blogName").value="";
  document.getElementById("blogDesc").value="";
  loadFeed();
  loadMyBlogs();
});

// ===== FEED =====
document.getElementById("feedSearchBtn").addEventListener("click",()=>{
  const s=document.getElementById("feedSearch").value.trim().toLowerCase();
  loadFeed(s);
});

function loadFeed(search=""){
  const feed=document.getElementById("feed"); feed.innerHTML="";
  let blogs=JSON.parse(localStorage.getItem("blogs")||"{}");
  let users=JSON.parse(localStorage.getItem("users")||"[]");

  for(let blogName in blogs){
    if(search && !blogName.toLowerCase().includes(search) && !blogs[blogName].owner.toLowerCase().includes(search)) continue;
    const b=blogs[blogName];
    let owner=users.find(u=>u.username===b.owner);
    let mark = owner.verified ? "✔️" : "";
    let godMark = owner.god ? "⚒️" : "";
    const div=document.createElement("div"); div.className="blog-card";
    div.innerHTML=`<div class="blog-title">${blogName} (${b.owner}) ${mark} ${godMark}</div>
      <div>${b.desc}</div>
      <button onclick="viewBlog('${blogName}')">Ver Blog</button>
      <button onclick="followBlog('${blogName}')">${owner.following?.includes(blogName)?"Deixar de seguir":"Seguir"}</button>`;
    feed.appendChild(div);
  }
}

// ===== MEUS BLOGS =====
function loadMyBlogs(){
  const myDiv=document.getElementById("myBlogs"); myDiv.innerHTML="";
  let users=JSON.parse(localStorage.getItem("users")||"[]");
  let uObj=users.find(x=>x.username===currentUser);
  let blogs=JSON.parse(localStorage.getItem("blogs")||"{}");
  uObj.blogs.forEach(blogName=>{
    let b=blogs[blogName];
    let mark = uObj.verified ? "✔️" : "";
    let godMark = uObj.god ? "⚒️" : "";
    const div=document.createElement("div"); div.className="blog-card";
    div.innerHTML=`<div class="blog-title">${blogName} (${currentUser}) ${mark} ${godMark}</div>
      <div>${b.desc}</div>
      <button onclick="viewBlog('${blogName}')">Ver Blog</button>
      <textarea id="postText_${blogName}" placeholder="Novo post..."></textarea>
      <button onclick="addPost('${blogName}')">Postar</button>`;
    myDiv.appendChild(div);
  });
}

// ===== CRIAR POST =====
function addPost(blogName){
  const text=document.getElementById(`postText_${blogName}`).value.trim();
  if(!text) return alert("Escreve algo!");
  let blogs=JSON.parse(localStorage.getItem("blogs")||"{}");
  blogs[blogName].posts.push({text,date:new Date()});
  localStorage.setItem("blogs",JSON.stringify(blogs));
  document.getElementById(`postText_${blogName}`).value="";
  loadFeed(); loadMyBlogs();
}

// ===== SEGUIR BLOG =====
function followBlog(blogName){
  let users=JSON.parse(localStorage.getItem("users")||"[]");
  let u=users.find(x=>x.username===currentUser);
  let blogs=JSON.parse(localStorage.getItem("blogs")||"{}");
  if(!u.following) u.following=[];
  if(u.following.includes(blogName)){
    u.following=u.following.filter(x=>x!==blogName);
  } else u.following.push(blogName);
  localStorage.setItem("users",JSON.stringify(users));
  loadFeed();
}

// ===== VER BLOG INDIVIDUAL =====
function viewBlog(blogName){
  alert("Página de blog: "+blogName+" (em produção, depois podemos criar rota /bloggattag real)");
}

// ===== GOD MODE =====
function checkGodMode(){
  const godBtn=document.querySelector(".god-btn");
  if(godAccounts.includes(currentUser)){
    godBtn.style.display="inline-block"; loadGodUsers();
  } else godBtn.style.display="none";
}

function loadGodUsers(search=""){
  const godDiv=document.getElementById("godUsers"); godDiv.innerHTML="";
  let users=JSON.parse(localStorage.getItem("users")||"[]");
  let blogs=JSON.parse(localStorage.getItem("blogs")||"{}");

  let filtered=search?users.filter(u=>u.username.includes(search)):users;

  filtered.forEach(u=>{
    const div=document.createElement("div"); div.className="god-user";
    div.innerHTML=`<span>@${u.username} ${u.verified?"✔️":""} ${u.god?"⚒️":""}</span>`;
    if(!godAccounts.includes(u.username)){
      const verifyBtn=document.createElement("button");
      verifyBtn.innerText=u.verified?"Desverificar":"Verificar";
      verifyBtn.onclick=()=>{ u.verified=!u.verified; localStorage.setItem("users",JSON.stringify(users)); loadGodUsers(); loadFeed();}
      div.appendChild(verifyBtn);

      // deletar posts
      u.blogs.forEach(blogName=>{
        const delBtn=document.createElement("button");
        delBtn.innerText="Deletar Posts";
        delBtn.onclick=()=>{
          blogs[blogName].posts=[];
          localStorage.setItem("blogs",JSON.stringify(blogs));
          loadGodUsers(); loadFeed();
        }
        div.appendChild(delBtn);
      });
    }
    godDiv.appendChild(div);
  });
}

// PESQUISA GOD MODE
document.getElementById("searchGodBtn").addEventListener("click",()=>{
  const s=document.getElementById("searchGod").value.trim();
  loadGodUsers(s);
});
