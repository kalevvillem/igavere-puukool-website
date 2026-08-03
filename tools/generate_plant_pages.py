#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import shutil
import unicodedata
from collections import OrderedDict
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
PLANTS_PATH = ROOT / "data" / "plants.json"
PLANT_DIR = ROOT / "taimed"
SITEMAP_PATH = ROOT / "sitemap.xml"
IMAGE_DIR = ROOT / "images" / "plants"
LASTMOD = "2026-07-30"

PHYSOCARPUS_COPY = [
    "Lodjap-põisenelas - lihtne, ilus ja lopsakas. Kasvab päikselises aianurgas äärmiselt kiiresti ning täidab heki, peenra või aiavaasi juba esimesel aastal. Sobib ideaalselt hekiks nii pügatult kui vabakujuliselt, toob elu ja taimeilu peenrasse või kaunistab aeda mitmekesi kokku istutatult mõnes ilusas dekoratiivpotis.",
    "Olenevalt sordist kasvavad põisenelad kuni 3m kõrgeks ja 2m laiaks, õitsevad suve alguses ning jätavad hooaja lõpuni kaunid viljakesed ehk põied - sealt ka nimi põisenelas.",
    "Põisenela sorte on kümneid ning värvivariatsioone on tohutult - rohelised, sügavpunased, kollased, tulioranžid. Seetõttu on need väga hinnatud taimed nii üksiku värviaktsendina kui ka üldise roheruumi loojana ning aitavad lihtsalt ilusate taimede kogumiku siduda kokku õdusaks koduaiaks.",
]

PHYSOCARPUS_COLOR_BY_SLUG = {
    "physocarpus-opulifolius": "Roheline",
    "physocarpus-opulifolius-red-baron": "Sügavpunane",
    "physocarpus-opulifolius-amber-jubilee": "Kollane, tulioranž ja punakas",
    "physocarpus-opulifolius-dart-s-gold": "Kuldkollane",
}


def uniq(values: list[str]) -> list[str]:
    cleaned = [v.strip() for v in values if isinstance(v, str) and v.strip()]
    return list(OrderedDict.fromkeys(cleaned))


def display_value(values: list[str]) -> str:
    picked = uniq(values)
    return " / ".join(picked) if picked else "Täpsustamisel"


def safe_slug(raw: str) -> str:
    allowed = "abcdefghijklmnopqrstuvwxyz0123456789-"
    lower = (raw or "").strip().lower().replace(" ", "-").replace("_", "-")
    lower = "".join(ch if ch in allowed else "-" for ch in lower)
    while "--" in lower:
        lower = lower.replace("--", "-")
    return lower.strip("-") or "taim"


def norm_text(value: str) -> str:
    text = unicodedata.normalize("NFKD", value or "")
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.lower().replace("'", " ").replace('"', " ")
    cleaned = []
    for ch in text:
        if ch.isalnum() or ch in {" ", "-"}:
            cleaned.append(ch)
        else:
            cleaned.append(" ")
    return " ".join("".join(cleaned).split())


def asset_url(path: str) -> str:
    return quote(path, safe="/-_.~")


def term_tokens(term: str) -> list[str]:
    return [token for token in norm_text(term).split() if len(token) >= 3]


def extract_sort_name(latin_name: str) -> str:
    if "'" not in latin_name:
        return ""
    parts = latin_name.split("'")
    return parts[1].strip() if len(parts) >= 2 else ""


