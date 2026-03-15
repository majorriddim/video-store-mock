const STORAGE_KEY = "videoStoreMockState";
const HUMAN_VERIFICATION_SETTINGS_KEY = "videoStoreHumanVerificationSettings";
const HUMAN_VERIFICATION_RATE_KEY = "videoStoreHumanVerificationRateLog";

const HUMAN_VERIFICATION_DEFAULTS = {
  enabled: true,
  provider: "turnstile",
  siteKey: "1x00000000000000000000AA",
  secretKey: "mock-secret",
  targets: {
    register: true,
    contact: true
  }
};

const HUMAN_VERIFICATION_LIMITS = {
  register: { limit: 5, windowMs: 10 * 60 * 1000 },
  contact: { limit: 10, windowMs: 10 * 60 * 1000 }
};

const HUMAN_VERIFICATION_PROVIDERS = {
  turnstile: {
    verifyToken({ token }) {
      if (!token) return { ok: false, reason: "missing-token" };
      if (!String(token).startsWith("mock-ts-")) return { ok: false, reason: "invalid-token" };
      return { ok: true };
    }
  }
};
const LONG_DETAIL_TEXT = "テキストテキスト。テキストテキストテキストテキスト、テキストテキストテキストテキスト。テキストテキスト、テキストテキストテキストテキストテキストテキスト。テキストテキストテキストテキスト、テキストテキスト。テキストテキストテキストテキスト、テキストテキストテキストテキストテキストテキスト。";
const GENRES = ["ジャンル名A", "ジャンル名B", "ジャンル名C", "ジャンル名D", "ジャンル名E"];
const CASTS = ["出演者A", "出演者B", "出演者C", "出演者D", "出演者E", "出演者F", "出演者G", "出演者H"];
const CAST_PROFILES = {
  "出演者A": "ナチュラルな雰囲気と表情の変化が魅力。初めての方にも人気の出演者です。",
  "出演者B": "落ち着いた空気感と大人っぽい演出が特徴。しっとり系の作品で支持されています。",
  "出演者C": "テンポの良い展開と明るいキャラクターで、リピート視聴の多い出演者です。",
  "出演者D": "丁寧な演技と安定感が強み。ストーリー重視の作品を中心に出演しています。",
  "出演者E": "クールな世界観にマッチする表現力が魅力。新作の注目度が高い出演者です。",
  "出演者F": "やわらかな雰囲気と親しみやすさで、幅広いジャンルに対応しています。",
  "出演者G": "ドラマ性の高い構成で存在感を発揮。長尺作品でも評価の高い出演者です。",
  "出演者H": "自然体の魅力と安定したパフォーマンスで、初見ユーザーにもおすすめです。"
};

function formatYen(value) {
  return `¥${Number(value).toLocaleString("ja-JP")}`;
}

const DEMO_VIDEOS = Array.from({ length: 50 }, (_, i) => {
  const index = i + 1;
  const basePrice = 980 + (i % 6) * 200;
  const salePrice = index % 4 === 0 ? Math.max(680, Math.floor(basePrice * 0.55 / 10) * 10) : null;
  const thumbHue = (index * 37) % 360;
  return {
    id: `v${index}`,
    title: `テキストテキスト ${String(index).padStart(2, "0")}`,
    description: "テキストテキスト",
    detailDescription: LONG_DETAIL_TEXT,
    duration: `${45 + (i % 8) * 5}分`,
    basePrice,
    salePrice,
    thumbHue,
    price: formatYen(basePrice),
    genre: GENRES[i % GENRES.length],
    cast: CASTS[i % CASTS.length],
    tags: index <= 10 ? ["新着", "おすすめ"] : index % 3 === 0 ? ["おすすめ"] : ["新着"]
  };
});

const MANUAL_RELATED_VIDEO_MAP = {
  v1: ["v2", "v9", "v14", "v18"],
  v2: ["v1", "v10", "v12", "v21"],
  v3: ["v8", "v11", "v16", "v24"],
  v4: ["v6", "v7", "v13", "v19"]
};

const RECOMMENDED_VIDEO_IDS = ["v4", "v8", "v11", "v15", "v20", "v26"];
const RECOMMENDED_CASTS = ["出演者A", "出演者C"];
const RANKED_VIDEO_IDS = ["v4", "v1", "v8", "v12", "v6"];
const DEMO_NEWS = [
  { id: "NEWS-0005", title: "新作動画を3本追加しました", publishedAt: "2026-03-15", status: "公開" },
  { id: "NEWS-0004", title: "出演者ページを公開しました", publishedAt: "2026-03-10", status: "公開" },
  { id: "NEWS-0003", title: "動画視聴ページに関連動画導線を追加しました", publishedAt: "2026-03-05", status: "公開" },
  { id: "NEWS-0002", title: "メンテナンスのお知らせ", publishedAt: "2026-03-03", status: "下書き" },
  { id: "NEWS-0001", title: "Video-Storeを公開しました", publishedAt: "2026-03-01", status: "公開" }
];

function parsePriceToNumber(priceText) {
  if (typeof priceText === "number") return priceText;
  return Number(String(priceText).replace(/[^\d]/g, "")) || 0;
}

function isSaleVideo(video) {
  const regular = parsePriceToNumber(video.basePrice || video.price);
  const sale = parsePriceToNumber(video.salePrice);
  return sale > 0 && sale < regular;
}

function getCurrentPriceNumber(video) {
  if (isSaleVideo(video)) return parsePriceToNumber(video.salePrice);
  return parsePriceToNumber(video.basePrice || video.price);
}

function getCurrentPriceText(video) {
  return formatYen(getCurrentPriceNumber(video));
}

function buildCardPriceBlock(video) {
  if (!isSaleVideo(video)) {
    return `
      <div class="price-stack">
        <p class="card-price-current">${getCurrentPriceText(video)}（税込）</p>
      </div>
    `;
  }
  const regularText = formatYen(parsePriceToNumber(video.basePrice || video.price));
  return `
    <div class="sale-price-block price-stack">
      <p class="card-price-regular">通常 ${regularText}（税込）</p>
      <p class="card-price-arrow">↓</p>
      <p class="card-price-sale">${getCurrentPriceText(video)}（税込）</p>
    </div>
  `;
}

function buildFavoriteButton(videoId, isFavorite) {
  return `
    <button class="favorite-btn ${isFavorite ? "is-active" : ""}" type="button" data-action="toggle-favorite" data-video-id="${videoId}" aria-pressed="${isFavorite ? "true" : "false"}" aria-label="お気に入り">
      ${isFavorite ? "❤️" : "♡"}
    </button>
  `;
}

function buildGenreLink(genre) {
  return `<a class="badge badge-link" href="videos.html?genre=${encodeURIComponent(genre)}">${genre}</a>`;
}

function buildCastLink(cast) {
  return `<a class="meta-link" href="videos.html?cast=${encodeURIComponent(cast)}">${cast}</a>`;
}

function buildSaleLink() {
  return `<a class="mini-badge mini-badge-sale" href="videos.html?sale=1">🔥期間限定価格</a>`;
}

function buildVideoThumb(video) {
  const detailUrl = `product-detail.html?video=${encodeURIComponent(video.id)}`;
  if (video.thumbnailUrl) {
    return `
      <a class="video-thumb-link" href="${detailUrl}" aria-label="${video.title}の詳細を見る">
        <img class="video-thumb-image" src="${video.thumbnailUrl}" alt="${video.title}">
      </a>
    `;
  }
  return `
    <a class="video-thumb-link" href="${detailUrl}" aria-label="${video.title}の詳細を見る">
      <div class="video-thumb-placeholder" style="--thumb-h:${video.thumbHue || 210}">
        <span class="thumb-cast">${video.cast}</span>
        <span class="thumb-label">サムネイル</span>
      </div>
    </a>
  `;
}

function buildCardPrimaryAction(videoId, isLoggedIn, isPurchased) {
  if (!isLoggedIn) {
    const redirect = encodeURIComponent(`purchase-confirm.html?video=${videoId}`);
    return `<a class="btn btn-primary" href="login.html?redirect=${redirect}">ログインして視聴</a>`;
  }
  if (isPurchased) {
    return `<a class="btn btn-primary" href="watch.html?video=${encodeURIComponent(videoId)}">視聴する</a>`;
  }
  return `<button class="btn btn-primary" data-action="buy-now" data-video-id="${videoId}">この動画を視聴</button>`;
}

