const STORAGE_KEY = "videoStoreMockState";

const LONG_DETAIL_TEXT = "テキストテキスト。テキストテキストテキストテキスト、テキストテキストテキストテキスト。テキストテキスト、テキストテキストテキストテキストテキストテキスト。テキストテキストテキストテキスト、テキストテキスト。テキストテキストテキストテキスト、テキストテキストテキストテキストテキストテキスト。";
const GENRES = ["ジャンル名A", "ジャンル名B", "ジャンル名C", "ジャンル名D", "ジャンル名E"];
const CASTS = ["出演者A", "出演者B", "出演者C", "出演者D", "出演者E", "出演者F", "出演者G", "出演者H"];

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
        <p class="card-price-current">${getCurrentPriceText(video)}</p>
        <p class="price-subnote">税込 / 買い切り</p>
      </div>
    `;
  }
  const regularText = formatYen(parsePriceToNumber(video.basePrice || video.price));
  return `
    <div class="sale-price-block price-stack">
      <p class="card-price-regular">通常 ${regularText}</p>
      <p class="card-price-arrow">↓</p>
      <p class="card-price-sale">${getCurrentPriceText(video)}</p>
      <p class="price-subnote">税込 / 買い切り</p>
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
        <p class="helper purchased-meta">出演者: ${buildCastLink(video.cast)}</p>
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