def resolve_images(name: str, latin: str, slug: str, preferred: str = "") -> tuple[str, list[str]]:
    default_image = "images/hero-nursery.jpg"
    files = sorted(IMAGE_DIR.glob("*"))
    if not files:
        return default_image, [default_image]

    preferred_path = (ROOT / preferred) if preferred else None
    preferred_rel = preferred if preferred_path and preferred_path.exists() else ""

    sort_name = extract_sort_name(latin)
    latin_tokens = term_tokens(latin)
    est_tokens = term_tokens(name)
    slug_tokens = [token for token in slug.split("-") if len(token) >= 4]
    sort_tokens = term_tokens(sort_name)

    scored: list[tuple[int, str]] = []
    for image in files:
        rel = f"images/plants/{image.name}"
        fname = norm_text(image.name)
        score = 0

        if preferred_rel and rel == preferred_rel:
            score += 150
        elif sort_tokens and not any(token in fname for token in sort_tokens):
            # If a cultivar is known, avoid pulling images from sibling cultivars.
            continue
        if any(token in fname for token in sort_tokens):
            score += 40
        if any(token in fname for token in est_tokens):
            score += 20
        if latin_tokens and latin_tokens[0] in fname:
            score += 15
        if any(token in fname for token in slug_tokens):
            score += 10
        if "offer" in fname:
            score += 5
        if "main" in fname:
            score += 8
        if "closeup" in fname:
            score += 2

        if score > 0:
            scored.append((score, rel))

    if not scored:
        if preferred_rel:
            return preferred_rel, [preferred_rel]
        return default_image, [default_image]

    scored.sort(key=lambda row: (-row[0], row[1]))
    unique_images = []
    seen = set()
    for _, rel in scored:
        if rel in seen:
            continue
        seen.add(rel)
        unique_images.append(rel)
        if len(unique_images) >= 6:
            break

    main_image = unique_images[0]
    return main_image, unique_images


