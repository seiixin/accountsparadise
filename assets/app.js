const App = {
  games: ["touch4games", "crossfire", "valorant", "genshin impact", "codm"],
  offers: [
    { id: "AP-001", title: "Genshin Impact AR55 Account", type: "Account", game: "genshin impact", price: "₱3,500", seller: "Nebula Merchant", trust: "High", featured: true, image: "./assets/items/genshin_ar55.svg", tags: ["Verified Merchant", "Midman-ready"] },
    { id: "AP-002", title: "Valorant Premium Skin Bundle", type: "Item", game: "valorant", price: "₱1,250", seller: "Arcade Vault", trust: "High", featured: true, image: "./assets/items/valorant_skins.svg", tags: ["Secure trade", "Fast"] },
    { id: "AP-003", title: "CODM CP 5,000", type: "Item", game: "codm", price: "₱2,150", seller: "Kuro Store", trust: "Medium", featured: false, image: "./assets/items/codm_cp.svg", tags: ["Receipt", "Instant"] },
    { id: "AP-004", title: "Crossfire Rare Item Pack", type: "Item", game: "crossfire", price: "₱980", seller: "Arcade Vault", trust: "High", featured: false, image: "./assets/items/crossfire_items.svg", tags: ["Instant", "Bundle"] },
    { id: "AP-005", title: "Touch4Games Gold Package", type: "Item", game: "touch4games", price: "₱499", seller: "Nebula Merchant", trust: "High", featured: true, image: "./assets/items/touch4games_gold.svg", tags: ["Fast delivery"] },
    { id: "AP-006", title: "Steam Account 60+ Games", type: "Account", game: "steam", price: "₱4,999", seller: "Kuro Store", trust: "Medium", featured: false, image: "./assets/items/steam_account.svg", tags: ["Midman-ready"] },
  ],
  midmanQueue: [
    { id: "MID-2201", offer: "AP-001", buyer: "Buyer #102", idDoc: "./assets/kyc/sample_id.svg", receipt: "./assets/kyc/sample_receipt.svg", idStatus: "Waiting review", payStatus: "Pending", created: "Dec 31, 2025" },
    { id: "MID-2202", offer: "AP-002", buyer: "Buyer #118", idDoc: "./assets/kyc/sample_id.svg", receipt: "./assets/kyc/sample_receipt.svg", idStatus: "Verified", payStatus: "Paid", created: "Dec 31, 2025" },
  ],
  disputes: [
    { id: "DSP-011", buyer: "Buyer #102", merchant: "Kuro Store", status: "Open", reason: "Delayed delivery", created: "Dec 30, 2025" },
    { id: "DSP-012", buyer: "Buyer #118", merchant: "Nebula Merchant", status: "Review", reason: "Account details mismatch", created: "Dec 29, 2025" },
  ],
  users: [
    { id: "USR-001", name: "Nebula Merchant", role: "Merchant", status: "Active" },
    { id: "USR-002", name: "Kuro Store", role: "Merchant", status: "Active" },
    { id: "USR-003", name: "Arcade Vault", role: "Merchant", status: "Active" },
    { id: "USR-101", name: "Buyer #102", role: "Buyer", status: "Active" },
    { id: "USR-102", name: "Buyer #118", role: "Buyer", status: "Active" },
  ]
};

function $(sel, root=document){ return root.querySelector(sel); }
function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

function escapeHtml(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

/* Navbar active + mobile drawer */
function setActiveLinks(){
  const active = document.body.getAttribute("data-active") || "";
  $all("[data-nav]").forEach(a => a.dataset.active = (a.getAttribute("data-nav") === active) ? "true" : "false");
  $all("[data-dnav]").forEach(a => a.dataset.active = (a.getAttribute("data-dnav") === active) ? "true" : "false");
}

function initDrawer(){
  const openBtn = $("#menuBtn");
  const backdrop = $("#drawerBackdrop");
  const closeBtn = $("#drawerClose");
  if (!openBtn || !backdrop) return;

  const open = () => { backdrop.dataset.open = "true"; document.body.style.overflow = "hidden"; };
  const close = () => { backdrop.dataset.open = "false"; document.body.style.overflow = ""; };

  openBtn.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && backdrop.dataset.open === "true") close(); });
  $all("a", backdrop).forEach(a => a.addEventListener("click", close));
}

