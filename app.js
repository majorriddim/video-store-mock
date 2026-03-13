const STORAGE_KEY = "videoStoreMockState";

const LONG_DETAIL_TEXT = "テキストテキスト。テキストテキストテキストテキスト、テキストテキストテキストテキスト。テキストテキスト、テキストテキストテキストテキストテキストテキスト。テキストテキストテキストテキスト、テキストテキスト。テキストテキストテキストテキスト、テキストテキストテキストテキストテキストテキスト。";
const GENRES = ["ジャンル名A", "ジャンル名B", "ジャンル名C", "ジャンル名D", "ジャンル名E"];
const CASTS = ["出演者A", "出演者B", "出演者C", "出演者D", "出演者E", "出演者F", "出演者G", "出演者H"];

const DEMO_VIDEOS = Array.from({ length: 50 }, (_, i) => {
  const index = i + 1;
  const price = 980 + (i % 6) * 200;
  return {
    id: `v${index}`,
    title: `テキストテキスト ${String(index).padStart(2, "0")}`,
    description: "テキストテキスト",
    detailDescription: LONG_DETAIL_TEXT,
    duration: `${45 + (i % 8) * 5}分`,
    price: `¥${price.toLocaleString("ja-JP")}`,
    genre: GENRES[i % GENRES.length],
    cast: CASTS[i % CASTS.length],
    tags: index <= 10 ? ["新着", "おすすめ"] : index % 3 === 0 ? ["おすすめ"] : ["新着"]
  };
});

function parsePriceToNumber(priceText) {
  return Number(String(priceText).replace(/[^\d]/g, "")) || 0;
}

function getState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { loggedIn: false, purchases: [], email: "" };
    const parsed = JSON.parse(raw);
    return {
      loggedIn: Boolean(parsed.loggedIn),
      purchases: Array.isArray(parsed.purchases) ? parsed.purchases : [],
      email: typeof parsed.email === "string" ? parsed.email : ""
    };
  } catch {
    return { loggedIn: false, purchases: [], email: "" };
  }
}

function setState(next) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function isOwned(videoId) {
  const state = getState();
  return state.purchases.includes(videoId);
}

function ensureLogin(target) {
  const state = getState();
  if (state.loggedIn) {
    window.location.href = target;
  } else {
    window.location.href = `login.html?redirect=${encodeURIComponent(target)}`;
  }
}

function setStatusText() {
  const el = document.querySelector("[data-auth-status]");
  if (!el) return;
  const state = getState();

  if (!state.loggedIn) {
    el.textContent = "未ログイン";
    el.className = "status-chip status-guest";
    return;
  }

  if (state.purchases.length === 0) {
    el.textContent = "ログイン済み（未購入）";
    el.className = "status-chip status-login";
    return;
  }

  el.textContent = "購入済み";
  el.className = "status-chip status-owned";
}

function renderHeaderNav() {
  const nav = document.querySelector(".header-nav");
  if (!nav) return;
  const state = getState();

  if (!state.loggedIn) {
    nav.innerHTML = `
      <a class="nav-link" data-page="product.html" href="product.html">商品</a>
      <a class="nav-link" data-page="videos.html" href="videos.html">動画を探す</a>
      <a class="nav-link" data-page="casts.html" href="casts.html">出演者一覧</a>
      <a class="nav-link" data-page="genres.html" href="genres.html">ジャンル一覧</a>
      <a class="nav-link" data-page="login.html" href="login.html">ログイン</a>
      <a class="nav-link" data-page="register.html" href="register.html">会員登録</a>
    `;
    return;
  }

  nav.innerHTML = `
    <a class="nav-link" data-page="product.html" href="product.html">商品</a>
    <a class="nav-link" data-page="videos.html" href="videos.html">動画を探す</a>
    <a class="nav-link" data-page="casts.html" href="casts.html">出演者一覧</a>
    <a class="nav-link" data-page="genres.html" href="genres.html">ジャンル一覧</a>
    <a class="nav-link" data-page="mypage.html" href="mypage.html">購入済み動画一覧</a>
    <a class="nav-link" href="#" data-action="header-logout">ログアウト</a>
  `;
}

