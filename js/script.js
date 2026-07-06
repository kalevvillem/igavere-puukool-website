const CART_KEY = "igavere-cart-v2";

let cart = [];
let catalogItems = [];

document.addEventListener("DOMContentLoaded", async () => {
  try {
    document.querySelectorAll("use[href]").forEach((node) => {
      const href = node.getAttribute("href");
      if (href) {
        node.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", href);
      }
    });

    setActiveNav();
    loadCart();
    updateCartView();

    if (document.getElementById("offers-grid")) {
      await renderOffers("offers-grid", false);
    }

    if (document.getElementById("featured-offers-grid")) {
      await renderOffers("featured-offers-grid", true);
    }

    if (document.getElementById("catalog-table-body")) {
      await renderCatalog();
    }
  } catch (error) {
    console.error("Lehe initsialiseerimine ebaõnnestus:", error);
  }

  setupNavigationEnhancements();
  setupBackToTop();
  setupFormResetOnBackNavigation();

  const searchInput = document.getElementById("catalog-search");
  if (searchInput) {
    searchInput.addEventListener("input", filterCatalog);
  }

  const rfqForm = document.getElementById("rfq-form");
  if (rfqForm) {
    rfqForm.addEventListener("submit", populateRfqMessageBeforeSubmit);
  }
});

function setActiveNav() {
  const page = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a").forEach((a) => {
    if (a.getAttribute("href") === page) a.classList.add("active");
  });
}

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
}

function imageOrFallback(path) {
  return path ? safeImage(path) : "images/hero-nursery.jpg";
}

function euro(value) {
  return `${Number(value).toFixed(2)} €`;
}

function safeImage(path) {
  return encodeURI(path);
}