function buildVideoCard(video, state, options = {}) {
  const isLoggedIn = Boolean(state.loggedIn);
  const ownedSet = new Set(state.purchases || []);
  const favoritesSet = new Set(state.favorites || []);
  const isPurchased = isLoggedIn && ownedSet.has(video.id);
  const showFavorite = options.showFavorite !== false;
  const showPrice = options.showPrice !== false;
  const rankBadgeHtml = options.rankBadgeHtml || "";

  const primaryAction = options.primaryActionHtml || buildCardPrimaryAction(video.id, isLoggedIn, isPurchased);
  const detailLink = options.detailLinkHtml || `<a class="btn btn-ghost" href="product-detail.html?video=${encodeURIComponent(video.id)}">詳細・サンプルを見る</a>`;
  const extraBadges = [];
  if (isSaleVideo(video)) {
    extraBadges.push(buildSaleLink());
  }
  if (isPurchased) {
    extraBadges.push(`<span class="mini-badge mini-badge-owned">購入済み</span>`);
  }

  return `
    <article class="video-item">
      ${rankBadgeHtml}
      <div class="video-thumb-col">
        ${buildVideoThumb(video)}
      </div>
      <div class="video-main">
        <div class="video-cast-row">
          <a class="video-cast-name" href="videos.html?cast=${encodeURIComponent(video.cast)}">${video.cast}</a>
          ${showFavorite ? buildFavoriteButton(video.id, favoritesSet.has(video.id)) : ""}
        </div>
        <h3><a class="video-title-link" href="product-detail.html?video=${encodeURIComponent(video.id)}">${video.title}</a></h3>
        <p class="video-description">${video.description}</p>
        <p class="helper">再生時間: ${video.duration}</p>
        <div class="badge-row">
          ${buildGenreLink(video.genre)}
          ${(video.tags || []).map((tag) => `<span class="mini-badge">${tag}</span>`).join("")}
          ${extraBadges.join("")}
        </div>
      </div>
      <div class="video-actions">
        ${showPrice ? buildCardPriceBlock(video) : ""}
        <div class="inline-actions">
          ${primaryAction}
          ${detailLink}
        </div>
      </div>
    </article>
  `;
}

function buildPurchasedCard(video) {
  return `
    <article class="video-item purchased-item">
      <div class="video-thumb-col">
        ${buildVideoThumb(video)}
      </div>
      <div class="video-main">
        <h3><a class="video-title-link" href="product-detail.html?video=${encodeURIComponent(video.id)}">${video.title}</a></h3>
        <p class="helper purchased-meta">${buildCastLink(video.cast)}</p>
        <p class="helper">再生時間: ${video.duration}</p>
      </div>
      <div class="video-actions">
        <a class="btn btn-primary" href="watch.html?video=${encodeURIComponent(video.id)}">視聴する</a>
      </div>
    </article>
  `;
}

function bindFavoriteActions(root, onChange) {
  if (!root) return;
  root.querySelectorAll("[data-action='toggle-favorite']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const videoId = btn.getAttribute("data-video-id");
      if (!videoId) return;
      const state = getState();
      const nextFavorites = new Set(state.favorites || []);
      if (nextFavorites.has(videoId)) {
        nextFavorites.delete(videoId);
      } else {
        nextFavorites.add(videoId);
      }
      const isActive = nextFavorites.has(videoId);
      setState({ ...state, favorites: Array.from(nextFavorites) });

      document.querySelectorAll(`[data-action='toggle-favorite'][data-video-id='${videoId}']`).forEach((target) => {
        target.classList.toggle("is-active", isActive);
        target.setAttribute("aria-pressed", isActive ? "true" : "false");
        target.textContent = isActive ? "❤️" : "♡";
      });

      if (typeof onChange === "function") {
        onChange(videoId, isActive);
      }
    });
  });
}

function getRelatedVideosByPriority(video, count = 6) {
  const selected = [];
  const selectedIds = new Set([video.id]);

  function pushByIds(ids, source) {
    ids.forEach((id) => {
      if (selected.length >= count || selectedIds.has(id)) return;
      const item = DEMO_VIDEOS.find((v) => v.id === id);
      if (!item) return;
      selected.push({ ...item, relationSource: source });
      selectedIds.add(item.id);
    });
  }

  function pushByFilter(filter, source) {
    DEMO_VIDEOS.forEach((item) => {
      if (selected.length >= count || selectedIds.has(item.id)) return;
      if (!filter(item)) return;
      selected.push({ ...item, relationSource: source });
      selectedIds.add(item.id);
    });
  }

  pushByIds(MANUAL_RELATED_VIDEO_MAP[video.id] || [], "手動関連");
  pushByFilter((item) => item.cast === video.cast, "同じ出演者");
  pushByFilter((item) => item.genre === video.genre, "同じカテゴリ");

  return selected.slice(0, count);
}

function getNextRecommendedVideos(video, count = 3) {
  const picked = [];
  const pickedIds = new Set([video.id]);

  function push(videoList, source) {
    videoList.forEach((item) => {
      if (!item || picked.length >= count || pickedIds.has(item.id)) return;
      picked.push({ ...item, relationSource: source });
      pickedIds.add(item.id);
    });
  }

  const manual = (MANUAL_RELATED_VIDEO_MAP[video.id] || [])
    .map((id) => DEMO_VIDEOS.find((item) => item.id === id))
    .filter(Boolean);
  const recommended = RECOMMENDED_VIDEO_IDS
    .map((id) => DEMO_VIDEOS.find((item) => item.id === id))
    .filter(Boolean);
  const sameCast = DEMO_VIDEOS.filter((item) => item.cast === video.cast && item.id !== video.id);

  push(manual, "手動おすすめ");
  push(recommended, "おすすめ設定");
  push(sameCast, "同じ出演者");

  return picked.slice(0, count);
}

function buildJourneyVideoCard(video) {
  const hasNewTag = Array.isArray(video.tags) && video.tags.includes("新着");
  const badges = [
    `<a class="mini-badge" href="videos.html?genre=${encodeURIComponent(video.genre)}">${video.genre}</a>`,
    isSaleVideo(video) ? buildSaleLink() : "",
    hasNewTag ? `<span class="mini-badge">新着</span>` : ""
  ].join("");
  const badgeRow = badges ? `<div class="badge-row">${badges}</div>` : "";

  return `
    <article class="recommendation-card">
      ${buildVideoThumb(video)}
      <div class="recommendation-card-body">
        <h3 class="recommendation-title">${video.title}</h3>
        ${badgeRow}
        <p class="recommendation-cast">${buildCastLink(video.cast)}</p>
        <p class="recommendation-price">${getCurrentPriceText(video)}（税込）</p>
        <a class="btn btn-ghost" href="product-detail.html?video=${encodeURIComponent(video.id)}">詳細を見る</a>
      </div>
    </article>
  `;
}

function getState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { loggedIn: false, purchases: [], favorites: [], email: "" };
    const parsed = JSON.parse(raw);
    return {
      loggedIn: Boolean(parsed.loggedIn),
      purchases: Array.isArray(parsed.purchases) ? parsed.purchases : [],
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      email: typeof parsed.email === "string" ? parsed.email : ""
    };
  } catch {
    return { loggedIn: false, purchases: [], favorites: [], email: "" };
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

  function renderNavShell(primaryLinks, secondaryLinks) {
    return `
      <div class="nav-primary">
        ${primaryLinks.join("")}
      </div>
      <div class="nav-secondary-desktop">
        ${secondaryLinks.join("")}
      </div>
      <div class="nav-mobile-more">
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobileMenu">☰</button>
        <div class="menu-dropdown" id="mobileMenu">
          ${secondaryLinks.join("")}
        </div>
      </div>
    `;
  }

  if (!state.loggedIn) {
    nav.innerHTML = renderNavShell(
      [
        `<a class="nav-link" data-page="product.html" href="product.html">トップ</a>`,
        `<a class="nav-link" data-page="videos.html" href="videos.html">動画を探す</a>`,
        `<a class="nav-link" data-page="casts.html" href="casts.html">出演者一覧</a>`
      ],
      [
        `<a class="nav-link" data-page="genres.html" href="genres.html">ジャンル一覧</a>`,
        `<a class="nav-link" data-page="login.html" href="login.html">ログイン</a>`,
        `<a class="nav-link" data-page="register.html" href="register.html">会員登録</a>`
      ]
    );
    return;
  }

  nav.innerHTML = renderNavShell(
    [
      `<a class="nav-link" data-page="product.html" href="product.html">トップ</a>`,
      `<a class="nav-link" data-page="videos.html" href="videos.html">動画を探す</a>`,
      `<a class="nav-link" data-page="casts.html" href="casts.html">出演者一覧</a>`
    ],
    [
      `<a class="nav-link" data-page="genres.html" href="genres.html">ジャンル一覧</a>`,
      `<a class="nav-link" data-page="mypage.html" href="mypage.html">マイページ</a>`,
      `<a class="nav-link" href="#" data-action="header-logout">ログアウト</a>`
    ]
  );
}

function initMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const dropdown = document.querySelector(".menu-dropdown");
  if (!toggle || !dropdown) return;

  toggle.addEventListener("click", () => {
    const opened = dropdown.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", opened ? "true" : "false");
  });

  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (!target.closest(".nav-mobile-more")) {
      dropdown.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
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
  const homeFavoriteSection = document.querySelector("#homeFavoriteSection");
  const homeFavoriteList = document.querySelector("#homeFavoriteList");
  const homePagedList = document.querySelector("#homePagedList");
  const heroPrimaryAction = document.querySelector("#heroPrimaryAction");
  const heroMainVisual = document.querySelector("#heroMainVisual");
  const heroMainVisualImage = document.querySelector("#heroMainVisualImage");
  if (!homeList && !homeFavoriteList && !homePagedList && !heroPrimaryAction) return;
  const state = getState();
  const isLoggedIn = Boolean(state.loggedIn);
  const ownedSet = new Set(state.purchases || []);
  const heroVideo = DEMO_VIDEOS.find((video) => video.id === "v1") || DEMO_VIDEOS[0];

  const newest = [...DEMO_VIDEOS].sort(
    (a, b) => Number(b.id.replace("v", "")) - Number(a.id.replace("v", ""))
  );

  function renderCards(items) {
    return items.map((video) => buildVideoCard(video, state, { showFavorite: false })).join("");
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

  if (heroVideo) {
    if (heroMainVisual instanceof HTMLElement && heroMainVisualImage instanceof HTMLImageElement) {
      if (heroVideo.thumbnailUrl) {
        heroMainVisualImage.src = heroVideo.thumbnailUrl;
        heroMainVisualImage.alt = `${heroVideo.title}のサムネイル`;
        heroMainVisual.classList.add("has-image");
      } else {
        heroMainVisual.classList.remove("has-image");
        heroMainVisualImage.removeAttribute("src");
        heroMainVisualImage.alt = "";
      }
    }
  }

  if (heroPrimaryAction instanceof HTMLAnchorElement) {
    const heroVideoId = "v1";
    const isPurchased = isLoggedIn && ownedSet.has(heroVideoId);
    if (!isLoggedIn) {
      const redirect = encodeURIComponent(`purchase-confirm.html?video=${heroVideoId}`);
      heroPrimaryAction.textContent = "ログインして視聴";
      heroPrimaryAction.href = `login.html?redirect=${redirect}`;
    } else if (isPurchased) {
      heroPrimaryAction.textContent = "視聴する";
      heroPrimaryAction.href = `watch.html?video=${encodeURIComponent(heroVideoId)}`;
    } else {
      heroPrimaryAction.textContent = "この動画を視聴";
      heroPrimaryAction.href = `purchase-confirm.html?video=${encodeURIComponent(heroVideoId)}`;
    }
  }

  if (homeList) {
    const rankingVideos = RANKED_VIDEO_IDS
      .map((id) => DEMO_VIDEOS.find((video) => video.id === id))
      .filter(Boolean)
      .slice(0, 5);

    homeList.innerHTML = rankingVideos.map((video, index) => {
      const rank = index + 1;
      const rankTone = rank === 1 ? "is-gold" : rank === 2 ? "is-silver" : rank === 3 ? "is-bronze" : "";
      return buildVideoCard(video, state, {
        showFavorite: false,
        rankBadgeHtml: `<span class="rank-badge ${rankTone}">#${rank}</span>`
      });
    }).join("");
    bindBuyActions(homeList);
  }

  if (homeFavoriteList && homeFavoriteSection instanceof HTMLElement) {
    const unpurchasedFavorites = newest
      .filter((video) => (state.favorites || []).includes(video.id) && !ownedSet.has(video.id))
      .slice(0, 6);

    if (unpurchasedFavorites.length > 0) {
      homeFavoriteSection.hidden = false;
      homeFavoriteList.innerHTML = renderCards(unpurchasedFavorites);
      bindBuyActions(homeFavoriteList);
    } else {
      homeFavoriteSection.hidden = true;
      homeFavoriteList.innerHTML = "";
    }
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

function initAboutSlider() {
  const root = document.querySelector("#aboutSlider");
  if (!root) return;
  const track = root.querySelector("[data-slider-track]");
  const dotsRoot = document.querySelector("[data-slider-dots]");
  const prevBtn = root.querySelector("[data-slider-prev]");
  const nextBtn = root.querySelector("[data-slider-next]");
  if (!(track instanceof HTMLElement) || !(dotsRoot instanceof HTMLElement)) return;

  const slides = Array.from(track.querySelectorAll(".about-slide"));
  if (slides.length <= 1) return;

  let currentIndex = 0;
  let timerId = null;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  dotsRoot.innerHTML = slides
    .map((_, index) => `<button class="about-slider-dot${index === 0 ? " is-active" : ""}" type="button" data-slider-dot="${index}" aria-label="${index + 1}枚目を表示"></button>`)
    .join("");

  const dots = Array.from(dotsRoot.querySelectorAll("[data-slider-dot]"));

  function render() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === currentIndex);
    });
  }

  function goTo(index) {
    currentIndex = (index + slides.length) % slides.length;
    render();
  }

  function startAutoplay() {
    if (prefersReducedMotion) return;
    stopAutoplay();
    timerId = window.setInterval(() => {
      goTo(currentIndex + 1);
    }, 5200);
  }

  function stopAutoplay() {
    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  prevBtn?.addEventListener("click", () => {
    goTo(currentIndex - 1);
    startAutoplay();
  });

  nextBtn?.addEventListener("click", () => {
    goTo(currentIndex + 1);
    startAutoplay();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const index = Number(dot.getAttribute("data-slider-dot"));
      if (!Number.isNaN(index)) {
        goTo(index);
        startAutoplay();
      }
    });
  });

  root.addEventListener("mouseenter", stopAutoplay);
  root.addEventListener("mouseleave", startAutoplay);
  root.addEventListener("focusin", stopAutoplay);
  root.addEventListener("focusout", startAutoplay);

  render();
  startAutoplay();
}