function bindCommonActions() {
  const loginToggle = document.querySelector("[data-action='mock-login']");
  if (loginToggle) {
    loginToggle.addEventListener("click", () => {
      const state = getState();
      setState({ ...state, loggedIn: true });
      window.location.reload();
    });
  }

  const logoutBtn = document.querySelector("[data-action='mock-logout']");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      const state = getState();
      setState({ ...state, loggedIn: false });
      window.location.reload();
    });
  }

  const clearPurchase = document.querySelector("[data-action='mock-clear']");
  if (clearPurchase) {
    clearPurchase.addEventListener("click", () => {
      const state = getState();
      setState({ ...state, purchases: [] });
      window.location.reload();
    });
  }

  const navLogout = document.querySelector("[data-action='header-logout']");
  if (navLogout) {
    navLogout.addEventListener("click", (e) => {
      e.preventDefault();
      const state = getState();
      setState({ ...state, loggedIn: false });
      window.location.href = "product.html";
    });
  }

  const pageLogout = document.querySelector("[data-action='page-logout']");
  if (pageLogout) {
    pageLogout.addEventListener("click", () => {
      const state = getState();
      setState({ ...state, loggedIn: false });
      window.location.href = "product.html";
    });
  }
}

function initProductPage() {
  const homeList = document.querySelector("#homeVideoList");
  const homePagedList = document.querySelector("#homePagedList");
  if (!homeList && !homePagedList) return;

  const newest = [...DEMO_VIDEOS].sort(
    (a, b) => Number(b.id.replace("v", "")) - Number(a.id.replace("v", ""))
  );

  function renderCards(items) {
    return items.map((video) => `
      <article class="video-item">
        <div>
          <div class="badge-row" style="margin-bottom: 8px;">
            <span class="badge">${video.genre}</span>
            ${(video.tags || []).map((tag) => `<span class="mini-badge">${tag}</span>`).join("")}
          </div>
          <h3>${video.title}</h3>
          <p>${video.description}</p>
          <p class="helper">出演者: ${video.cast}</p>
          <p class="helper">再生時間: ${video.duration} / 価格: ${video.price} 税込 / 買い切り</p>
        </div>
        <div class="inline-actions">
          <button class="btn btn-primary" data-action="buy-now" data-video-id="${video.id}">この動画を購入</button>
          <a class="btn btn-ghost" href="product-detail.html?video=${encodeURIComponent(video.id)}">詳細を見る</a>
        </div>
      </article>
    `).join("");
  }

  function bindBuyActions(root) {
    if (!root) return;
    root.querySelectorAll("[data-action='buy-now']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const videoId = btn.getAttribute("data-video-id") || "v1";
        ensureLogin(`purchase-confirm.html?video=${encodeURIComponent(videoId)}`);
      });
    });
  }

  if (homeList) {
    const featured = newest.slice(0, 6);
    homeList.innerHTML = renderCards(featured);
    bindBuyActions(homeList);
  }

  if (homePagedList) {
    const pageSize = 10;
    const totalPages = Math.ceil(newest.length / pageSize);
    let currentPage = 1;
    const prevBtn = document.querySelector("#homePrevPage");
    const nextBtn = document.querySelector("#homeNextPage");
    const pageInfo = document.querySelector("#homePageInfo");

    function renderPaged() {
      const start = (currentPage - 1) * pageSize;
      const items = newest.slice(start, start + pageSize);
      homePagedList.innerHTML = renderCards(items);
      bindBuyActions(homePagedList);
      if (pageInfo) pageInfo.textContent = `${currentPage} / ${totalPages}`;
      if (prevBtn) prevBtn.disabled = currentPage === 1;
      if (nextBtn) nextBtn.disabled = currentPage === totalPages;
    }

    prevBtn?.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage -= 1;
        renderPaged();
      }
    });

    nextBtn?.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage += 1;
        renderPaged();
      }
    });

    renderPaged();
  }
}

