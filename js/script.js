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

    if (document.getElementById("catalog-sections")) {
      await renderCatalog();
    }
  } catch (error) {
    console.error("Lehe initsialiseerimine ebaõnnestus:", error);
  }

  setupNavigationEnhancements();
  setupBackToTop();
  setupFormResetOnBackNavigation();
  setupImageLightbox();

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
  const version = "20260706h";
  const separator = path.includes("?") ? "&" : "?";
  const response = await fetch(`${path}${separator}v=${version}`);
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

function openPrintablePdf(event, url) {
  if (event) event.preventDefault();
  const printWindow = window.open(url, "_blank");
  if (!printWindow) {
    window.location.href = url;
    return false;
  }

  const triggerPrint = () => {
    try {
      printWindow.focus();
      printWindow.print();
    } catch (error) {
      // If auto-print is blocked, user can still print from the opened PDF tab.
    }
  };

  if (printWindow.addEventListener) {
    printWindow.addEventListener("load", () => setTimeout(triggerPrint, 250), { once: true });
  } else {
    setTimeout(triggerPrint, 1200);
  }
  return false;
}

function openPrintCatalog(event) {
  return openPrintablePdf(event, "Igavere Puukool_Hinnakiri_Suvi 2026_Prinditav.pdf");
}

function openPrintOffers(event) {
  return openPrintablePdf(event, "Igavere Puukool_Eripakkumised_Suvi 2026_Prinditav.pdf");
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
  if (!raw) {
    cart = [];
    return;
  }
  try {
    cart = JSON.parse(raw);
    if (!Array.isArray(cart)) throw new Error("invalid cart shape");
  } catch (error) {
    cart = [];
    localStorage.removeItem(CART_KEY);
  }
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
  const totalPrice = cart.reduce((acc, item) => acc + (item.quoteOnly ? 0 : item.price * item.qty), 0);
  const quoteOnlyCount = cart.reduce((acc, item) => acc + (item.quoteOnly ? item.qty : 0), 0);

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
          <span>${item.quoteOnly ? `${item.qty} tk × Küsi pakkumist` : `${item.qty} tk × ${euro(item.price)}`}</span>
          <strong>${item.quoteOnly ? "Küsi pakkumist" : euro(item.qty * item.price)}</strong>
        </div>
      </div>
    `
      )
      .join("");
  }

  if (totalWrap) {
    totalWrap.innerHTML = `<span>Kokku</span><span>${euro(totalPrice)}${quoteOnlyCount ? ` + ${quoteOnlyCount} tk küsipakkumisega` : ""}</span>`;
  }

  if (rfqArea) {
    rfqArea.textContent = cart
      .map((item) =>
        item.quoteOnly
          ? `${cartItemLabel(item)} — ${item.qty} tk × Küsi pakkumist`
          : `${cartItemLabel(item)} — ${item.qty} tk × ${euro(item.price)}`
      )
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
      item.quoteOnly
        ? `${cartItemLabel(item)} — ${item.qty} tk × Küsi pakkumist`
        : `${cartItemLabel(item)} — ${item.qty} tk × ${euro(item.price)} = ${euro(item.qty * item.price)}`
  );
  const total = cart.reduce((acc, item) => acc + (item.quoteOnly ? 0 : item.qty * item.price), 0);
  const quoteOnlyCount = cart.reduce((acc, item) => acc + (item.quoteOnly ? item.qty : 0), 0);
  const cartSummary = `${lines.join("\n")}\n\nKokku: ${euro(total)}${quoteOnlyCount ? ` + ${quoteOnlyCount} tk küsipakkumisega` : ""}`;
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
      const wideClass = offer.id === "hortensiad-koik-sordid" ? " offer-card-wide" : "";
      const stripHtml =
        offer.id === "hortensiad-koik-sordid"
          ? `<div class="offer-image-strip">${gallery
              .slice(0, 3)
              .map(
                (img, i) =>
                  `<img src="${imageOrFallback(img)}" alt="${offer.name} vaade ${i + 1}" loading="lazy" decoding="async">`
              )
              .join("")}</div>`
          : "";
      return `
      <article class="offer-card${wideClass}" data-offer-id="${offer.id}">
        <div class="offer-image-wrap">
          <img class="offer-image" src="${imageOrFallback(gallery[0] || size.images[0])}" alt="${offer.name}" loading="lazy" decoding="async">
          ${stripHtml}
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
    drawCatalogRows(catalogItems, false);
  } catch (error) {
    const sections = document.getElementById("catalog-sections");
    if (sections) {
      sections.innerHTML = `<p class="note-box">Hinnakirja laadimine ebaõnnestus. Palun värskenda lehte.</p>`;
    }
  }
}