function initVideosPage() {
  const catalog = document.querySelector("#productCatalog");
  if (!catalog) return;
  const state = getState();
  const pageSize = 10;
  let currentPage = 1;
  let currentItems = [];

  const keywordInput = document.querySelector("#searchKeyword");
  const genreSelect = document.querySelector("#filterGenre");
  const castSelect = document.querySelector("#filterCast");
  const priceSelect = document.querySelector("#filterPrice");
  const saleOnlyCheckbox = document.querySelector("#filterSaleOnly");
  const sortSelect = document.querySelector("#sortOrder");
  const applyFiltersBtn = document.querySelector("#applyFiltersBtn");
  const resetFiltersBtn = document.querySelector("#resetFiltersBtn");
  const resultCount = document.querySelector("#resultCount");
  const prevPageBtn = document.querySelector("#videosPrevPage");
  const nextPageBtn = document.querySelector("#videosNextPage");
  const pageInfo = document.querySelector("#videosPageInfo");

  function bindBuyActions() {
    document.querySelectorAll("[data-action='buy-now']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const videoId = btn.getAttribute("data-video-id") || "v1";
        ensureLogin(`purchase-confirm.html?video=${encodeURIComponent(videoId)}`);
      });
    });
  }

  function renderCatalog(items, page) {
    if (items.length === 0) {
      catalog.innerHTML = "<div class='notice notice-warning'>条件に一致する動画はありません。検索条件を変更してください。</div>";
      if (resultCount) resultCount.textContent = `0 / ${DEMO_VIDEOS.length} 件`;
      if (pageInfo) pageInfo.textContent = "0 / 0";
      if (prevPageBtn) {
        prevPageBtn.disabled = true;
        prevPageBtn.style.display = "none";
      }
      if (nextPageBtn) {
        nextPageBtn.disabled = true;
        nextPageBtn.style.display = "none";
      }
      return;
    }

    const totalPages = Math.ceil(items.length / pageSize);
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const start = (safePage - 1) * pageSize;
    const end = Math.min(start + pageSize, items.length);
    const pagedItems = items.slice(start, end);
    const prevCount = start > 0 ? Math.min(pageSize, start) : 0;
    const nextCount = end < items.length ? Math.min(pageSize, items.length - end) : 0;
    const hidePagerButtons = items.length <= pageSize;

    catalog.innerHTML = pagedItems.map((video) => buildVideoCard(video, state, { showFavorite: false })).join("");

    if (resultCount) resultCount.textContent = `${items.length} / ${DEMO_VIDEOS.length} 件`;
    if (pageInfo) pageInfo.textContent = `${safePage} / ${totalPages}`;
    if (prevPageBtn) {
      prevPageBtn.style.display = hidePagerButtons ? "none" : "";
      prevPageBtn.textContent = safePage === 1 ? "前へ" : `前の${prevCount}件`;
      prevPageBtn.disabled = safePage <= 1;
    }
    if (nextPageBtn) {
      nextPageBtn.style.display = hidePagerButtons ? "none" : "";
      nextPageBtn.textContent = safePage === 1 ? "次へ" : `次の${nextCount}件`;
      nextPageBtn.disabled = safePage >= totalPages;
    }
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
    const saleOnly = Boolean(saleOnlyCheckbox?.checked);
    const sortOrder = sortSelect?.value || "new";

    let filtered = DEMO_VIDEOS.filter((video) => {
      const matchKeyword = !keyword || video.title.toLowerCase().includes(keyword);
      const matchGenre = !genre || video.genre === genre;
      const matchCast = !cast || video.cast === cast;
      let matchPrice = true;

      if (priceRange) {
        const [min, max] = priceRange.split("-").map((v) => Number(v));
        const priceNum = getCurrentPriceNumber(video);
        matchPrice = priceNum >= min && priceNum <= max;
      }

      const matchSale = !saleOnly || isSaleVideo(video);
      return matchKeyword && matchGenre && matchCast && matchPrice && matchSale;
    });

    filtered = filtered.sort((a, b) => {
      if (sortOrder === "price-asc") {
        return getCurrentPriceNumber(a) - getCurrentPriceNumber(b);
      }
      if (sortOrder === "price-desc") {
        return getCurrentPriceNumber(b) - getCurrentPriceNumber(a);
      }
      return Number(b.id.replace("v", "")) - Number(a.id.replace("v", ""));
    });

    currentItems = filtered;
    currentPage = 1;
    renderCatalog(currentItems, currentPage);
  }

  const uniqueGenres = Array.from(new Set(DEMO_VIDEOS.map((v) => v.genre)));
  const uniqueCasts = Array.from(new Set(DEMO_VIDEOS.map((v) => v.cast)));
  populateSelect(genreSelect, uniqueGenres, "すべてのジャンル");
  populateSelect(castSelect, uniqueCasts, "すべての出演者");

  const url = new URL(window.location.href);
  const qGenre = url.searchParams.get("genre") || "";
  const qCast = url.searchParams.get("cast") || "";
  const qSaleOnly = url.searchParams.get("sale") === "1";
  if (qGenre && genreSelect) genreSelect.value = qGenre;
  if (qCast && castSelect) castSelect.value = qCast;
  if (saleOnlyCheckbox) saleOnlyCheckbox.checked = qSaleOnly;

  applyFiltersBtn?.addEventListener("click", applyFilters);
  sortSelect?.addEventListener("change", applyFilters);
  resetFiltersBtn?.addEventListener("click", () => {
    if (keywordInput) keywordInput.value = "";
    if (genreSelect) genreSelect.value = "";
    if (castSelect) castSelect.value = "";
    if (priceSelect) priceSelect.value = "";
    if (saleOnlyCheckbox) saleOnlyCheckbox.checked = false;
    if (sortSelect) sortSelect.value = "new";
    applyFilters();
  });
  keywordInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyFilters();
    }
  });

  prevPageBtn?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage -= 1;
      renderCatalog(currentItems, currentPage);
    }
  });

  nextPageBtn?.addEventListener("click", () => {
    const totalPages = Math.ceil(currentItems.length / pageSize);
    if (currentPage < totalPages) {
      currentPage += 1;
      renderCatalog(currentItems, currentPage);
    }
  });

  applyFilters();
}