function initVideosPage() {
  const catalog = document.querySelector("#productCatalog");
  if (!catalog) return;

  const keywordInput = document.querySelector("#searchKeyword");
  const genreSelect = document.querySelector("#filterGenre");
  const castSelect = document.querySelector("#filterCast");
  const priceSelect = document.querySelector("#filterPrice");
  const sortSelect = document.querySelector("#sortOrder");
  const resultCount = document.querySelector("#resultCount");

  function bindBuyActions() {
    document.querySelectorAll("[data-action='buy-now']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const videoId = btn.getAttribute("data-video-id") || "v1";
        ensureLogin(`purchase-confirm.html?video=${encodeURIComponent(videoId)}`);
      });
    });
  }

  function renderCatalog(items) {
    if (items.length === 0) {
      catalog.innerHTML = "<div class='notice notice-warning'>条件に一致する動画はありません。検索条件を変更してください。</div>";
      if (resultCount) resultCount.textContent = `0件 / 全${DEMO_VIDEOS.length}件`;
      return;
    }

    catalog.innerHTML = items.map((video) => `
      <article class="video-item">
        <div>
          <div class="badge-row" style="margin-bottom: 8px;">
            <span class="badge">${video.genre}</span>
            ${(video.tags || []).map((tag) => `<span class="mini-badge">${tag}</span>`).join("")}
          </div>
          <h3>${video.title}</h3>
          <p>${video.description}</p>
          <p class="helper">出演者: ${video.cast}</p>
          <p class="helper">再生時間: ${video.duration} / 価格: ${video.price} 税込 / 買い切り</p>
        </div>
        <div class="inline-actions">
          <button class="btn btn-primary" data-action="buy-now" data-video-id="${video.id}">この動画を購入</button>
          <a class="btn btn-ghost" href="product-detail.html?video=${encodeURIComponent(video.id)}">詳細を見る</a>
          <a class="btn btn-secondary" href="watch.html?video=${encodeURIComponent(video.id)}">視聴ページへ</a>
        </div>
      </article>
    `).join("");

    if (resultCount) resultCount.textContent = `${items.length}件 / 全${DEMO_VIDEOS.length}件`;
    bindBuyActions();
  }

  function populateSelect(select, options, allLabel) {
    if (!select) return;
    select.innerHTML = `<option value="">${allLabel}</option>${options.map((o) => `<option value="${o}">${o}</option>`).join("")}`;
  }

  function applyFilters() {
    const keyword = (keywordInput?.value || "").trim().toLowerCase();
    const genre = genreSelect?.value || "";
    const cast = castSelect?.value || "";
    const priceRange = priceSelect?.value || "";
    const sortOrder = sortSelect?.value || "new";

    let filtered = DEMO_VIDEOS.filter((video) => {
      const matchKeyword = !keyword || video.title.toLowerCase().includes(keyword);
      const matchGenre = !genre || video.genre === genre;
      const matchCast = !cast || video.cast === cast;
      let matchPrice = true;

      if (priceRange) {
        const [min, max] = priceRange.split("-").map((v) => Number(v));
        const priceNum = parsePriceToNumber(video.price);
        matchPrice = priceNum >= min && priceNum <= max;
      }

      return matchKeyword && matchGenre && matchCast && matchPrice;
    });

    filtered = filtered.sort((a, b) => {
      if (sortOrder === "price-asc") {
        return parsePriceToNumber(a.price) - parsePriceToNumber(b.price);
      }
      if (sortOrder === "price-desc") {
        return parsePriceToNumber(b.price) - parsePriceToNumber(a.price);
      }
      return Number(b.id.replace("v", "")) - Number(a.id.replace("v", ""));
    });

    renderCatalog(filtered);
  }

  const uniqueGenres = Array.from(new Set(DEMO_VIDEOS.map((v) => v.genre)));
  const uniqueCasts = Array.from(new Set(DEMO_VIDEOS.map((v) => v.cast)));
  populateSelect(genreSelect, uniqueGenres, "すべてのジャンル");
  populateSelect(castSelect, uniqueCasts, "すべての出演者");

  const url = new URL(window.location.href);
  const qGenre = url.searchParams.get("genre") || "";
  const qCast = url.searchParams.get("cast") || "";
  if (qGenre && genreSelect) genreSelect.value = qGenre;
  if (qCast && castSelect) castSelect.value = qCast;

  keywordInput?.addEventListener("input", applyFilters);
  genreSelect?.addEventListener("change", applyFilters);
  castSelect?.addEventListener("change", applyFilters);
  priceSelect?.addEventListener("change", applyFilters);
  sortSelect?.addEventListener("change", applyFilters);

  applyFilters();
}

function initCastListPage() {
  const root = document.querySelector("#castList");
  if (!root) return;
  const casts = Array.from(new Set(DEMO_VIDEOS.map((v) => v.cast)));
  root.innerHTML = casts.map((cast) => {
    const count = DEMO_VIDEOS.filter((v) => v.cast === cast).length;
    return `
      <a class="directory-item" href="videos.html?cast=${encodeURIComponent(cast)}">
        <h3>${cast}</h3>
        <p>${count}本の動画</p>
      </a>
    `;
  }).join("");
}