/* Toasts */
function toast(message, subtitle=""){
  let host = $("#toastHost");
  if (!host){
    host = document.createElement("div");
    host.id = "toastHost";
    document.body.appendChild(host);
  }
  const el = document.createElement("div");
  el.className = "glass toast";
  el.innerHTML = `
    <div class="row" style="justify-content:space-between; align-items:flex-start;">
      <div class="stack" style="gap:6px;">
        <div style="font-weight:1000;">${escapeHtml(message)}</div>
        ${subtitle ? `<div class="label" style="font-weight:800; opacity:.9;">${escapeHtml(subtitle)}</div>` : ``}
      </div>
      <button class="btn sm ghost" aria-label="Close">✕</button>
    </div>
  `;
  host.appendChild(el);
  const close = () => el.remove();
  el.querySelector("button")?.addEventListener("click", close);
  setTimeout(close, 2800);
}
function initToastButtons(root=document){
  $all("[data-toast]", root).forEach(btn => btn.addEventListener("click", () => toast(btn.getAttribute("data-toast") || "Done")));
}

/* Buy Now modal (requirements + previews) */
function initBuyNowModal(){
  const backdrop = $("#modalBackdrop");
  const closeBtn = $("#modalClose");
  if (!backdrop) return;

  const close = () => {
    backdrop.dataset.open = "false";
    document.body.style.overflow = "";
  };

  const open = (offerId) => {
    const o = App.offers.find(x => x.id === offerId);
    if (!o) return;

    $("#modalTitle").textContent = o.title;

    $("#modalContent").innerHTML = `
      <div class="grid grid-2" style="align-items:start;">
        <div class="card glass-soft pad">
          <div class="kicker">Offer</div>
          <div style="margin-top:10px;">
            <div class="hero-media" style="min-height:220px;">
              <img src="${escapeHtml(o.image)}" alt="Offer image"/>
            </div>
          </div>
          <div style="font-weight:1000; font-size:18px; margin-top:12px;">${escapeHtml(o.price)}</div>
          <div class="p" style="margin-top:8px;">Seller: <b>${escapeHtml(o.seller)}</b></div>
          <div class="p">Trust: <b>${escapeHtml(o.trust)}</b></div>
          <div class="p">Game: <b>${escapeHtml(o.game)}</b></div>
        </div>

        <div class="card glass-soft pad">
          <div class="kicker">Buy Now</div>
          <div style="font-weight:1000; font-size:18px; margin-top:8px;">Requirements</div>

          <div class="stack" style="gap:12px; margin-top:12px;">
            <div class="card glass-soft pad" style="border-radius:16px;">
              <div style="font-weight:1000;">Valid ID</div>
              <div class="label" style="margin-top:6px;">Upload a clear photo.</div>
              <input id="idFile" class="input" type="file" accept="image/*" style="margin-top:10px;"/>
              <div id="idPreviewWrap" class="hero-media" style="min-height:160px; margin-top:10px; display:none;">
                <img id="idPreview" alt="Valid ID preview"/>
              </div>
            </div>

            <div class="card glass-soft pad" style="border-radius:16px;">
              <div style="font-weight:1000;">Payment</div>
              <div class="label" style="margin-top:6px;">Select method and attach receipt.</div>
              <select class="input" style="margin-top:10px;">
                <option>GCash</option>
                <option>Bank Transfer</option>
                <option>PayMaya</option>
              </select>
              <input class="input" placeholder="Reference / Transaction ID" style="margin-top:10px;"/>
              <input id="receiptFile" class="input" type="file" accept="image/*" style="margin-top:10px;"/>
              <div id="receiptPreviewWrap" class="hero-media" style="min-height:160px; margin-top:10px; display:none;">
                <img id="receiptPreview" alt="Receipt preview"/>
              </div>
            </div>

            <div class="row modal-actions" style="justify-content:flex-end; flex-wrap:wrap;">
              <button class="btn ghost" data-close-modal type="button">Cancel</button>
              <button class="btn primary" data-confirm-purchase type="button">Confirm Purchase</button>
            </div>

            <div class="label">Your purchase goes to Admin/Midman verification.</div>
          </div>
        </div>
      </div>
    `;

    const idFile = $("#idFile");
    const idWrap = $("#idPreviewWrap");
    const idImg = $("#idPreview");
    idFile?.addEventListener("change", () => {
      const f = idFile.files?.[0];
      if (!f) return;
      idImg.src = URL.createObjectURL(f);
      idWrap.style.display = "block";
    });

    const rFile = $("#receiptFile");
    const rWrap = $("#receiptPreviewWrap");
    const rImg = $("#receiptPreview");
    rFile?.addEventListener("change", () => {
      const f = rFile.files?.[0];
      if (!f) return;
      rImg.src = URL.createObjectURL(f);
      rWrap.style.display = "block";
    });

    $("#modalContent")?.querySelector("[data-close-modal]")?.addEventListener("click", close);
    $("#modalContent")?.querySelector("[data-confirm-purchase]")?.addEventListener("click", () => {
      toast("Purchase created", "Awaiting verification");
      close();
    });

    backdrop.dataset.open = "true";
    document.body.style.overflow = "hidden";
  };

  window.AP_openBuyNow = open;

  closeBtn?.addEventListener("click", close);
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && backdrop.dataset.open === "true") close(); });
}