function initCastListPage() {
  const root = document.querySelector("#castList");
  if (!root) return;
  const casts = Array.from(new Set(DEMO_VIDEOS.map((v) => v.cast)));
  const getCastHue = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i += 1) {
      hash = ((hash << 5) - hash) + name.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % 360;
  };
  root.innerHTML = casts.map((cast) => {
    const castVideos = DEMO_VIDEOS.filter((v) => v.cast === cast);
    const count = castVideos.length;
    const profile = CAST_PROFILES[cast] || "テキストテキスト";
    const thumbnailUrl = castVideos.find((v) => v.thumbnailUrl)?.thumbnailUrl || "";
    const thumbHtml = thumbnailUrl
      ? `<img class="directory-thumb-image" src="${thumbnailUrl}" alt="${cast}">`
      : `
        <div class="directory-thumb-placeholder" style="--thumb-h:${getCastHue(cast)}">
          <span class="directory-thumb-initial">${cast.slice(-1)}</span>
        </div>
      `;
    return `
      <a class="directory-item" href="videos.html?cast=${encodeURIComponent(cast)}">
        <div class="directory-thumb">
          ${thumbHtml}
        </div>
        <div class="directory-meta">
          <h3>${cast}<span class="directory-count-inline">${count}本</span></h3>
          <p class="directory-description">${profile}</p>
        </div>
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
  const isLoggedIn = Boolean(state.loggedIn);
  const isPurchased = isLoggedIn && state.purchases.includes(video.id);
  const favoriteSet = new Set(state.favorites || []);
  const related = getRelatedVideosByPriority(video, 4);
  const relatedIdSet = new Set(related.map((item) => item.id));
  const favoriteVideos = DEMO_VIDEOS
    .filter((item) => favoriteSet.has(item.id) && item.id !== video.id && !relatedIdSet.has(item.id))
    .slice(0, 4);
  const fallbackFavorites = DEMO_VIDEOS
    .filter((item) => item.id !== video.id && !relatedIdSet.has(item.id))
    .slice(0, 4);
  const favoriteSectionVideos = favoriteVideos.length > 0 ? favoriteVideos : fallbackFavorites;

  root.innerHTML = `
    <article class="card section">
      <div class="detail-top-grid">
        <div class="detail-media">
          <div class="video-player">サンプル動画プレイヤー（ダミー）</div>
        </div>
        <aside class="detail-summary">
          <div class="badge-row detail-badge-row">
            ${buildGenreLink(video.genre)}
            ${(video.tags || []).map((tag) => `<span class="mini-badge">${tag}</span>`).join("")}
            ${isSaleVideo(video) ? buildSaleLink() : ""}
            ${isPurchased ? `<span class="mini-badge mini-badge-owned">購入済み</span>` : ""}
          </div>
          <h1 class="detail-summary-title">${video.title}</h1>
          <div class="detail-inline-meta">
            <div class="detail-info-item"><span class="meta-key">再生時間</span><span>${video.duration}</span></div>
            <div class="detail-info-item"><span class="meta-key">出演者</span><span>${buildCastLink(video.cast)}</span></div>
            <div class="detail-info-item"><span class="meta-key">購入方式</span><span>購入後の追加課金なし</span></div>
          </div>
          <div class="detail-price-block detail-price-block-compact">
            <p class="helper price-label-subtle">価格</p>
            ${buildCardPriceBlock(video)}
          </div>
          <div class="cta-group detail-cta">
            <div class="detail-cta-main">${buildCardPrimaryAction(video.id, isLoggedIn, isPurchased)}</div>
            ${buildFavoriteButton(video.id, favoriteSet.has(video.id))}
          </div>
        </aside>
      </div>
      <div class="detail-body">
        <section class="detail-description-section">
          <h2 class="detail-body-heading">動画の説明文</h2>
          <div class="notice notice-info detail-description-box">${video.detailDescription || "テキストテキスト"}</div>
        </section>
        <div class="detail-meta-grid">
          <section class="detail-meta-card">
            <h2 class="detail-body-heading">収録内容</h2>
            <div class="notice notice-info">収録時間: ${video.duration}</div>
          </section>
          <section class="detail-meta-card">
            <h2 class="detail-body-heading">視聴方法</h2>
            <div class="notice notice-info">購入後、マイページからブラウザで視聴できます。</div>
          </section>
          <section class="detail-meta-card detail-meta-wide">
            <h2 class="detail-body-heading">注意事項</h2>
            <div class="notice notice-info">
              ・本商品は本サービス上でのストリーミング視聴権の提供です。<br>
              ・権利保護のため、録画・転載・再配布は禁止されています。<br>
              ・通信環境によって再生品質が変動する場合があります。
            </div>
          </section>
        </div>
      </div>
      <p class="helper detail-back-link detail-back-link-bottom"><a href="product.html">商品一覧へ戻る</a></p>
      <section class="recommendation-section">
        <h2 style="margin-top: 0;">関連動画</h2>
        <div class="recommendation-grid">
          ${related.map((item) => buildJourneyVideoCard(item)).join("")}
        </div>
      </section>
      <section class="recommendation-section">
        <h2 style="margin-top: 0;">お気に入り</h2>
        <div class="recommendation-grid">
          ${favoriteSectionVideos.map((item) => buildJourneyVideoCard(item)).join("")}
        </div>
      </section>
    </article>
  `;

  root.querySelectorAll("[data-action='buy-now']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-video-id") || video.id;
      ensureLogin(`purchase-confirm.html?video=${encodeURIComponent(targetId)}`);
    });
  });
  bindFavoriteActions(root);
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
      <p class="lead purchase-intro">この画面は確認画面です。下記の内容を確認のうえ、購入を確定してください。</p>
      <div class="meta-grid purchase-meta-grid purchase-summary-box">
        <div class="meta-key">商品名</div><div>${video.title}</div>
        <div class="meta-key">ジャンル</div><div>${video.genre}</div>
        <div class="meta-key">出演者</div><div>${video.cast}</div>
        <div class="meta-key">再生時間</div><div>${video.duration}</div>
        <div class="meta-key">お支払い総額</div><div>${getCurrentPriceText(video)}（税込）</div>
        <div class="meta-key">支払方法</div><div>PayPal / 銀行振り込み</div>
        <div class="meta-key">販売形式</div><div>本サービス上での視聴権の購入（追加課金なし）</div>
      </div>
      <h2 style="margin-top: 18px;">返品・キャンセルについて</h2>
      <div class="notice notice-warning">
        デジタルコンテンツの性質上、法令上必要な場合を除き、購入確定後の返品・キャンセル・返金はできません。<br>
        不具合時は、再配信、代替提供その他当社所定の方法で対応する場合があります。
      </div>
      <label id="agreeTermsLabel" style="margin-top: 18px; display:block; border-radius:8px; padding:2px 0;">
        <input id="agreeTerms" type="checkbox" style="width:auto; margin-right:8px;">
        利用規約、特定商取引法に基づく表記、および本商品がストリーミング視聴権であることに同意の上、購入します
      </label>
      <p class="helper">
        <a href="terms.html">利用規約</a> と <a href="tokusho.html">特定商取引法に基づく表記</a> は必ずご確認ください。
      </p>
      <div class="cta-group" id="purchaseActionsGroup" aria-describedby="purchaseConsentActionHint">
        <button class="btn btn-primary" id="confirmPurchase" type="button" aria-disabled="true">PayPalで購入する</button>
        <a class="btn btn-secondary" id="bankTransferPurchase" href="contact.html?mode=bank-transfer&video=${encodeURIComponent(video.id)}&productUrl=${encodeURIComponent(`product-detail.html?video=${video.id}`)}" aria-disabled="true">銀行振込で購入する</a>
        <a class="btn btn-ghost" href="product-detail.html?video=${encodeURIComponent(video.id)}">商品詳細へ戻る</a>
      </div>
      <p id="purchaseConsentActionHint" class="notice notice-warning" style="margin-top:8px; padding:8px 10px;" hidden>購入には利用規約等への同意が必要です</p>
    </article>
  `;

  const agreeTerms = root.querySelector("#agreeTerms");
  const agreeTermsLabel = root.querySelector("#agreeTermsLabel");
  const confirmButton = root.querySelector("#confirmPurchase");
  const bankTransferLink = root.querySelector("#bankTransferPurchase");
  const actionsGroup = root.querySelector("#purchaseActionsGroup");
  const consentActionHint = root.querySelector("#purchaseConsentActionHint");
  const consentMessage = "購入には利用規約等への同意が必要です";
  const consentActionMessage = "購入には利用規約等への同意が必要です";

  let agreeHighlightTimer = null;
  const showConsentActionHint = (withGuide) => {
    if (consentActionHint) {
      consentActionHint.textContent = consentActionMessage;
      consentActionHint.dataset.touched = "1";
      consentActionHint.hidden = false;
    }
    if (!withGuide) return;
    if (agreeTermsLabel) {
      agreeTermsLabel.style.background = "#fff8e6";
      agreeTermsLabel.style.boxShadow = "0 0 0 2px #f3c969 inset";
      agreeTermsLabel.scrollIntoView({ behavior: "smooth", block: "center" });
      if (agreeHighlightTimer) window.clearTimeout(agreeHighlightTimer);
      agreeHighlightTimer = window.setTimeout(() => {
        if (!agreeTermsLabel) return;
        agreeTermsLabel.style.background = "";
        agreeTermsLabel.style.boxShadow = "";
      }, 1600);
    }
  };

  const updatePurchaseButtons = () => {
    const agreed = !!agreeTerms?.checked;
    if (confirmButton) {
      confirmButton.disabled = false;
      confirmButton.setAttribute("aria-describedby", "purchaseConsentActionHint");
      confirmButton.setAttribute("aria-disabled", agreed ? "false" : "true");
      confirmButton.title = agreed ? "" : consentMessage;
      confirmButton.style.opacity = agreed ? "" : "0.55";
      confirmButton.style.cursor = agreed ? "" : "not-allowed";
    }
    if (bankTransferLink) {
      bankTransferLink.setAttribute("aria-describedby", "purchaseConsentActionHint");
      if (agreed) {
        bankTransferLink.removeAttribute("aria-disabled");
        bankTransferLink.style.opacity = "";
        bankTransferLink.style.cursor = "";
        bankTransferLink.title = "";
      } else {
        bankTransferLink.setAttribute("aria-disabled", "true");
        bankTransferLink.style.opacity = "0.55";
        bankTransferLink.style.cursor = "not-allowed";
        bankTransferLink.title = consentMessage;
      }
    }
    if (actionsGroup) {
      actionsGroup.title = agreed ? "" : consentMessage;
    }
    if (consentActionHint) {
      if (agreed) {
        consentActionHint.hidden = true;
        consentActionHint.dataset.touched = "0";
      } else {
        consentActionHint.hidden = consentActionHint.dataset.touched !== "1";
      }
    }
  };

  agreeTerms?.addEventListener("change", () => {
    updatePurchaseButtons();
  });

  const handleBlockedPurchaseAction = (event, withGuide = false) => {
    if (agreeTerms?.checked) return false;
    event.preventDefault();
    showConsentActionHint(withGuide);
    return true;
  };

  confirmButton?.addEventListener("mouseenter", () => {
    if (!agreeTerms?.checked) showConsentActionHint(false);
  });
  confirmButton?.addEventListener("focus", () => {
    if (!agreeTerms?.checked) showConsentActionHint(false);
  });

  bankTransferLink?.addEventListener("mouseenter", () => {
    if (!agreeTerms?.checked) showConsentActionHint(false);
  });
  bankTransferLink?.addEventListener("focus", () => {
    if (!agreeTerms?.checked) showConsentActionHint(false);
  });

  bankTransferLink?.addEventListener("click", (e) => {
    if (handleBlockedPurchaseAction(e, true)) return;
  });

  bankTransferLink?.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && handleBlockedPurchaseAction(e, true)) return;
  });

  confirmButton?.addEventListener("click", (e) => {
    if (handleBlockedPurchaseAction(e, true)) return;
    const ok = window.confirm("この内容で購入手続きに進みます。よろしいですか？");
    if (!ok) return;
    window.location.href = `thankyou.html?video=${encodeURIComponent(video.id)}`;
  });

  updatePurchaseButtons();
}

function initHomeNewsSection() {
  const newsList = document.querySelector("#homeNewsList");
  if (!newsList) return;

  const publishedNews = DEMO_NEWS
    .filter((item) => item.status === "公開")
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 5);

  newsList.innerHTML = publishedNews.map((item) => `
    <li class="news-item">
      <div class="news-link">
        <time class="news-date" datetime="${item.publishedAt}">${item.publishedAt.replace(/-/g, ".")}</time>
        <span class="news-title">${item.title}</span>
      </div>
    </li>
  `).join("");
}