function initGenreListPage() {
  const root = document.querySelector("#genreList");
  if (!root) return;
  const genres = Array.from(new Set(DEMO_VIDEOS.map((v) => v.genre)));
  root.innerHTML = genres.map((genre) => {
    const count = DEMO_VIDEOS.filter((v) => v.genre === genre).length;
    return `
      <a class="directory-item" href="videos.html?genre=${encodeURIComponent(genre)}">
        <h3>${genre}</h3>
        <p>${count}本の動画</p>
      </a>
    `;
  }).join("");
}

function initProductDetailPage() {
  const root = document.querySelector("#productDetail");
  if (!root) return;

  const url = new URL(window.location.href);
  const videoId = url.searchParams.get("video") || "v1";
  const video = DEMO_VIDEOS.find((v) => v.id === videoId) || DEMO_VIDEOS[0];
  const state = getState();
  const owned = state.purchases.includes(video.id);

  root.innerHTML = `
    <article class="card section">
      <div class="badge-row">
        <span class="badge">${video.genre}</span>
        ${(video.tags || []).map((tag) => `<span class="mini-badge">${tag}</span>`).join("")}
      </div>
      <h1 style="margin-top: 12px;">${video.title}</h1>
      <p class="lead">${video.description}</p>
      <div class="meta-grid">
        <div class="meta-key">価格</div><div>${video.price} 税込 / 買い切り</div>
        <div class="meta-key">再生時間</div><div>${video.duration}</div>
        <div class="meta-key">出演者</div><div>${video.cast}</div>
        <div class="meta-key">配信形式</div><div>買い切り / ブラウザ視聴</div>
      </div>
      <h2 style="margin-top: 18px;">サンプル動画</h2>
      <div class="video-player">サンプル動画プレイヤー（ダミー）</div>
      <p class="helper">冒頭約60秒のサンプルを想定した表示です。</p>
      <h2 style="margin-top: 18px;">動画の説明文</h2>
      <div class="notice notice-info">${video.detailDescription || "テキストテキスト"}</div>
      <h2 style="margin-top: 18px;">収録内容</h2>
      <ul class="list">
        <li>本編映像（${video.duration}）</li>
        <li>チャプター分割（シーンごとに再生可能）</li>
        <li>ダイジェストクリップ（約3分）</li>
      </ul>
      <h2 style="margin-top: 18px;">視聴方法</h2>
      <div class="notice notice-info">購入後、マイページの「購入済み動画一覧」からブラウザで視聴できます。</div>
      <h2 style="margin-top: 18px;">注意事項</h2>
      <ul class="list">
        <li>本商品は買い切り型のデジタル動画です。</li>
        <li>権利保護のため、録画・転載・再配布は禁止されています。</li>
        <li>通信環境によって再生品質が変動する場合があります。</li>
      </ul>
      <h2 style="margin-top: 18px;">推奨環境</h2>
      <div class="meta-grid">
        <div class="meta-key">ブラウザ</div><div>最新の Chrome / Safari / Edge / Firefox</div>
        <div class="meta-key">回線</div><div>下り 10Mbps 以上推奨</div>
        <div class="meta-key">端末</div><div>スマートフォン、タブレット、PC</div>
      </div>
      <div class="cta-group">
        <button class="btn btn-primary" data-action="buy-now" data-video-id="${video.id}">この動画を購入</button>
        ${owned ? `<a class="btn btn-secondary" href="watch.html?video=${encodeURIComponent(video.id)}">視聴する</a>` : `<a class="btn btn-ghost" href="product.html">商品一覧へ戻る</a>`}
      </div>
    </article>
  `;

  root.querySelector("[data-action='buy-now']")?.addEventListener("click", () => {
    ensureLogin(`purchase-confirm.html?video=${encodeURIComponent(video.id)}`);
  });
}