/* Render helpers */
function offerCard(o){
  const tags = (o.tags || []).map(t => `<span class="pill">${escapeHtml(t)}</span>`).join("");
  return `
    <div class="card glass offer-card">
      <div class="offer-img"><img src="${escapeHtml(o.image)}" alt="Item cover"/></div>
      <div class="offer-body">
        <div class="kicker">${escapeHtml(o.type)} • ${escapeHtml(o.game)} • ${escapeHtml(o.id)}</div>
        <h3 class="offer-title">${escapeHtml(o.title)}</h3>
        <p class="offer-sub">Seller: <b>${escapeHtml(o.seller)}</b> • Trust: <b>${escapeHtml(o.trust)}</b></p>
        <div class="offer-meta">${tags}</div>
        <div class="offer-foot">
          <div class="price">${escapeHtml(o.price)}</div>
          <button class="btn primary sm" data-buy="${escapeHtml(o.id)}">Buy Now</button>
        </div>
      </div>
    </div>
  `;
}

function bindBuyButtons(root=document){
  $all("[data-buy]", root).forEach(btn => {
    btn.addEventListener("click", () => window.AP_openBuyNow?.(btn.getAttribute("data-buy")));
  });
}

/* Store page: hero slider + list */
function initStorePage(){
  const hero = $("#hero");
  if (!hero) return;

  const featured = App.offers.filter(o => o.featured);
  const slideHost = $("#heroSlides");
  const dotsHost = $("#heroDots");

  let index = 0;
  let timer = null;

  function renderSlides(){
    slideHost.innerHTML = featured.map((o, i) => `
      <div class="hero-slide" data-idx="${i}" data-show="${i===0 ? "true":"false"}">
        <div class="hero-grid">
          <div class="stack" style="gap:10px;">
            <div class="kicker">Featured</div>
            <div style="font-weight:1000; font-size:34px; letter-spacing:-.03em; line-height:1.08;">
              ${escapeHtml(o.title)}
            </div>
            <div class="p">Seller: <b>${escapeHtml(o.seller)}</b> • Trust: <b>${escapeHtml(o.trust)}</b> • Game: <b>${escapeHtml(o.game)}</b></div>
            <div class="row" style="flex-wrap:wrap; margin-top:6px;">
              ${(o.tags||[]).map(t => `<span class="pill">${escapeHtml(t)}</span>`).join("")}
            </div>
            <div class="hero-actions">
              <button class="btn primary" data-buy="${escapeHtml(o.id)}">Buy Now</button>
              <a class="btn ghost" href="./games.html">Browse Games</a>
            </div>
          </div>

          <div class="hero-media">
            <img src="${escapeHtml(o.image)}" alt="Featured cover"/>
          </div>
        </div>
      </div>
    `).join("");

    dotsHost.innerHTML = featured.map((_, i) => `<button class="dot" data-dot="${i}" data-on="${i===0 ? "true":"false"}" aria-label="Go to slide ${i+1}"></button>`).join("");
  }

  function setSlide(i){
    index = (i + featured.length) % featured.length;
    $all(".hero-slide", hero).forEach(s => s.dataset.show = (Number(s.dataset.idx) === index) ? "true" : "false");
    $all(".dot", hero).forEach(d => d.dataset.on = (Number(d.dataset.dot) === index) ? "true" : "false");
    bindBuyButtons(hero);
  }

  function next(){ setSlide(index + 1); }
  function prev(){ setSlide(index - 1); }

  function start(){ stop(); timer = setInterval(next, 5200); }
  function stop(){ if (timer) clearInterval(timer); timer = null; }

  renderSlides();
  bindBuyButtons(hero);

  $("#heroNext")?.addEventListener("click", () => { next(); start(); });
  $("#heroPrev")?.addEventListener("click", () => { prev(); start(); });
  $all(".dot", hero).forEach(d => d.addEventListener("click", () => { setSlide(Number(d.dataset.dot)); start(); }));

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  start();
}