function initNewsArchivePage() {
  const newsList = document.querySelector("#newsArchiveList");
  if (!newsList) return;

  const publishedNews = DEMO_NEWS
    .filter((item) => item.status === "公開")
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  newsList.innerHTML = publishedNews.map((item) => `
    <li class="news-item">
      <div class="news-link">
        <time class="news-date" datetime="${item.publishedAt}">${item.publishedAt.replace(/-/g, ".")}</time>
        <span class="news-title">${item.title}</span>
      </div>
    </li>
  `).join("");
}

function initPaymentFailedPage() {
  const root = document.querySelector("#paymentFailed");
  if (!root) return;

  const url = new URL(window.location.href);
  const videoId = url.searchParams.get("video") || "v1";
  const video = DEMO_VIDEOS.find((v) => v.id === videoId) || DEMO_VIDEOS[0];

  root.innerHTML = `
    <article class="card section" style="max-width: 760px; margin-inline: auto;">
      <span class="badge">決済エラー</span>
      <h1 style="margin-top: 12px;">決済が完了しませんでした</h1>
      <p class="lead">通信状況やカード認証の都合で、購入処理が完了しなかった可能性があります。</p>
      <div class="notice notice-warning">
        対象商品: ${video.title}<br>
        価格: ${getCurrentPriceText(video)}（税込）
      </div>
      <h2 style="margin-top: 16px;">再購入・お支払い方法について</h2>
      <ul class="list">
        <li>再度クレジットカード決済をお試しいただけます。</li>
        <li>銀行振込でのお支払いをご希望の場合は、お問い合わせよりご連絡ください。</li>
      </ul>
      <div class="cta-group">
        <a class="btn btn-primary" href="purchase-confirm.html?video=${encodeURIComponent(video.id)}">再度購入する</a>
        <a class="btn btn-secondary" href="contact.html">お問い合わせする</a>
        <a class="btn btn-ghost" href="product-detail.html?video=${encodeURIComponent(video.id)}">商品詳細へ戻る</a>
      </div>
    </article>
  `;
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

function getHumanVerificationSettings() {
  try {
    const raw = localStorage.getItem(HUMAN_VERIFICATION_SETTINGS_KEY);
    if (!raw) return JSON.parse(JSON.stringify(HUMAN_VERIFICATION_DEFAULTS));
    const parsed = JSON.parse(raw);
    return {
      enabled: parsed.enabled !== false,
      provider: typeof parsed.provider === "string" ? parsed.provider : "turnstile",
      siteKey: typeof parsed.siteKey === "string" ? parsed.siteKey : HUMAN_VERIFICATION_DEFAULTS.siteKey,
      secretKey: typeof parsed.secretKey === "string" ? parsed.secretKey : HUMAN_VERIFICATION_DEFAULTS.secretKey,
      targets: {
        register: parsed?.targets?.register !== false,
        contact: parsed?.targets?.contact !== false
      }
    };
  } catch {
    return JSON.parse(JSON.stringify(HUMAN_VERIFICATION_DEFAULTS));
  }
}

function isHumanVerificationRequired(target) {
  const settings = getHumanVerificationSettings();
  return Boolean(settings.enabled && settings.targets?.[target]);
}

function checkAndTrackHumanRateLimit(target, ip = "mock-ip") {
  const rule = HUMAN_VERIFICATION_LIMITS[target];
  if (!rule) return { ok: true };

  const now = Date.now();
  const from = now - rule.windowMs;
  let store = {};
  try {
    store = JSON.parse(localStorage.getItem(HUMAN_VERIFICATION_RATE_KEY) || "{}");
  } catch {
    store = {};
  }

  const key = `${target}:${ip}`;
  const recent = Array.isArray(store[key]) ? store[key].filter((ts) => Number(ts) >= from) : [];
  if (recent.length >= rule.limit) {
    store[key] = recent;
    localStorage.setItem(HUMAN_VERIFICATION_RATE_KEY, JSON.stringify(store));
    return { ok: false, reason: "rate-limit" };
  }

  recent.push(now);
  store[key] = recent;
  localStorage.setItem(HUMAN_VERIFICATION_RATE_KEY, JSON.stringify(store));
  return { ok: true };
}

function verifyHumanChallenge(target, token, ip = "mock-ip") {
  const settings = getHumanVerificationSettings();
  if (!settings.enabled || !settings.targets?.[target]) return { ok: true };
  const adapter = HUMAN_VERIFICATION_PROVIDERS[settings.provider] || HUMAN_VERIFICATION_PROVIDERS.turnstile;
  return adapter.verifyToken({ target, token, ip, settings });
}

function setupHumanVerificationForm({ form, target, submitButtonSelector, forceSkip = false }) {
  const submitButton = form.querySelector(submitButtonSelector);
  const tokenInput = form.querySelector("input[name='cf-turnstile-response']");
  const honeypotInput = form.querySelector("input[name='website']");
  const verifyButton = form.querySelector("[data-turnstile-complete]");
  const statusEl = form.querySelector("[data-turnstile-status]");
  const isCheckbox = verifyButton?.matches("input[type='checkbox']");
  const required = !forceSkip && isHumanVerificationRequired(target);

  if (!required) {
    if (submitButton) submitButton.disabled = false;
    return {
      validate() {
        return { ok: true };
      },
      resetToken() {}
    };
  }

  if (submitButton) submitButton.disabled = true;
  if (statusEl) {
    statusEl.textContent = "未認証";
    statusEl.classList.remove("is-ok");
  }

  if (verifyButton && tokenInput) {
    if (isCheckbox) {
      verifyButton.addEventListener("change", () => {
        const checked = Boolean(verifyButton.checked);
        tokenInput.value = checked ? `mock-ts-${target}-${Date.now()}` : "";
        if (submitButton) submitButton.disabled = !checked;
        if (statusEl) {
          statusEl.textContent = checked ? "認証済み" : "未認証";
          statusEl.classList.toggle("is-ok", checked);
        }
      });
    } else {
      verifyButton.addEventListener("click", () => {
        tokenInput.value = `mock-ts-${target}-${Date.now()}`;
        if (submitButton) submitButton.disabled = false;
        if (statusEl) {
          statusEl.textContent = "認証済み";
          statusEl.classList.add("is-ok");
        }
      });
    }
  }

  return {
    validate() {
      if ((honeypotInput?.value || "").trim() !== "") {
        return { ok: false, reason: "invalid-token" };
      }
      const rateResult = checkAndTrackHumanRateLimit(target, "mock-ip");
      if (!rateResult.ok) {
        return { ok: false, reason: "rate-limit" };
      }
      const verifyResult = verifyHumanChallenge(target, tokenInput?.value || "", "mock-ip");
      if (!verifyResult.ok) {
        return { ok: false, reason: "invalid-token" };
      }
      return { ok: true };
    },
    resetToken() {
      if (tokenInput) tokenInput.value = "";
      if (isCheckbox) verifyButton.checked = false;
      if (submitButton) submitButton.disabled = true;
      if (statusEl) {
        statusEl.textContent = "未認証";
        statusEl.classList.remove("is-ok");
      }
    }
  };
}
function initRegisterPage() {
  const form = document.querySelector("#registerForm");
  if (!form) return;

  const message = document.querySelector("#registerMessage");
  const humanVerification = setupHumanVerificationForm({
    form,
    target: "register",
    submitButtonSelector: "#registerSubmit"
  });
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

    const humanResult = humanVerification.validate();
    if (!humanResult.ok) {
      if (message) {
        message.textContent = humanResult.reason === "rate-limit"
          ? "送信が多いため、しばらくしてから再試行してください"
          : "認証に失敗しました。再度お試しください";
      }
      return;
    }

    const state = getState();
    setState({ ...state, loggedIn: true, email });
    humanVerification.resetToken();

    const url = new URL(window.location.href);
    const redirect = url.searchParams.get("redirect") || "product.html";
    window.location.href = redirect;
  });
}

function initForgotPasswordPage() {
  const form = document.querySelector("#forgotPasswordForm");
  if (!form) return;
  const message = document.querySelector("#forgotMessage");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (message) {
      message.textContent = "再設定用メールを送信しました。メールをご確認ください。";
      message.className = "notice notice-info";
    }
  });
}