function initPurchaseConfirmPage() {
  const root = document.querySelector("#purchaseConfirm");
  if (!root) return;

  const url = new URL(window.location.href);
  const videoId = url.searchParams.get("video") || "v1";
  const video = DEMO_VIDEOS.find((v) => v.id === videoId) || DEMO_VIDEOS[0];
  const state = getState();

  if (!state.loggedIn) {
    const redirect = encodeURIComponent(`purchase-confirm.html?video=${video.id}`);
    window.location.href = `login.html?redirect=${redirect}`;
    return;
  }

  root.innerHTML = `
    <article class="card section" style="max-width: 760px; margin-inline: auto;">
      <span class="badge">購入確認</span>
      <h1 style="margin-top: 12px;">本当に購入してよろしいですか？</h1>
      <p class="lead">この画面は最終確認画面です。購入内容と返品特約を確認のうえ、購入を確定してください。</p>
      <div class="meta-grid">
        <div class="meta-key">商品名</div><div>${video.title}</div>
        <div class="meta-key">ジャンル</div><div>${video.genre}</div>
        <div class="meta-key">出演者</div><div>${video.cast}</div>
        <div class="meta-key">再生時間</div><div>${video.duration}</div>
        <div class="meta-key">お支払い総額</div><div>${video.price} 税込 / 買い切り</div>
        <div class="meta-key">商品代金以外の費用</div><div>通信料（お客様負担）</div>
        <div class="meta-key">支払方法</div><div>クレジットカード（モック）</div>
        <div class="meta-key">支払時期</div><div>購入確定時に決済</div>
        <div class="meta-key">販売形式</div><div>買い切り（追加課金なし）</div>
      </div>
      <h2 style="margin-top: 18px;">返品特約（重要）</h2>
      <div class="notice notice-warning">
        デジタルコンテンツの性質上、購入確定後の返品・キャンセルはできません。<br>
        不具合時は返金ではなく、再配信・代替提供等で対応する場合があります。
      </div>
      <label style="margin-top: 18px;">
        <input id="agreeTerms" type="checkbox" style="width:auto; margin-right:8px;">
        利用規約と特定商取引法に基づく表記に同意の上購入します
      </label>
      <p class="helper">
        <a href="terms.html">利用規約</a> と <a href="tokusho.html">特定商取引法に基づく表記</a> をご確認ください。
      </p>
      <div class="cta-group">
        <button class="btn btn-primary" id="confirmPurchase" disabled>購入を確定する</button>
        <a class="btn btn-ghost" href="product-detail.html?video=${encodeURIComponent(video.id)}">商品詳細へ戻る</a>
      </div>
    </article>
  `;

  const agreeTerms = root.querySelector("#agreeTerms");
  const confirmButton = root.querySelector("#confirmPurchase");

  agreeTerms?.addEventListener("change", () => {
    if (confirmButton) confirmButton.disabled = !agreeTerms.checked;
  });

  confirmButton?.addEventListener("click", () => {
    if (!agreeTerms?.checked) return;
    const ok = window.confirm("この内容で購入手続きに進みます。よろしいですか？");
    if (!ok) return;
    window.location.href = `thankyou.html?video=${encodeURIComponent(video.id)}`;
  });
}

function initLoginPage() {
  const form = document.querySelector("#loginForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.querySelector("#email")?.value || "demo@example.com";
    const state = getState();
    setState({ ...state, loggedIn: true, email });

    const url = new URL(window.location.href);
    const redirect = url.searchParams.get("redirect") || "product.html";
    window.location.href = redirect;
  });
}

function initRegisterPage() {
  const form = document.querySelector("#registerForm");
  if (!form) return;

  const message = document.querySelector("#registerMessage");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const password = document.querySelector("#registerPassword")?.value || "";
    const passwordConfirm = document.querySelector("#registerPasswordConfirm")?.value || "";
    const email = document.querySelector("#registerEmail")?.value || "demo@example.com";
    const agree = document.querySelector("#registerAgree");

    if (password.length < 8) {
      if (message) message.textContent = "パスワードは8文字以上で入力してください。";
      return;
    }

    if (password !== passwordConfirm) {
      if (message) message.textContent = "確認用パスワードが一致しません。";
      return;
    }

    if (!agree?.checked) {
      if (message) message.textContent = "利用規約とプライバシーポリシーへの同意が必要です。";
      return;
    }

    const state = getState();
    setState({ ...state, loggedIn: true, email });

    const url = new URL(window.location.href);
    const redirect = url.searchParams.get("redirect") || "product.html";
    window.location.href = redirect;
  });
}