function normalizeText(text) {
  return (text || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function unique(values) {
  return [...new Set(values)];
}

function isPreferredOfferPhoto(path) {
  const file = (path || "").toLowerCase();
  if (!file) return false;
  if (file.includes("closeup") || file.includes("-main")) return true;
  if (/(\d{2,4}-\d{2,4}|20-40|30-40|40-60|60-80|80-100|100-120|125-150|180-200|c2)/.test(file)) {
    return false;
  }
  if (file.includes("img_") || file.includes("grupipilt") || file.includes("seina") || file.includes("ois")) {
    return false;
  }
  return true;
}

function getOfferGallery(offer) {
  const allImages = unique(
    (offer.sizes || [])
      .flatMap((size) => size.images || [])
      .filter(Boolean)
  );
  const preferred = allImages.filter(isPreferredOfferPhoto);
  return preferred.length ? preferred : allImages;
}

/* Cart */
function loadCart() {
  const raw = localStorage.getItem(CART_KEY);
  cart = raw ? JSON.parse(raw) : [];
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function cartItemLabel(item) {
  return `${item.name}${item.size ? ` (${item.size})` : ""}`;
}

function addToCart(item) {
  const existing = cart.find((row) => row.id === item.id);
  if (existing) {
    existing.qty += item.qty;
  } else {
    cart.push({ ...item });
  }
  saveCart();
  updateCartView();
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  saveCart();
  updateCartView();
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartView();
}

function updateCartView() {
  const floating = document.getElementById("cart-floating");
  if (!floating) return;

  const itemsWrap = document.getElementById("cart-items");
  const totalWrap = document.getElementById("cart-total");
  const qtyBadge = document.getElementById("cart-count");
  const emptyText = document.getElementById("cart-empty-text");
  const rfqArea = document.getElementById("rfq-cart-preview");

  const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  if (qtyBadge) qtyBadge.textContent = String(totalQty);
  if (totalQty === 0) {
    floating.classList.remove("active");
    if (itemsWrap) itemsWrap.innerHTML = "";
    if (totalWrap) totalWrap.innerHTML = "";
    if (emptyText) emptyText.style.display = "block";
    if (rfqArea) rfqArea.textContent = "Ostukorv on tühi.";
    return;
  }

  floating.classList.add("active");
  if (emptyText) emptyText.style.display = "none";

  if (itemsWrap) {
    itemsWrap.innerHTML = cart
      .map(
        (item) => `
      <div class="cart-item">
        <div class="cart-item-row">
          <span>${cartItemLabel(item)}</span>
          <button class="btn btn-light btn-small" type="button" onclick="removeFromCart('${item.id}')">Eemalda</button>
        </div>
        <div class="cart-item-row">
          <span>${item.qty} tk × ${euro(item.price)}</span>
          <strong>${euro(item.qty * item.price)}</strong>
        </div>
      </div>
    `
      )
      .join("");
  }

  if (totalWrap) {
    totalWrap.innerHTML = `<span>Kokku</span><span>${euro(totalPrice)}</span>`;
  }

  if (rfqArea) {
    rfqArea.textContent = cart
      .map((item) => `${cartItemLabel(item)} — ${item.qty} tk × ${euro(item.price)}`)
      .join("\n");
  }
}

function closeCart() {
  const floating = document.getElementById("cart-floating");
  if (floating) floating.classList.remove("active");
}

function scrollToRfq() {
  const rfq = document.getElementById("rfq");
  if (!rfq) return;
  rfq.scrollIntoView({ behavior: "smooth", block: "start" });
}

function populateRfqMessageBeforeSubmit() {
  const field = document.getElementById("rfq-message");
  if (!field) return;
  const userMessage = field.value.trim();
  const lines = cart.map(
    (item) =>
      `${cartItemLabel(item)} — ${item.qty} tk × ${euro(item.price)} = ${euro(item.qty * item.price)}`
  );
  const total = cart.reduce((acc, item) => acc + item.qty * item.price, 0);
  const cartSummary = `${lines.join("\n")}\n\nKokku: ${euro(total)}`;
  field.value = userMessage
    ? `${userMessage}\n\n---\nValitud taimed:\n${cartSummary}`
    : `Valitud taimed:\n${cartSummary}`;
}

function setupNavigationEnhancements() {
  const navWrap = document.querySelector(".nav-wrap");
  const nav = document.querySelector(".main-nav");
  if (!navWrap || !nav) return;

  if (!nav.id) nav.id = "site-main-nav";

  let toggle = navWrap.querySelector(".mobile-menu-toggle");
  if (!toggle) {
    toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "mobile-menu-toggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", nav.id);
    toggle.setAttribute("aria-label", "Ava menüü");
    toggle.innerHTML = '<span class="burger-line"></span><span class="burger-line"></span><span class="burger-line"></span><span>Menüü</span>';
    navWrap.insertBefore(toggle, nav);
  }

  function closeMenu() {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  }

  toggle.addEventListener("click", () => {
    const willOpen = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", willOpen);
    toggle.setAttribute("aria-expanded", String(willOpen));
    document.body.classList.toggle("menu-open", willOpen);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMenu();
  });
}

function setupBackToTop() {
  let button = document.querySelector(".back-to-top");
  if (!button) {
    button = document.createElement("button");
    button.type = "button";
    button.className = "back-to-top";
    button.setAttribute("aria-label", "Tagasi üles");
    button.textContent = "↑ Üles";
    document.body.appendChild(button);
  }

  const toggleVisibility = () => {
    button.classList.toggle("visible", window.scrollY > 380);
  };

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", toggleVisibility, { passive: true });
  toggleVisibility();
}

function setupFormResetOnBackNavigation() {
  window.addEventListener("pageshow", (event) => {
    const navEntries = performance.getEntriesByType
      ? performance.getEntriesByType("navigation")
      : [];
    const isBackNavigation =
      event.persisted || (navEntries[0] && navEntries[0].type === "back_forward");

    if (!isBackNavigation) return;
    document.querySelectorAll("form").forEach((form) => form.reset());
    updateCartView();
  });
}

/* Offers */
async function renderOffers(targetId, featuredOnly) {
  const wrap = document.getElementById(targetId);
  if (!wrap) return;

  let data;
  try {
    data = await loadJson("data/offers.json");
  } catch (error) {
    wrap.innerHTML = `<p class="note-box">Eripakkumiste laadimine ebaõnnestus. Palun värskenda lehte.</p>`;
    return;
  }
  const list = featuredOnly ? data.offers.slice(0, 3) : data.offers;

  wrap.innerHTML = list
    .map((offer) => {
      const size = offer.sizes[0];
      const gallery = getOfferGallery(offer);
      return `
      <article class="offer-card" data-offer-id="${offer.id}">
        <div class="offer-image-wrap">
          <img class="offer-image" src="${imageOrFallback(gallery[0] || size.images[0])}" alt="${offer.name}" loading="lazy" decoding="async">
        </div>
        <div class="offer-thumbs"></div>
        <div class="offer-body">
          <h3 class="offer-name">${offer.name}</h3>
          <p class="offer-latin">${offer.latin}</p>
          <p class="offer-meta">${offer.description}</p>
          <label for="size-${offer.id}">Suurus</label>
          <select id="size-${offer.id}" class="select"></select>
          <div class="price-row">
            <span class="price-regular"></span>
            <span class="price-sale"></span>
          </div>
          <p class="volume-note"></p>
          <div class="btn-row">
            <input class="qty-input" type="number" min="1" value="1" aria-label="Kogus">
            <button class="btn btn-primary btn-small" type="button">Lisa korvi</button>
          </div>
        </div>
      </article>
    `;
    })
    .join("");

  list.forEach((offer) => bindOfferCard(offer));
}

function bindOfferCard(offer) {
  const card = document.querySelector(`[data-offer-id="${offer.id}"]`);
  if (!card) return;

  const select = card.querySelector("select");
  const mainImage = card.querySelector(".offer-image");
  const thumbsWrap = card.querySelector(".offer-thumbs");
  const priceRegular = card.querySelector(".price-regular");
  const priceSale = card.querySelector(".price-sale");
  const volumeNote = card.querySelector(".volume-note");
  const qtyInput = card.querySelector(".qty-input");
  const addBtn = card.querySelector("button.btn-primary");
  const gallery = getOfferGallery(offer);

  select.innerHTML = offer.sizes
    .map(
      (size, idx) =>
        `<option value="${idx}">${size.label} — ${euro(size.offer_price)}</option>`
    )
    .join("");

  function renderSize(index) {
    const selected = offer.sizes[index];
    priceRegular.textContent = euro(selected.regular_price);
    priceSale.textContent = euro(selected.offer_price);
    volumeNote.textContent = selected.volume_prices
      ? `Kogusehinnad: ${selected.volume_prices}`
      : "Kogusepõhine hind täpsustub hinnapäringuga.";

    mainImage.src = imageOrFallback(gallery[0] || selected.images[0]);
    mainImage.alt = `${offer.name} ${selected.label}`;

    thumbsWrap.innerHTML = gallery
      .map(
        (img, i) => `
      <button class="offer-thumb ${i === 0 ? "active" : ""}" type="button" data-img="${imageOrFallback(img)}" aria-label="Pildi valik ${i + 1}">
        <img src="${imageOrFallback(img)}" alt="${offer.name} vaade ${i + 1}" loading="lazy" decoding="async">
      </button>`
      )
      .join("");

    thumbsWrap.querySelectorAll(".offer-thumb").forEach((button) => {
      button.addEventListener("click", () => {
        thumbsWrap.querySelectorAll(".offer-thumb").forEach((b) => b.classList.remove("active"));
        button.classList.add("active");
        mainImage.src = button.dataset.img;
      });
    });

    addBtn.onclick = () => {
      const qty = Math.max(1, Number(qtyInput.value || 1));
      addToCart({
        id: `offer-${offer.id}-${index}`,
        name: offer.name,
        size: selected.label,
        price: Number(selected.offer_price),
        qty
      });
    };
  }

  select.addEventListener("change", () => renderSize(Number(select.value)));
  renderSize(0);
}

/* Catalog */
async function renderCatalog() {
  try {
    const data = await loadJson("data/catalog.json");
    catalogItems = data.items;
    drawCatalogRows(catalogItems);
  } catch (error) {
    const body = document.getElementById("catalog-table-body");
    if (body) {
      body.innerHTML = `<tr><td colspan="9">Hinnakirja laadimine ebaõnnestus. Palun värskenda lehte.</td></tr>`;
    }
  }
}

function drawCatalogRows(items) {
  const body = document.getElementById("catalog-table-body");
  if (!body) return;

  body.innerHTML = items
    .map(
      (item) => `
    <tr>
      <td><strong>${item.name}</strong></td>
      <td><em>${item.latin || "-"}</em></td>
      <td>${item.type || "-"}</td>
      <td>${item.height || "-"}</td>
      <td>${item.trunk || "-"}</td>
      <td>${item.package || "-"}</td>
      <td>${item.spec || "-"}</td>
      <td class="catalog-price">${euro(item.price)}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-primary btn-small" type="button" onclick="addCatalogItem('${item.id}')">Lisa</button>
        </div>
      </td>
    </tr>
  `
    )
    .join("");
}

function filterCatalog() {
  const searchInput = document.getElementById("catalog-search");
  const query = normalizeText(searchInput ? searchInput.value : "");
  if (!query) {
    drawCatalogRows(catalogItems);
    return;
  }

  const filtered = catalogItems.filter((item) => {
    const hay = normalizeText(
      `${item.name} ${item.latin} ${item.type} ${item.height} ${item.trunk} ${item.package} ${item.spec}`
    );
    return hay.includes(query);
  });
  drawCatalogRows(filtered);
}

function addCatalogItem(id) {
  const item = catalogItems.find((row) => row.id === id);
  if (!item) return;
  const size = [item.height, item.trunk, item.package].filter(Boolean).join(" / ");
  addToCart({
    id: `catalog-${id}`,
    name: item.name,
    size: size || "-",
    price: Number(item.price),
    qty: 1
  });
}