function initThanksPage() {
  const finalizeBtn = document.querySelector("[data-action='finalize-purchase']");
  const state = getState();
  if (!state.loggedIn) return;

  const url = new URL(window.location.href);
  const source = url.searchParams.get("source") || "purchase";
  const videoId = url.searchParams.get("video") || "v1";
  const video = DEMO_VIDEOS.find((v) => v.id === videoId) || DEMO_VIDEOS[0];
  if (source !== "bank-transfer") {
    const nextPurchases = Array.from(new Set([...state.purchases, videoId]));
    if (nextPurchases.length !== state.purchases.length) {
      setState({ ...state, purchases: nextPurchases });
    }
  }

  if (source === "bank-transfer") {
    const badge = document.querySelector(".badge");
    const heading = document.querySelector("h1");
    const lead = document.querySelector(".lead");
    const infoNotice = document.querySelector(".notice.notice-info");
    const ctaGroup = document.querySelector(".cta-group");
    const email = url.searchParams.get("email") || state.email || "demo@example.com";
    const transferName = url.searchParams.get("transferName") || "未入力";
    const transferDate = url.searchParams.get("transferDate") || "未指定";
    const transferDeadline = new Date();
    transferDeadline.setDate(transferDeadline.getDate() + 3);
    const deadlineText = `${transferDeadline.getFullYear()}/${String(transferDeadline.getMonth() + 1).padStart(2, "0")}/${String(transferDeadline.getDate()).padStart(2, "0")} 23:59`;

    if (badge) badge.textContent = "お問い合わせ送信完了";
    if (heading) heading.textContent = "銀行振込のご案内";
    if (infoNotice) {
      infoNotice.innerHTML = `銀行振込のお申し込みを受け付けました。入金確認は手動で行います。<br>確認完了後、視聴案内メールをお送りします。`;
    }
    if (lead) {
      lead.textContent = "本ページと自動返信メール（モック）に記載の振込先情報をご確認のうえ、振込期限内にお手続きください。";
    }

    if (lead) {
      lead.insertAdjacentHTML("afterend", `
        <div class="notice notice-warning">
          <strong>振込先情報</strong><br>
          銀行名: テキスト銀行 / 支店名: テキスト支店（普通）<br>
          口座番号: 1234567 / 口座名義: カ）ビデオストア<br><br>
          <strong>対象商品</strong><br>
          商品名: ${video.title}<br>
          商品ID: ${video.id}<br>
          価格: ${getCurrentPriceText(video)}（税込）<br><br>
          <strong>振込予定情報</strong><br>
          振込予定名義: ${transferName}<br>
          振込予定日: ${transferDate}<br><br>
          <strong>振込期限</strong><br>
          ${deadlineText}<br><br>
          <strong>振込名義の注意事項</strong><br>
          お振込みの際は、フォームにご入力いただいた振込予定名義をご使用ください。異なる名義でお振込みされる場合は、事前にお問い合わせください。
        </div>
        <div class="notice notice-info">
          <strong>自動返信メール（モック）</strong><br>
          宛先: ${email}<br>
          件名: 【Video-Store】銀行振込のご案内（${video.id}）<br>
          本文: 銀行名 テキスト銀行 / 支店名 テキスト支店 / 普通 1234567 / 口座名義 カ）ビデオストア<br>
          振込予定名義: ${transferName}<br>
          振込予定日: ${transferDate}<br>
          振込期限: ${deadlineText}<br>
          振込名義の注意: お振込みの際は、フォームにご入力いただいた振込予定名義をご使用ください。異なる名義でお振込みされる場合は、事前にお問い合わせください。<br>
          入金確認後、視聴開始のご案内をお送りします（手動確認のため反映までお時間をいただく場合があります）。
        </div>
      `);
    }

    if (ctaGroup) {
      ctaGroup.innerHTML = `
        <a class="btn btn-primary" href="product.html">トップへ戻る</a>
        <a class="btn btn-ghost" href="contact.html">お問い合わせ内容を確認する</a>
      `;
    }
    return;
  }

  if (!finalizeBtn) return;
  finalizeBtn.addEventListener("click", () => {
    window.location.href = "mypage.html";
  });
}

function initMyPage() {
  const list = document.querySelector("#purchasedList");
  const favoriteList = document.querySelector("#favoriteList");
  if (!list) return;

  const state = getState();
  if (!state.loggedIn) {
    window.location.href = "login.html?redirect=mypage.html";
    return;
  }

  const account = document.querySelector("#accountSummary");
  if (account) {
    account.innerHTML = `
      <div class="account-email" style="margin-top:0;">
        <span class="account-email-label">登録メールアドレス（ダミー）</span>
        <span class="account-email-value">${state.email || "demo@example.com"}</span>
      </div>
      <div class="account-actions">
        <a class="btn btn-ghost" href="change-email.html">メールアドレスを変更</a>
        <a class="btn btn-ghost" href="change-password.html">パスワードを変更</a>
      </div>
    `;
  }

  function renderSections() {
    const latestState = getState();
    const purchased = DEMO_VIDEOS.filter((v) => latestState.purchases.includes(v.id));
    const purchasedSet = new Set(latestState.purchases || []);
    const favorites = DEMO_VIDEOS.filter((v) => latestState.favorites.includes(v.id) && !purchasedSet.has(v.id));

    if (purchased.length === 0) {
      list.innerHTML = "<div class='notice notice-warning'>購入済み動画はまだありません。商品ページから購入モックを実行してください。</div>";
    } else {
      list.innerHTML = purchased.map((video) => buildPurchasedCard(video)).join("");
    }

    if (favoriteList) {
      if (favorites.length === 0) {
        favoriteList.innerHTML = "<div class='notice notice-warning'>未購入のお気に入り動画はありません。動画詳細ページから追加できます。</div>";
      } else {
        favoriteList.innerHTML = favorites
          .map((video) => buildVideoCard(video, latestState, { showFavorite: false, showPrice: false }))
          .join("");
        favoriteList.querySelectorAll("[data-action='buy-now']").forEach((btn) => {
          btn.addEventListener("click", () => {
            const videoId = btn.getAttribute("data-video-id") || "v1";
            ensureLogin(`purchase-confirm.html?video=${encodeURIComponent(videoId)}`);
          });
        });
      }
    }
  }

  renderSections();
}

function initChangeEmailPage() {
  const form = document.querySelector("#changeEmailForm");
  if (!form) return;

  const state = getState();
  if (!state.loggedIn) {
    window.location.href = "login.html?redirect=change-email.html";
    return;
  }

  const currentEmail = document.querySelector("#currentEmail");
  if (currentEmail) {
    currentEmail.value = state.email || "demo@example.com";
  }

  const message = document.querySelector("#changeEmailMessage");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const password = document.querySelector("#changeEmailPassword")?.value || "";
    const newEmail = (document.querySelector("#newEmail")?.value || "").trim();
    const nowEmail = state.email || "demo@example.com";

    if (!password) {
      if (message) {
        message.textContent = "確認のため現在のパスワードを入力してください。";
        message.className = "notice notice-warning";
      }
      return;
    }

    if (!newEmail) {
      if (message) {
        message.textContent = "新しいメールアドレスを入力してください。";
        message.className = "notice notice-warning";
      }
      return;
    }

    if (newEmail === nowEmail) {
      if (message) {
        message.textContent = "現在のメールアドレスと同じです。別のメールアドレスを入力してください。";
        message.className = "notice notice-warning";
      }
      return;
    }

    setState({ ...state, email: newEmail });
    if (currentEmail) {
      currentEmail.value = newEmail;
    }
    form.reset();
    const newEmailInput = document.querySelector("#newEmail");
    if (newEmailInput) {
      newEmailInput.value = "";
    }
    const passwordInput = document.querySelector("#changeEmailPassword");
    if (passwordInput) {
      passwordInput.value = "";
    }
    if (message) {
      message.textContent = "メールアドレスを変更しました。";
      message.className = "notice notice-info";
    }
  });
}