function initThanksPage() {
  const finalizeBtn = document.querySelector("[data-action='finalize-purchase']");
  const state = getState();
  if (!state.loggedIn) return;

  const url = new URL(window.location.href);
  const videoId = url.searchParams.get("video") || "v1";
  const nextPurchases = Array.from(new Set([...state.purchases, videoId]));
  if (nextPurchases.length !== state.purchases.length) {
    setState({ ...state, purchases: nextPurchases });
  }

  if (!finalizeBtn) return;
  finalizeBtn.addEventListener("click", () => {
    window.location.href = "mypage.html";
  });
}

function initMyPage() {
  const list = document.querySelector("#purchasedList");
  if (!list) return;

  const state = getState();
  if (!state.loggedIn) {
    window.location.href = "login.html?redirect=mypage.html";
    return;
  }

  const account = document.querySelector("#accountSummary");
  if (account) {
    account.innerHTML = `
      <div class="notice notice-info" style="margin-top:0;">
        <strong>登録メールアドレス（ダミー）:</strong> ${state.email || "demo@example.com"}
      </div>
      <button class="btn btn-ghost" data-action="page-logout">ログアウト</button>
    `;
    account.querySelector("[data-action='page-logout']")?.addEventListener("click", () => {
      setState({ ...state, loggedIn: false });
      window.location.href = "product.html";
    });
  }

  const purchased = DEMO_VIDEOS.filter((v) => state.purchases.includes(v.id));
  if (purchased.length === 0) {
    list.innerHTML = "<div class='notice notice-warning'>購入済み動画はまだありません。商品ページから購入モックを実行してください。</div>";
    return;
  }

  list.innerHTML = purchased
    .map(
      (v) => `
      <article class='video-item'>
        <div>
          <h3>${v.title}</h3>
          <p>${v.genre} / ${v.description}</p>
          <p class='helper'>再生時間: ${v.duration}</p>
        </div>
        <a class='btn btn-secondary' href='watch.html?video=${encodeURIComponent(v.id)}'>視聴ページへ</a>
      </article>`
    )
    .join("");
}

function initWatchPage() {
  const gate = document.querySelector("#watchGate");
  if (!gate) return;

  const url = new URL(window.location.href);
  const videoId = url.searchParams.get("video") || "v1";
  const state = getState();
  if (!state.loggedIn) {
    const redirect = encodeURIComponent(`watch.html?video=${videoId}`);
    gate.innerHTML = `
      <div class='notice notice-warning'>視聴にはログインが必要です。</div>
      <a class='btn btn-primary' href='login.html?redirect=${redirect}'>ログインして続ける</a>`;
    return;
  }

  if (!isOwned(videoId)) {
    gate.innerHTML = `
      <div class='notice notice-danger'>この動画を視聴するには購入が必要です</div>
      <div class='cta-group'>
        <a class='btn btn-primary' href='purchase-confirm.html?video=${encodeURIComponent(videoId)}'>この動画を購入する</a>
        <a class='btn btn-secondary' href='product-detail.html?video=${encodeURIComponent(videoId)}'>商品詳細を見る</a>
        <a class='btn btn-ghost' href='product.html'>商品ページへ戻る</a>
      </div>`;
    return;
  }

  const video = DEMO_VIDEOS.find((v) => v.id === videoId) || DEMO_VIDEOS[0];
  gate.innerHTML = `
    <div class='video-player'>動画プレイヤー（ダミー）</div>
    <h2 style='margin-top: 14px;'>${video.title}</h2>
    <p class='lead' style='margin: 0;'>${video.description}</p>`;
}

function setActiveNav() {
  let page = location.pathname.split("/").pop();
  if (page === "product-detail.html") {
    page = "product.html";
  }
  if (page === "purchase-confirm.html") {
    page = "product.html";
  }
  if (page === "thankyou.html") {
    page = "product.html";
  }
  if (page === "register.html") {
    page = "login.html";
  }
  document.querySelectorAll(".nav-link[data-page]").forEach((el) => {
    if (el.getAttribute("data-page") === page) {
      el.classList.add("is-active");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderHeaderNav();
  setStatusText();
  bindCommonActions();
  setActiveNav();
  initProductPage();
  initVideosPage();
  initCastListPage();
  initGenreListPage();
  initProductDetailPage();
  initPurchaseConfirmPage();
  initLoginPage();
  initRegisterPage();
  initThanksPage();
  initMyPage();
  initWatchPage();
});