function drawCatalogRows(items, openAll) {
  const sections = document.getElementById("catalog-sections");
  if (!sections) return;

  if (!items.length) {
    sections.innerHTML = `<p class="note-box">Sobivaid taimi ei leitud.</p>`;
    return;
  }

  const typeOrder = ["Lehtpuu", "Okaspuu", "Põõsas", "Püsik", "Ronitaim"];
  const groups = items.reduce((acc, item) => {
    const key = item.type || "Muu";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const orderedTypes = Object.keys(groups).sort((a, b) => {
    const ai = typeOrder.indexOf(a);
    const bi = typeOrder.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b, "et");
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const typeLabels = {
    Lehtpuu: "Lehtpuud",
    Okaspuu: "Okaspuud",
    "Põõsas": "Põõsad",
    Püsik: "Püsikud",
    Ronitaim: "Ronitaimed",
    Muu: "Muud"
  };

  sections.innerHTML = orderedTypes
    .map((type) => {
      const rows = groups[type];
      const label = typeLabels[type] || `${type}d`;
      const rowsHtml = rows
        .map(
          (item) => {
            const numericPrice = Number(item.price);
            const hasNumericPrice = Number.isFinite(numericPrice);
            const priceLabel = hasNumericPrice ? euro(numericPrice) : "Küsi pakkumist";
            const actionLabel = hasNumericPrice ? "Lisa" : "Lisa päringusse";
            return `
            <tr>
              <td><strong>${item.name}</strong></td>
              <td><em>${item.latin || "-"}</em></td>
              <td>${item.height || "-"}</td>
              <td>${item.trunk || "-"}</td>
              <td>${item.package || "-"}</td>
              <td>${item.spec || "-"}</td>
              <td class="catalog-price">${priceLabel}</td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-primary btn-small" type="button" onclick="addCatalogItem('${item.id}')">${actionLabel}</button>
                </div>
              </td>
            </tr>
          `;
          }
        )
        .join("");

      return `
        <details class="catalog-section" ${openAll ? "open" : ""}>
          <summary>${label}</summary>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Müüginimi</th>
                  <th>Ladinakeelne nimi</th>
                  <th>Kõrgus</th>
                  <th>Tüve ümbermõõt</th>
                  <th>Pakend</th>
                  <th>Lisainfo</th>
                  <th>Hind</th>
                  <th>Korv</th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </div>
        </details>
      `;
    })
    .join("");
}

function filterCatalog() {
  const searchInput = document.getElementById("catalog-search");
  const query = normalizeText(searchInput ? searchInput.value : "");
  if (!query) {
    drawCatalogRows(catalogItems, false);
    return;
  }

  const filtered = catalogItems.filter((item) => {
    const hay = normalizeText(
      `${item.name} ${item.latin} ${item.type} ${item.height} ${item.trunk} ${item.package} ${item.spec}`
    );
    return hay.includes(query);
  });
  drawCatalogRows(filtered, true);
}

function addCatalogItem(id) {
  const item = catalogItems.find((row) => row.id === id);
  if (!item) return;
  const size = [item.height, item.trunk, item.package].filter(Boolean).join(" / ");
  const numericPrice = Number(item.price);
  const hasNumericPrice = Number.isFinite(numericPrice);
  addToCart({
    id: `catalog-${id}`,
    name: item.name,
    size: size || "-",
    price: hasNumericPrice ? numericPrice : 0,
    qty: 1,
    quoteOnly: !hasNumericPrice
  });
}

function setupImageLightbox() {
  let lightbox = document.getElementById("image-lightbox");
  if (!lightbox) {
    lightbox = document.createElement("div");
    lightbox.id = "image-lightbox";
    lightbox.className = "image-lightbox";
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.innerHTML = `
      <button type="button" class="image-lightbox-close" aria-label="Sulge foto">×</button>
      <img class="image-lightbox-img" src="" alt="">
    `;
    document.body.appendChild(lightbox);
  }

  const image = lightbox.querySelector(".image-lightbox-img");
  const closeBtn = lightbox.querySelector(".image-lightbox-close");

  const close = () => {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    image.src = "";
    image.alt = "";
  };

  const open = (src, altText) => {
    if (!src) return;
    image.src = src;
    image.alt = altText || "Täissuuruses foto";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
  };

  document.addEventListener("click", (event) => {
    const offerMainWrap = event.target.closest(".offer-image-wrap");
    if (offerMainWrap) {
      const mainImg = offerMainWrap.querySelector("img");
      if (mainImg) {
        open(mainImg.currentSrc || mainImg.src, mainImg.alt);
        return;
      }
    }

    const imgTarget = event.target.closest(".offer-thumb img, .gallery-grid img, .before-after-pair img");
    const stripTarget = event.target.closest(".offer-image-strip img");
    if (stripTarget) {
      open(stripTarget.currentSrc || stripTarget.src, stripTarget.alt);
      return;
    }
    if (imgTarget) {
      open(imgTarget.currentSrc || imgTarget.src, imgTarget.alt);
    }
  });

  closeBtn.addEventListener("click", close);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("open")) close();
  });
}