function initChangePasswordPage() {
  const form = document.querySelector("#changePasswordForm");
  if (!form) return;

  const state = getState();
  if (!state.loggedIn) {
    window.location.href = "login.html?redirect=change-password.html";
    return;
  }

  const message = document.querySelector("#changePasswordMessage");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const currentPassword = document.querySelector("#currentPassword")?.value || "";
    const newPassword = document.querySelector("#newPassword")?.value || "";
    const confirmPassword = document.querySelector("#confirmNewPassword")?.value || "";

    if (!currentPassword) {
      if (message) {
        message.textContent = "現在のパスワードを入力してください。";
        message.className = "notice notice-warning";
      }
      return;
    }

    if (newPassword.length < 8) {
      if (message) {
        message.textContent = "新しいパスワードは8文字以上で入力してください。";
        message.className = "notice notice-warning";
      }
      return;
    }

    if (newPassword !== confirmPassword) {
      if (message) {
        message.textContent = "新しいパスワードと確認用パスワードが一致しません。";
        message.className = "notice notice-warning";
      }
      return;
    }

    form.reset();
    if (message) {
      message.textContent = "パスワードを変更しました。";
      message.className = "notice notice-info";
    }
  });
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
      <div class='notice notice-danger'>この動画は購入後に視聴できます</div>
      <div class='cta-group'>
        <a class='btn btn-primary' href='purchase-confirm.html?video=${encodeURIComponent(videoId)}'>この動画を購入する</a>
        <a class='btn btn-secondary' href='product-detail.html?video=${encodeURIComponent(videoId)}'>商品詳細を見る</a>
        <a class='btn btn-ghost' href='product.html'>商品ページへ戻る</a>
      </div>`;
    return;
  }

  const video = DEMO_VIDEOS.find((v) => v.id === videoId) || DEMO_VIDEOS[0];
  const nextRecommendations = getNextRecommendedVideos(video, 3);
  const relatedVideos = getRelatedVideosByPriority(video, 6);
  gate.innerHTML = `
    <div class='video-player'>動画プレイヤー（ダミー）</div>
    <h2 class="watch-video-title">${video.title}</h2>
    <section class="recommendation-section watch-next-section">
      <h2>次におすすめ</h2>
      <div class="recommendation-grid recommendation-grid-next">
        ${nextRecommendations.map((item) => buildJourneyVideoCard(item)).join("")}
      </div>
    </section>
    <section class="recommendation-section">
      <h2>関連動画</h2>
      <div class="recommendation-grid">
        ${relatedVideos.map((item) => buildJourneyVideoCard(item)).join("")}
      </div>
    </section>
  `;
}

function initContactPage() {
  const form = document.querySelector("#contactForm");
  if (!form) return;
  const message = document.querySelector("#contactMessage");
  const state = getState();
  const url = new URL(window.location.href);
  const mode = url.searchParams.get("mode");
  const isBankTransferMode = mode === "bank-transfer";
  const videoId = url.searchParams.get("video");
  const video = DEMO_VIDEOS.find((v) => v.id === videoId);
  const productUrlParam = url.searchParams.get("productUrl");
  const resolvedProductUrl = productUrlParam
    ? new URL(productUrlParam, window.location.href).href
    : (video ? new URL(`product-detail.html?video=${encodeURIComponent(video.id)}`, window.location.href).href : "");

  if (isBankTransferMode && video) {
    const contactType = form.querySelector("#contactType");
    const contactName = form.querySelector("#contactName");
    const contactEmail = form.querySelector("#contactEmail");
    const contactBody = form.querySelector("#contactBody");
    const contactNameRow = contactName?.closest(".form-row");
    const contactEmailRow = contactEmail?.closest(".form-row");
    const contactBodyRow = contactBody?.closest(".form-row");
    const context = document.createElement("div");
    context.className = "notice notice-info";
    context.style.marginBottom = "12px";
    context.innerHTML = `
      銀行振込での購入申し込みとして受け付けます。<br>
      商品名: ${video.title}<br>
      商品ID: ${video.id}<br>
      価格: ${getCurrentPriceText(video)}（税込）<br>
      商品URL: ${resolvedProductUrl}<br>
      支払方法: 銀行振込<br>
      ログイン中のアカウント情報（メールアドレス）を連絡先として使用します。<br>
      入金確認後に視聴案内を行います（自動付与されません）。
    `;
    form.insertAdjacentElement("afterbegin", context);

    if (contactNameRow) contactNameRow.style.display = "none";
    if (contactEmailRow) contactEmailRow.style.display = "none";
    if (contactName) {
      contactName.required = false;
      contactName.value = "ログイン済みユーザー";
    }
    if (contactEmail) {
      contactEmail.required = false;
      contactEmail.value = state.email || "demo@example.com";
    }

    const transferNameRow = document.createElement("div");
    transferNameRow.className = "form-row";
    transferNameRow.innerHTML = `
      <label for="bankTransferName">振込予定名義（カタカナ・必須）</label>
      <input id="bankTransferName" name="bankTransferPlannedName" type="text" value="" required>
      <p class="helper">実際にお振込みに使用する口座名義をご入力ください。入金確認に使用します。必須項目です。</p>
    `;

    const transferDateRow = document.createElement("div");
    transferDateRow.className = "form-row";
    transferDateRow.innerHTML = `
      <label for="bankTransferDate">振込予定日（任意）</label>
      <input id="bankTransferDate" name="bankTransferPlannedDate" type="date">
    `;

    if (contactBodyRow) {
      contactBodyRow.insertAdjacentElement("beforebegin", transferDateRow);
      contactBodyRow.insertAdjacentElement("beforebegin", transferNameRow);
    }

    if (contactType) contactType.value = "billing";
    if (contactBody) {
      contactBody.value = `銀行振込で購入を希望します。\n商品名: ${video.title}\n商品ID: ${video.id}\n価格: ${getCurrentPriceText(video)}（税込）\n商品URL: ${resolvedProductUrl}`;
    }

    [
      { name: "productId", value: video.id },
      { name: "productTitle", value: video.title },
      { name: "productPrice", value: `${getCurrentPriceText(video)}（税込）` },
      { name: "productUrl", value: resolvedProductUrl },
      { name: "paymentMethod", value: "bank-transfer" }
    ].forEach((item) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = item.name;
      input.value = item.value;
      form.appendChild(input);
    });
  }

  const humanVerification = setupHumanVerificationForm({
    form,
    target: "contact",
    submitButtonSelector: "#contactSubmit",
    forceSkip: isBankTransferMode
  });
  const humanVerificationBlock = form.querySelector("[data-human-verification='contact']");
  if (isBankTransferMode && humanVerificationBlock) {
    humanVerificationBlock.style.display = "none";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const humanResult = humanVerification.validate();
    if (!humanResult.ok) {
      if (message) {
        message.textContent = humanResult.reason === "rate-limit"
          ? "送信が多いため、しばらくしてから再試行してください"
          : "認証に失敗しました。再度お試しください";
        message.className = "notice notice-warning";
      }
      return;
    }

    if (isBankTransferMode && video) {
      const contactEmail = form.querySelector("#contactEmail");
      const transferNameInput = form.querySelector("#bankTransferName");
      const transferDateInput = form.querySelector("#bankTransferDate");
      const email = contactEmail?.value || state.email || "demo@example.com";
      const transferName = transferNameInput?.value || "";
      const transferDate = transferDateInput?.value || "";
      window.location.href = `thankyou.html?source=bank-transfer&video=${encodeURIComponent(video.id)}&email=${encodeURIComponent(email)}&transferName=${encodeURIComponent(transferName)}&transferDate=${encodeURIComponent(transferDate)}`;
      return;
    }
    if (message) {
      message.textContent = "お問い合わせを受け付けました（モック）。通常2営業日以内に返信します。";
      message.className = "notice notice-info";
    }
    form.reset();
    humanVerification.resetToken();
  });
}

function setActiveNav() {
  let page = location.pathname.split("/").pop();
  if (page === "" || page === "index.html") {
    page = "product.html";
  }
  if (page === "product-detail.html") {
    page = "product.html";
  }
  if (page === "purchase-confirm.html") {
    page = "product.html";
  }
  if (page === "thankyou.html") {
    page = "product.html";
  }
  if (page === "forgot-password.html") {
    page = "login.html";
  }
  if (page === "change-email.html" || page === "change-password.html") {
    page = "mypage.html";
  }
  document.querySelectorAll(".nav-link[data-page]").forEach((el) => {
    if (el.getAttribute("data-page") === page) {
      el.classList.add("is-active");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderHeaderNav();
  initMobileMenu();
  setStatusText();
  initHomeNewsSection();
  initNewsArchivePage();
  bindCommonActions();
  setActiveNav();
  initProductPage();
  initAboutSlider();
  initVideosPage();
  initCastListPage();
  initGenreListPage();
  initProductDetailPage();
  initPurchaseConfirmPage();
  initLoginPage();
  initRegisterPage();
  initForgotPasswordPage();
  initChangeEmailPage();
  initChangePasswordPage();
  initThanksPage();
  initMyPage();
  initWatchPage();
  initContactPage();
  initPaymentFailedPage();
});