/* Offer list (filter by search/type/game) */
function initOfferList(){
  const grid = $("#offersGrid");
  if (!grid) return;

  const q = $("#offerSearch");
  const t = $("#offerType");
  const g = $("#offerGame");

  if (g){
    const games = ["", ...App.games, "steam"];
    g.innerHTML = games.map(x => `<option value="${escapeHtml(x)}">${escapeHtml(x || "all games")}</option>`).join("");
  }

  function apply(){
    const query = (q?.value || "").trim().toLowerCase();
    const type = (t?.value || "").trim();
    const game = (g?.value || "").trim().toLowerCase();

    const rows = App.offers.filter(o => {
      const matchQ = !query || (o.title.toLowerCase().includes(query) || o.seller.toLowerCase().includes(query) || o.game.toLowerCase().includes(query) || o.id.toLowerCase().includes(query));
      const matchT = !type || o.type === type;
      const matchG = !game || o.game.toLowerCase() === game;
      return matchQ && matchT && matchG;
    });

    grid.innerHTML = rows.map(offerCard).join("");
    bindBuyButtons(grid);
  }

  [q,t,g].filter(Boolean).forEach(el => el.addEventListener("input", apply));
  apply();

  document.addEventListener("ap:setGameFilter", (e) => {
    if (!g) return;
    const game = String(e.detail?.game || "").toLowerCase();
    g.value = game;
    apply();
  });
}