def page_head(title: str, description: str, canonical: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="et">
<head>
  <meta charset="UTF-8">
  <base href="/">
  <link rel="icon" href="favicon.ico" type="image/x-icon">
  <link rel="preconnect" href="https://www.googletagmanager.com">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17300261388"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){{dataLayer.push(arguments);}}
    gtag('js', new Date());
    gtag('config', 'AW-17300261388');
  </script>
  <meta name="description" content="{html.escape(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="{html.escape(canonical)}">
  <meta property="og:locale" content="et_EE">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Igavere Puukool">
  <meta property="og:title" content="{html.escape(title)}">
  <meta property="og:description" content="{html.escape(description)}">
  <meta property="og:url" content="{html.escape(canonical)}">
  <meta property="og:image" content="https://igaverepuukool.ee/images/hero-nursery.jpg">
  <meta property="og:image:alt" content="Igavere Puukool taimed">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{html.escape(title)}">
  <meta name="twitter:description" content="{html.escape(description)}">
  <meta name="twitter:image" content="https://igaverepuukool.ee/images/hero-nursery.jpg">
  <title>{html.escape(title)}</title>
  <link rel="stylesheet" href="css/style.css?v=20260730b">
  <!-- Meta Pixel Code -->
  <script>
  !function(f,b,e,v,n,t,s)
  {{if(f.fbq)return;n=f.fbq=function(){{n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)}};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '1380229537407409');
  fbq('track', 'PageView');
  </script>
  <noscript><img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=1380229537407409&ev=PageView&noscript=1"
  /></noscript>
  <!-- End Meta Pixel Code -->
</head>
<body>
  <header class="site-header">
    <div class="container nav-wrap">
      <a href="./" class="brand">
        <img src="images/logo-ruut.png" alt="Igavere Puukool logo">
        <span class="brand-text">
          <span class="brand-title">Igavere Puukool</span>
          <span class="brand-subtitle">30 aastat kogemust roheruumi rajamises</span>
        </span>
      </a>
      <nav class="main-nav" aria-label="Põhinavigatsioon">
        <a href="./">Kodu</a>
        <a href="meist/">Meist</a>
        <a href="pakkumised/">Eripakkumised</a>
        <a href="taimed/">Taimed</a>
        <a href="hinnakiri/">Hinnakiri</a>
        <a href="kontakt/">Kontakt</a>
      </nav>
    </div>
  </header>
"""


def page_footer() -> str:
    return """  <div id="cart-floating" class="cart-floating" aria-live="polite">
    <div class="cart-header">
      <strong><svg class="icon"><use href="images/icons.svg#icon-cart"></use></svg> Ostukorv (<span id="cart-count">0</span>)</strong>
      <button class="cart-close" type="button" onclick="closeCart()">×</button>
    </div>
    <p id="cart-empty-text" style="padding:0.8rem 1rem;">Ostukorv on tühi.</p>
    <div id="cart-items" class="cart-items"></div>
    <div id="cart-total" class="cart-total"></div>
    <div class="cart-actions">
      <a href="hinnakiri/#rfq" class="btn btn-primary btn-small">Saada hinnapäring</a>
      <button type="button" class="btn btn-light btn-small" onclick="clearCart()">Tühjenda korv</button>
    </div>
  </div>

  <footer>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <img src="images/logo-ruut.png" alt="Igavere Puukool logo" class="footer-logo-badge">
          <h3 class="footer-title">Igavere Puukool</h3>
          <p>Laiasöödi talu, Igavere küla<br>Raasiku vald, Harjumaa, 75208, Eesti</p>
        </div>
        <div class="footer-col">
          <h3 class="footer-title">Kontakt</h3>
          <p>Puukool: <a href="tel:+3725060115">+372 5060115</a></p>
          <p>Üldkontakt: <a href="tel:+37258306665">+372 58306665</a></p>
          <p><a href="mailto:taimed@igaverepuukool.ee">taimed@igaverepuukool.ee</a></p>
        </div>
        <div class="footer-col">
          <h3 class="footer-title">Lahtiolekuajad</h3>
          <p><strong>Suvised lahtiolekuajad</strong><br>T-N: 10:00-18:00<br>R: 10:00-20:00<br>L: 10:00-17:00<br>P-E: KOKKULEPPEL<br>Kehtiv kuni - 30.08.2026</p>
        </div>
        <div class="footer-col">
          <h3 class="footer-title">Jälgi meid</h3>
          <div class="social-links">
            <a class="social-link fb" href="https://facebook.com/igaverepuukool/" target="_blank" rel="noopener" aria-label="Facebook">
              <svg class="icon"><use href="images/icons.svg#icon-facebook"></use></svg>
            </a>
            <a class="social-link ig" href="https://instagram.com/igaverepuukool" target="_blank" rel="noopener" aria-label="Instagram">
              <svg class="icon"><use href="images/icons.svg#icon-instagram"></use></svg>
            </a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">© 2026 Igavere Puukool. Kõik õigused reserveeritud.</div>
    </div>
  </footer>

  <script src="js/script.js?v=20260730b" defer></script>
</body>
</html>
"""


def cluster_plants(items: list[dict]) -> list[dict]:
    grouped: OrderedDict[str, dict] = OrderedDict()
    for plant in items:
        key = (plant.get("scientific_name") or plant.get("id") or "").strip()
        if not key:
            continue
        if key not in grouped:
            grouped[key] = {
                "name": (plant.get("estonian_name") or "Taim").strip(),
                "latin": (plant.get("scientific_name") or "").strip(),
                "category": (plant.get("category") or "").strip(),
                "image": (plant.get("image") or "").strip(),
                "sizes": [],
                "size_prices": [],
                "height": [],
                "width": [],
                "soil": [],
                "sun": [],
                "ids": [],
                "source_images": [],
            }
        row = grouped[key]
        row["ids"].append((plant.get("id") or "").strip())
        row["sizes"].append((plant.get("size") or "").strip())
        row["size_prices"].append({
            "id": (plant.get("id") or "").strip(),
            "size": (plant.get("size") or "").strip(),
            "base_price": float(plant.get("base_price") or 0),
            "on_sale": bool(plant.get("on_sale", False)),
            "sale_price": plant.get("sale_price"),
        })
        specs = plant.get("specs") or {}
        row["height"].append((specs.get("height") or "").strip())
        row["width"].append((specs.get("width") or "").strip())
        row["soil"].append((specs.get("soil") or "").strip())
        row["sun"].append((specs.get("sun") or "").strip())
        if not row["image"] and plant.get("image"):
            row["image"] = plant.get("image")
        if plant.get("image"):
            row["source_images"].append((plant.get("image") or "").strip())

    result: list[dict] = []
    used_slugs: set[str] = set()
    for _, row in grouped.items():
        source_slug = row["latin"] or (row["ids"][0] if row["ids"] and row["ids"][0] else row["name"])
        slug = safe_slug(source_slug)
        if slug in used_slugs:
            suffix = 2
            while f"{slug}-{suffix}" in used_slugs:
                suffix += 1
            slug = f"{slug}-{suffix}"
        used_slugs.add(slug)

        row["slug"] = slug
        row["sizes"] = uniq(row["sizes"])
        row["height_value"] = display_value(row["height"])
        row["width_value"] = display_value(row["width"])
        row["soil_value"] = display_value(row["soil"])
        row["sun_value"] = display_value(row["sun"])
        preferred = row["image"] or (row["source_images"][0] if row["source_images"] else "")
        main_image, gallery_images = resolve_images(row["name"], row["latin"], slug, preferred)
        row["image"] = main_image
        row["gallery_images"] = gallery_images
        result.append(row)
    return result


def render_listing(plants: list[dict]) -> str:
    cards = []
    for plant in plants:
        name = html.escape(plant["name"])
        latin = html.escape(plant["latin"] or "-")
        category = html.escape((plant["category"] or "taim").capitalize())
        height = html.escape(plant["height_value"])
        width = html.escape(plant["width_value"])
        soil = html.escape(plant["soil_value"])
        sun = html.escape(plant["sun_value"])
        image = html.escape(asset_url(plant["image"]))
        href = f"taimed/{plant['slug']}/"
        size_prices = plant.get("size_prices") or []
        active_prices = [sp for sp in size_prices if sp["base_price"] > 0]
        min_price = min((sp["base_price"] for sp in active_prices), default=0)
        multi_size = len(size_prices) > 1
        default_sp = min(active_prices, key=lambda x: x["base_price"]) if active_prices else {}

        if multi_size:
            price_label = f"alates {int(min_price)}€" if min_price else "Hind täpsustamisel"
            pid = html.escape(default_sp.get("id", ""))
            sz = html.escape(default_sp.get("size", ""))
            price_val = default_sp.get("base_price", 0)
            cart_section = f"""
              <div class="plant-card-footer">
                <span class="plant-card-price">{price_label}</span>
                <div class="plant-card-cart-row">
                  <input type="number" class="qty-input plant-qty" value="1" min="1" max="999" aria-label="Kogus">
                  <button type="button" class="btn btn-primary btn-small plant-add-btn"
                          data-plant-id="{pid}"
                          data-plant-name="{name}"
                          data-plant-size="{sz}"
                          data-plant-price="{int(price_val)}">Lisa korvi</button>
                </div>
                <a class="plant-card-size-link" href="{href}">Vali suurus →</a>
              </div>"""
        else:
            sp = size_prices[0] if size_prices else {}
            price = sp.get("base_price", 0)
            price_label = f"{int(price)}€" if price else "Hind täpsustamisel"
            pid = html.escape(sp.get("id", ""))
            sz = html.escape(sp.get("size", ""))
            cart_section = f"""
              <div class="plant-card-footer">
                <span class="plant-card-price">{price_label}</span>
                <div class="plant-card-cart-row">
                  <input type="number" class="qty-input plant-qty" value="1" min="1" max="999" aria-label="Kogus">
                  <button type="button" class="btn btn-primary btn-small plant-add-btn"
                          data-plant-id="{pid}"
                          data-plant-name="{name}"
                          data-plant-size="{sz}"
                          data-plant-price="{int(price)}">Lisa korvi</button>
                </div>
              </div>"""

        cards.append(
            f"""
          <article class="plant-card">
            <a class="plant-card-link" href="{href}">
              <div class="plant-card-media">
                <img src="{image}" alt="{name}" loading="lazy" decoding="async">
              </div>
              <div class="plant-card-header">
                <h3>{name}</h3>
                <p class="plant-latin">{latin}</p>
                <p class="plant-category">{category}</p>
              </div>
              <div class="plant-spec-grid">
                <div class="plant-spec"><svg class="icon"><use href="images/icons.svg#icon-height"></use></svg><span>{height}</span></div>
                <div class="plant-spec"><svg class="icon"><use href="images/icons.svg#icon-width"></use></svg><span>{width}</span></div>
                <div class="plant-spec"><svg class="icon"><use href="images/icons.svg#icon-soil"></use></svg><span>{soil}</span></div>
                <div class="plant-spec"><svg class="icon"><use href="images/icons.svg#icon-sun"></use></svg><span>{sun}</span></div>
              </div>
            </a>{cart_section}
          </article>
"""
        )

    return f"""
  <main>
    <section class="hero">
      <div class="container hero-inner">
        <h1>Taimede detaililehed</h1>
        <p>Faktid taime kaupa: kasvukõrgus, laius, pinnas ja päikselisus.</p>
      </div>
    </section>

    <section class="section-soft">
      <div class="container">
        <h2 class="section-title">Valik taimedest</h2>
        <p class="section-intro">Sisu täieneb järk-järgult. Kõik lehed on andmepõhised ja lühiformaadis.</p>
        <div class="plant-grid">
          {''.join(cards)}
        </div>
      </div>
    </section>
  </main>
"""


def render_detail(plant: dict) -> str:
    name = html.escape(plant["name"])
    latin = html.escape(plant["latin"] or "-")
    category = html.escape((plant["category"] or "taim").capitalize())
    height = html.escape(plant["height_value"])
    width = html.escape(plant["width_value"])
    soil = html.escape(plant["soil_value"])
    sun = html.escape(plant["sun_value"])
    image = html.escape(asset_url(plant["image"] or "images/hero-nursery.jpg"))
    gallery = plant.get("gallery_images") or []
    size_prices = plant.get("size_prices") or []
    active_prices = [sp for sp in size_prices if sp["base_price"] > 0]
    is_physocarpus = (plant["latin"] or "").lower().startswith("physocarpus opulifolius")
    color_value = html.escape(PHYSOCARPUS_COLOR_BY_SLUG.get(plant["slug"], "Roheline"))

    physocarpus_block = ""
    if is_physocarpus:
        copy_html = "".join(f"<p>{html.escape(par)}</p>" for par in PHYSOCARPUS_COPY)
        physocarpus_block = f"""
            <div class="plant-copy-block">
              <p class="plant-color-row"><strong>Lehevärvus:</strong> {color_value}</p>
              {copy_html}
            </div>
"""

    gallery_html = ""
    if len(gallery) > 1:
        thumbs = "".join(
            f'<img src="{html.escape(asset_url(img))}" alt="{name} pilt {i + 1}" loading="lazy" decoding="async">'
            for i, img in enumerate(gallery[:6])
        )
        gallery_html = f"""
            <div class="plant-detail-gallery">
              {thumbs}
            </div>
"""

    # Build order box
    if len(active_prices) > 1:
        options = "".join(
            f'<option value="{html.escape(sp["id"])}" data-price="{int(sp["base_price"])}">'
            f'{html.escape(sp["size"])} — {int(sp["base_price"])}€</option>'
            for sp in active_prices
        )
        default_price = int(active_prices[0]["base_price"])
        default_id = html.escape(active_prices[0]["id"])
        default_size = html.escape(active_prices[0]["size"])
        order_box = f"""
            <div class="plant-order-box">
              <div class="plant-order-size">
                <label for="plant-size-select">Suurus:</label>
                <select id="plant-size-select" class="plant-size-select">
                  {options}
                </select>
              </div>
              <div class="plant-order-price-row">
                <span>Hind:</span>
                <strong class="plant-current-price">{default_price}€</strong>
              </div>
              <div class="plant-order-cart-row">
                <input type="number" class="qty-input plant-qty" value="1" min="1" max="999" aria-label="Kogus">
                <button type="button" class="btn btn-primary plant-detail-add-btn"
                        data-plant-name="{name}">Lisa korvi</button>
              </div>
            </div>"""
    elif active_prices:
        sp = active_prices[0]
        price = int(sp["base_price"])
        pid = html.escape(sp["id"])
        sz = html.escape(sp["size"])
        order_box = f"""
            <div class="plant-order-box">
              <div class="plant-order-price-row">
                <span>Hind:</span>
                <strong class="plant-current-price">{price}€</strong>
              </div>
              <div class="plant-order-cart-row">
                <input type="number" class="qty-input plant-qty" value="1" min="1" max="999" aria-label="Kogus">
                <button type="button" class="btn btn-primary plant-detail-add-btn"
                        data-plant-name="{name}"
                        data-plant-id="{pid}"
                        data-plant-size="{sz}"
                        data-plant-price="{price}">Lisa korvi</button>
              </div>
            </div>"""
    else:
        order_box = ""

    return f"""
  <main>
    <section class="hero">
      <div class="container hero-inner">
        <h1>{name}</h1>
        <p>{latin}</p>
      </div>
    </section>

    <section class="section-soft">
      <div class="container plant-detail-wrap">
        <a class="plant-back-link" href="taimed/">← Tagasi taimede valikusse</a>
        <div class="plant-detail-grid">
          <div class="plant-detail-image">
            <img src="{image}" alt="{name}">
{gallery_html}
          </div>
          <article class="plant-detail-card">
            <p class="plant-category">{category}</p>
            <h2 class="section-title">{name}</h2>
            <p class="plant-latin">{latin}</p>
            <div class="plant-spec-grid plant-spec-grid-detail">
              <div class="plant-spec"><svg class="icon"><use href="images/icons.svg#icon-height"></use></svg><span><strong>Kõrgus:</strong> {height}</span></div>
              <div class="plant-spec"><svg class="icon"><use href="images/icons.svg#icon-width"></use></svg><span><strong>Laius:</strong> {width}</span></div>
              <div class="plant-spec"><svg class="icon"><use href="images/icons.svg#icon-soil"></use></svg><span><strong>Pinnas:</strong> {soil}</span></div>
              <div class="plant-spec"><svg class="icon"><use href="images/icons.svg#icon-sun"></use></svg><span><strong>Päike/vari:</strong> {sun}</span></div>
            </div>
{physocarpus_block}{order_box}
            <div class="btn-row">
              <a href="kontakt/#kontaktivorm" class="btn btn-secondary">Küsi pakkumist</a>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
"""


def write_file(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def update_sitemap(plant_slugs: list[str]) -> None:
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        "  <url>",
        "    <loc>https://igaverepuukool.ee/</loc>",
        f"    <lastmod>{LASTMOD}</lastmod>",
        "    <changefreq>weekly</changefreq>",
        "    <priority>1.0</priority>",
        "  </url>",
        "  <url>",
        "    <loc>https://igaverepuukool.ee/meist/</loc>",
        f"    <lastmod>{LASTMOD}</lastmod>",
        "    <changefreq>monthly</changefreq>",
        "    <priority>0.9</priority>",
        "  </url>",
        "  <url>",
        "    <loc>https://igaverepuukool.ee/pakkumised/</loc>",
        f"    <lastmod>{LASTMOD}</lastmod>",
        "    <changefreq>weekly</changefreq>",
        "    <priority>0.9</priority>",
        "  </url>",
        "  <url>",
        "    <loc>https://igaverepuukool.ee/taimed/</loc>",
        f"    <lastmod>{LASTMOD}</lastmod>",
        "    <changefreq>weekly</changefreq>",
        "    <priority>0.9</priority>",
        "  </url>",
        "  <url>",
        "    <loc>https://igaverepuukool.ee/hinnakiri/</loc>",
        f"    <lastmod>{LASTMOD}</lastmod>",
        "    <changefreq>weekly</changefreq>",
        "    <priority>0.9</priority>",
        "  </url>",
        "  <url>",
        "    <loc>https://igaverepuukool.ee/kontakt/</loc>",
        f"    <lastmod>{LASTMOD}</lastmod>",
        "    <changefreq>monthly</changefreq>",
        "    <priority>0.8</priority>",
        "  </url>",
    ]
    for slug in plant_slugs:
        lines.extend(
            [
                "  <url>",
                f"    <loc>https://igaverepuukool.ee/taimed/{slug}/</loc>",
                f"    <lastmod>{LASTMOD}</lastmod>",
                "    <changefreq>monthly</changefreq>",
                "    <priority>0.7</priority>",
                "  </url>",
            ]
        )
    lines.append("</urlset>")
    SITEMAP_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    payload = json.loads(PLANTS_PATH.read_text(encoding="utf-8"))
    plants = cluster_plants(payload.get("plants", []))

    if PLANT_DIR.exists():
        for child in PLANT_DIR.iterdir():
            if child.is_dir():
                shutil.rmtree(child)

    listing_title = "Taimede detaililehed – Igavere Puukool"
    listing_desc = "Igavere Puukooli taimelehed: kasvukõrgus, laius, pinnas ja päikselisus."
    listing_url = "https://igaverepuukool.ee/taimed/"
    listing_html = page_head(listing_title, listing_desc, listing_url) + render_listing(plants) + page_footer()
    write_file(PLANT_DIR / "index.html", listing_html)

    for plant in plants:
        title = f"{plant['name']} – Igavere Puukool"
        desc = f"{plant['name']} ({plant['latin']}) faktileht: kõrgus, laius, pinnas ja päikselisus."
        url = f"https://igaverepuukool.ee/taimed/{plant['slug']}/"
        detail_html = page_head(title, desc, url) + render_detail(plant) + page_footer()
        write_file(PLANT_DIR / plant["slug"] / "index.html", detail_html)

    update_sitemap([plant["slug"] for plant in plants])
    print(f"Loodud taimede lehed: {len(plants)}")
    print("Uuendatud: taimed/index.html")
    print("Uuendatud: sitemap.xml")


if __name__ == "__main__":
    main()