function getRandomRelatedVideos(excludeId, count = 5) {
  const pool = DEMO_VIDEOS.filter((v) => v.id !== excludeId);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
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
  const homePagedList = document.querySelector("#homePagedList");
  const heroPrimaryAction = document.querySelector("#heroPrimaryAction");
  const heroMainVisual = document.querySelector("#heroMainVisual");
  const heroMainVisualImage = document.querySelector("#heroMainVisualImage");
  if (!homeList && !homePagedList && !heroPrimaryAction) return;
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

  const keywordInput = document.querySelector("#searchKeyword");
  const genreSelect = document.querySelector("#filterGenre");
  const castSelect = document.querySelector("#filterCast");
  const priceSelect = document.querySelector("#filterPrice");
  const saleOnlyCheckbox = document.querySelector("#filterSaleOnly");
  const sortSelect = document.querySelector("#sortOrder");
  const applyFiltersBtn = document.querySelector("#applyFiltersBtn");
  const resetFiltersBtn = document.querySelector("#resetFiltersBtn");
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
      if (resultCount) resultCount.textContent = `0 / ${DEMO_VIDEOS.length} 件`;
      return;
    }

    catalog.innerHTML = items.map((video) => buildVideoCard(video, state, { showFavorite: false })).join("");

    if (resultCount) resultCount.textContent = `${items.length} / ${DEMO_VIDEOS.length} 件`;
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

    renderCatalog(filtered);
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
  const isLoggedIn = Boolean(state.loggedIn);
  const isPurchased = isLoggedIn && state.purchases.includes(video.id);
  const favoriteSet = new Set(state.favorites || []);
  const related = getRandomRelatedVideos(video.id, 5);

  root.innerHTML = `
    <article class="card section">
      <h1 style="margin-top: 0;">${video.title}</h1>
      <div class="detail-top-grid">
        <div class="detail-media">
          <h2 style="margin: 0 0 10px;">無料サンプル動画</h2>
          <div class="video-player">サンプル動画プレイヤー（ダミー）</div>
        </div>
        <aside class="detail-summary">
          <div class="badge-row">
            ${buildGenreLink(video.genre)}
            ${(video.tags || []).map((tag) => `<span class="mini-badge">${tag}</span>`).join("")}
            ${isSaleVideo(video) ? buildSaleLink() : ""}
            ${isPurchased ? `<span class="mini-badge mini-badge-owned">購入済み</span>` : ""}
          </div>
          <div class="detail-price-block">
            <p class="helper" style="margin:0 0 6px;">価格</p>
            ${buildCardPriceBlock(video)}
          </div>
          <div class="cta-group detail-cta">
            <div class="detail-cta-main">${buildCardPrimaryAction(video.id, isLoggedIn, isPurchased)}</div>
            ${buildFavoriteButton(video.id, favoriteSet.has(video.id))}
          </div>
          <p class="helper" style="margin-top: 8px;"><a href="product.html">商品一覧へ戻る</a></p>
          <h2 style="margin-top: 16px;">動画情報</h2>
          <div class="detail-inline-meta">
            <div class="detail-info-item"><span class="meta-key">再生時間</span><span>${video.duration}</span></div>
            <div class="detail-info-item"><span class="meta-key">出演者</span><span>${buildCastLink(video.cast)}</span></div>
            <div class="detail-info-item"><span class="meta-key">配信形式</span><span>買い切り</span></div>
          </div>
        </aside>
      </div>

      <h2 style="margin-top: 18px;">動画の説明文</h2>
      <div class="notice notice-info" style="margin-top: 10px;">${video.detailDescription || "テキストテキスト"}</div>
      <h2 style="margin-top: 18px;">収録内容</h2>
      <div class="notice notice-info">収録時間: ${video.duration}</div>
      <h2 style="margin-top: 18px;">視聴方法</h2>
      <div class="notice notice-info">購入後、マイページからブラウザで視聴できます。</div>
      <h2 style="margin-top: 18px;">注意事項</h2>
      <div class="notice notice-info">
        ・本商品は買い切り型のデジタル動画です。<br>
        ・権利保護のため、録画・転載・再配布は禁止されています。<br>
        ・通信環境によって再生品質が変動する場合があります。
      </div>
      <div class="detail-bottom-cta">
        ${buildCardPrimaryAction(video.id, isLoggedIn, isPurchased)}
      </div>
    </article>
    <section class="card section">
      <h2>この動画を見た人はこちらも見ています</h2>
      <div class="related-grid">
        ${related.map((item) => `
          <article class="related-card">
            <div class="thumb-placeholder">サムネイル</div>
            <h3 class="related-title">${item.title}</h3>
            <p class="helper related-price">${isSaleVideo(item) ? `期間限定 ${getCurrentPriceText(item)} 税込 / 買い切り` : `${getCurrentPriceText(item)} 税込 / 買い切り`}</p>
            <a class="btn btn-ghost" href="product-detail.html?video=${encodeURIComponent(item.id)}">詳細を見る</a>
          </article>
        `).join("")}
      </div>
    </section>
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
      <h1 style="margin-top: 12px;">購入内容の確認</h1>
      <p class="lead">この画面は確認画面です。下記の内容を確認のうえ、購入を確定してください。</p>
      <div class="meta-grid purchase-meta-grid">
        <div class="meta-key">商品名</div><div>${video.title}</div>
        <div class="meta-key">ジャンル</div><div>${video.genre}</div>
        <div class="meta-key">出演者</div><div>${video.cast}</div>
        <div class="meta-key">再生時間</div><div>${video.duration}</div>
        <div class="meta-key">お支払い総額</div><div>${getCurrentPriceText(video)} 税込 / 買い切り</div>
        <div class="meta-key">支払方法</div><div>PayPal</div>
        <div class="meta-key">販売形式</div><div>買い切り（追加課金なし）</div>
      </div>
      <h2 style="margin-top: 18px;">返品・キャンセルについて</h2>
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
        <button class="btn btn-primary" id="confirmPurchase" disabled>PayPalで購入する</button>
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
        価格: ${getCurrentPriceText(video)} 税込 / 買い切り
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

function initForgotPasswordPage() {
  const form = document.querySelector("#forgotPasswordForm");
  if (!form) return;
  const message = document.querySelector("#forgotMessage");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (message) {
      message.textContent = "再設定用メールを送信しました（モック）。メールをご確認ください。";
      message.className = "notice notice-info";
    }
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

  function renderSections() {
    const latestState = getState();
    const purchased = DEMO_VIDEOS.filter((v) => latestState.purchases.includes(v.id));
    const favorites = DEMO_VIDEOS.filter((v) => latestState.favorites.includes(v.id));

    if (purchased.length === 0) {
      list.innerHTML = "<div class='notice notice-warning'>購入済み動画はまだありません。商品ページから購入モックを実行してください。</div>";
    } else {
      list.innerHTML = purchased.map((video) => buildPurchasedCard(video)).join("");
    }

    if (favoriteList) {
      if (favorites.length === 0) {
        favoriteList.innerHTML = "<div class='notice notice-warning'>お気に入り動画はまだありません。動画詳細ページから追加できます。</div>";
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
  gate.innerHTML = `
    <div class='video-player'>動画プレイヤー（ダミー）</div>
    <h2 style='margin-top: 14px;'>${video.title}</h2>
    <p class='lead' style='margin: 0;'>${video.description}</p>`;
}

function initContactPage() {
  const form = document.querySelector("#contactForm");
  if (!form) return;
  const message = document.querySelector("#contactMessage");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (message) {
      message.textContent = "お問い合わせを受け付けました（モック）。通常2営業日以内に返信します。";
      message.className = "notice notice-info";
    }
    form.reset();
  });
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
  if (page === "forgot-password.html") {
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
  initMobileMenu();
  setStatusText();
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
  initThanksPage();
  initMyPage();
  initWatchPage();
  initContactPage();
  initPaymentFailedPage();
});