/* Games page tabs (separate page) */
function initGamesPage(){
  const tabs = $("#gameTabs");
  const grid = $("#gamesGrid");
  if (!tabs || !grid) return;

  const games = ["all", ...App.games, "steam"];

  tabs.innerHTML = games.map((name, idx) => `
    <button class="btn ${idx===0 ? "primary":"ghost"} sm" data-game="${escapeHtml(name)}">${escapeHtml(name)}</button>
  `).join("");

  function setGame(name){
    $all("[data-game]", tabs).forEach(b => {
      const on = (b.getAttribute("data-game") === name);
      b.classList.remove("primary","ghost");
      b.classList.add(on ? "primary":"ghost");
    });
    const game = name === "all" ? "" : name;

    const rows = App.offers.filter(o => !game || o.game.toLowerCase() === game);
    grid.innerHTML = rows.map(offerCard).join("");
    bindBuyButtons(grid);

    document.dispatchEvent(new CustomEvent("ap:setGameFilter", { detail: { game } }));
  }

  $all("[data-game]", tabs).forEach(b => b.addEventListener("click", () => setGame(b.getAttribute("data-game"))));
  setGame("all");
}

/* Login routing */
function initLogin(){
  const btn = $("#loginBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const role = ($("#role")?.value || "Buyer").toLowerCase();
    if (role.includes("merchant")) window.location.href = "./merchant.html";
    else if (role.includes("admin")) window.location.href = "./admin.html";
    else window.location.href = "./buyer.html";
  });
}

/* Merchant: Add listing modal */
function initMerchantModal(){
  const backdrop = $("#genericModalBackdrop");
  if (!backdrop) return;

  const openers = $all("[data-open-listing]");
  const closeBtn = $("#genericModalClose");

  const open = () => { backdrop.dataset.open = "true"; document.body.style.overflow = "hidden"; };
  const close = () => { backdrop.dataset.open = "false"; document.body.style.overflow = ""; };

  openers.forEach(o => o.addEventListener("click", open));
  closeBtn?.addEventListener("click", close);
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && backdrop.dataset.open === "true") close(); });

  const dl = $("#gameList");
  if (dl){
    const list = [...App.games, "steam"].map(g => `<option value="${escapeHtml(g)}"></option>`).join("");
    dl.innerHTML = list;
  }

  const otherToggle = $("#gameOtherToggle");
  const otherWrap = $("#gameOtherWrap");
  const gameInput = $("#gameSearch");
  if (otherToggle && otherWrap && gameInput){
    otherToggle.addEventListener("change", () => {
      const on = otherToggle.checked;
      otherWrap.style.display = on ? "block" : "none";
      gameInput.disabled = on;
      if (on) gameInput.value = "";
    });
  }

  $("#saveListingBtn")?.addEventListener("click", () => {
    toast("Listing saved", "Ready for review");
    close();
  });
}

/* Admin: Midman document preview */
function initAdminTables(){
  const mid = $("#midmanBody");
  if (mid){
    mid.innerHTML = App.midmanQueue.map(m => `
      <tr>
        <td><b>${escapeHtml(m.id)}</b></td>
        <td>${escapeHtml(m.offer)}</td>
        <td>${escapeHtml(m.buyer)}</td>
        <td>
          <button class="thumb" data-doc="${escapeHtml(m.idDoc)}" data-title="Valid ID">
            <img src="${escapeHtml(m.idDoc)}" alt="Valid ID thumbnail"/>
          </button>
        </td>
        <td>
          <button class="thumb" data-doc="${escapeHtml(m.receipt)}" data-title="Payment Receipt">
            <img src="${escapeHtml(m.receipt)}" alt="Receipt thumbnail"/>
          </button>
        </td>
        <td><span class="pill">${escapeHtml(m.idStatus)}</span></td>
        <td><span class="pill">${escapeHtml(m.payStatus)}</span></td>
        <td>${escapeHtml(m.created)}</td>
        <td class="td-actions">
          <button class="btn sm ghost" data-toast="ID verified">Verify ID</button>
          <button class="btn sm ghost" data-toast="Payment confirmed">Confirm payment</button>
          <button class="btn sm primary" data-toast="Item released">Release</button>
        </td>
      </tr>
    `).join("");
    initToastButtons(mid);
  }

  const users = $("#usersBody");
  if (users){
    users.innerHTML = App.users.map(u => `
      <tr>
        <td><b>${escapeHtml(u.id)}</b></td>
        <td>${escapeHtml(u.name)}</td>
        <td><span class="pill">${escapeHtml(u.role)}</span></td>
        <td>${escapeHtml(u.status)}</td>
        <td class="td-actions"><button class="btn sm ghost" data-toast="User opened">Open</button></td>
      </tr>
    `).join("");
    initToastButtons(users);
  }

  const dsp = $("#disputesBody");
  if (dsp){
    dsp.innerHTML = App.disputes.map(d => `
      <tr>
        <td><b>${escapeHtml(d.id)}</b></td>
        <td>${escapeHtml(d.buyer)}</td>
        <td>${escapeHtml(d.merchant)}</td>
        <td><span class="pill">${escapeHtml(d.status)}</span></td>
        <td>${escapeHtml(d.reason)}</td>
        <td>${escapeHtml(d.created)}</td>
        <td class="td-actions"><button class="btn sm ghost" data-toast="Dispute reviewed">Review</button></td>
      </tr>
    `).join("");
    initToastButtons(dsp);
  }

  const docBackdrop = $("#docBackdrop");
  const docImg = $("#docImg");
  const docTitle = $("#docTitle");
  const docClose = $("#docClose");

  function openDoc(src, title){
    if (!docBackdrop) return;
    docImg.src = src;
    docTitle.textContent = title || "Document";
    docBackdrop.dataset.open = "true";
    document.body.style.overflow = "hidden";
  }
  function closeDoc(){
    if (!docBackdrop) return;
    docBackdrop.dataset.open = "false";
    document.body.style.overflow = "";
  }
  $all("[data-doc]").forEach(btn => btn.addEventListener("click", () => openDoc(btn.getAttribute("data-doc"), btn.getAttribute("data-title"))));
  docClose?.addEventListener("click", closeDoc);
  docBackdrop?.addEventListener("click", (e) => { if (e.target === docBackdrop) closeDoc(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && docBackdrop?.dataset.open === "true") closeDoc(); });
}

/* Buyer quick game buttons */
function initBuyerGameButtons(){
  const host = $("#buyerGameBtns");
  if (!host) return;
  host.innerHTML = ["all", ...App.games].map((g, i) => `
    <button class="btn ${i===0 ? "primary":"ghost"} sm" data-bgame="${escapeHtml(g)}">${escapeHtml(g)}</button>
  `).join("");

  function set(g){
    $all("[data-bgame]", host).forEach(b => {
      const on = b.getAttribute("data-bgame") === g;
      b.classList.remove("primary","ghost");
      b.classList.add(on ? "primary":"ghost");
    });
    document.dispatchEvent(new CustomEvent("ap:setGameFilter", { detail: { game: g==="all" ? "" : g } }));
  }
  $all("[data-bgame]").forEach(b => b.addEventListener("click", () => set(b.getAttribute("data-bgame"))));
  set("all");
}

/* Contact */
function initContact(){
  $("#contactSendBtn")?.addEventListener("click", () => toast("Message sent", "Support will respond soon"));
  $("#templateBtn")?.addEventListener("click", () => {
    const msg = $("#contactMessage");
    if (msg && !msg.value){
      msg.value = "Order ID:\nIssue:\nWhat you need:\nAttachments:\n";
    }
    toast("Template inserted");
  });
  $("#fabChat")?.addEventListener("click", () => {
    const chat = $("#contactChat");
    chat?.scrollIntoView({ behavior: "smooth", block: "start" });
    toast("Chat opened", "You can send a message");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setActiveLinks();
  initDrawer();
  initToastButtons();
  initBuyNowModal();

  initStorePage();
  initOfferList();
  initGamesPage();
  initLogin();
  initMerchantModal();
  initAdminTables();
  initBuyerGameButtons();
  initContact();
});
