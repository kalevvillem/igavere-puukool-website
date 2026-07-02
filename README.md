# Igavere Puukool - Veebisait

Professionaalne veebisait Igavere Puukool OÜ-le - haljastuse ja taimekasvatuse ettevõttele.

## 📁 Failide Struktuur

```
igavere-puukool-website/
├── index.html                 ← Avaleht
├── meist.html                 ← Meist - ettevõtte ajalugu
├── pakkumised.html            ← Praegused pakkumised
├── hinnapakkumine.html        ← Taimed & Hinnad (ostukorv!)
├── taimed.html                ← Taimed (alternatiiv)
├── kontakt.html               ← Kontakt & Vormi
├── css/
│   └── style.css              ← Kogu stiil, värvid, disain
├── js/
│   └── script.js              ← Ostukorv, filtrid, funktsioonid
├── images/
│   ├── logo.png               ← Teie logo
│   ├── nursery.jpg            ← Puukool pilt
│   └── plants/                ← Taimete fotod
├── data/
│   └── plants.json            ← Taimed + hinnad (andmebaas)
└── README.md                  ← See fail
```

## 🎨 Värvid & Kujundus

**Peamised värvid (teie logost):**
- Roheline (#5DB83C) - Peamine värv
- Tume roheline (#2D5C1F) - Teised elemendid
- Violett (#3D2B6E) - Aktsendid
- Oranž (#E74C1F) - Pakkumised

**Disain:** Puhas, professionaalne, mobiiliga sobiv (responsive)

## 🚀 Kuidas Hakkata

### SAMM 1: Localiga Testimine

```bash
# Avage terminal/käsurida oma repo kaustas
cd ~/igavere-puukool-website

# Käivitage lihtne server
python3 -m http.server 8000

# Avage brauseris
# http://localhost:8000
```

### SAMM 2: GitHub'i Lülitamine Sisse

Kui kõik on OK, suruge GitHub'i:

```bash
git add .
git commit -m "Initial website - all pages and cart system"
git push
```

### SAMM 3: GitHub Pages Lubamine

1. Minge GitHub'i repo lehele
2. Settings → Pages
3. Valige "Deploy from Branch" 
4. Valige `main` branch
5. Salvestage
6. Oodake ~2 minutit

**Teie leht elab aadressil:**
```
https://kalevvillem.github.io/igavere-puukool-website/
```

## 📝 Kuidas Redigeerida

### Taimed & Hinnad Muutmine

**Fail:** `data/plants.json`

Struktuuri näide:
```json
{
  "id": "red-baron-1",
  "estonian_name": "Lodjap-Põisenelas",
  "scientific_name": "Physocarpus opulifolius 'Red Baron'",
  "category": "põõsas",
  "size": "100-120cm",
  "image": "images/plants/red-baron.jpg",
  "base_price": 22,
  "pricing": {
    "1-10": 12,
    "11-50": 10,
    "51+": 8
  },
  "on_sale": false,
  "sale_price": null,
  "description": "Punakate lehtedega põisenelas, ilus sügisel."
}
```

**Kategooriad:**
- `põõsas` - Põõsad (karvad, enelad jne)
- `lehtpuu` - Lehtpuud
- `okaspuu` - Okaspuud
- `püsilill` - Püsililled

### Pakkumiste Muutmine

**Fail:** `pakkumised.html`

Otsige `<!-- Offer 1: -->` ja muutke kaarte.

### Kontakti Teabe Muutmine

**Fail:** Kõikides HTML failides `<footer>` osas

### Uute Taimete Lisamine

1. Lisage taim `data/plants.json` põhisesse
2. Lisage pilt `images/plants/` kausta
3. Salvestage ja suruge GitHub'i

## 🛒 Ostukorv

**Kuidas see töötab:**

1. Kasutaja valib taimeid ja klõpsab "Lisa korvi"
2. Ostukorv kuvatakse paremal parempoolsel nurgal
3. Kasutaja klõpsab "Saada RFQ"
4. Kuvatakse vormi, ostukorvi sisu on juba täidetud
5. Kasutaja täidab nimi/email/telefon
6. Klõpsab "Saada"
7. Email saadetakse `taimed@igaverepuukool.ee` (Formspree teenuse kaudu)

**Seadistamine:**

Vormi tegevus kasutab Formspree (tasuta teenus). Selleks et see töötaks:

1. Minge https://formspree.io/
2. Registreeruge oma e-mailil
3. Looge uus vorm
4. Kopeerige vorm ID (näiteks `f/xyzjklmn`)
5. Asendage kõigis `.html` failides `action="https://formspree.io/f/xyzjklmn"`

## 🔗 Lingid & URL-id

Kõik URL-id on eesti keeles:
- `/index.html` - Kodu
- `/meist.html` - Meist
- `/pakkumised.html` - Pakkumised
- `/hinnapakkumine.html` - Taimed & Hinnad
- `/kontakt.html` - Kontakt

## 📸 Fotode Lisamine

1. Salvestage fotod `images/plants/` kausta
2. Nimetage neid selgelt (nt `red-baron.jpg`, `grefsheim-1.jpg`)
3. Muutke `data/plants.json` failides `image` polaarset

**Pilt Vorming:**
- JPG/JPEG on hea
- HEIC tuleb teisendada JPG-iks (Mac Photos app saab seda teha)
- Suurused: ~500x500px on piisav

## 🎯 Järgmised Sammud (Hiljem)

1. **Logo:** Lisage oma logo `images/logo.png` failiks
2. **Fotod:** Asendage kõik taimete fotod
3. **Nursery pilt:** Lisage `images/nursery.jpg` otsiköttele
4. **Meist lehel:** Täitke meeskonna bioloogiad
5. **Hydrangea lehekülg:** Looge erileht hüdrangeadele (kopeerige `hinnapakkumine.html` ja käsitsege)
6. **SEO:** Lisage Google Analytics, Facebook Pixel
7. **SSL:** GitHub Pages teeb automaatselt HTTPS-iga

## ⚙️ Tehniline Tugi

- **GitHub Issues:** Probleemide jälgimine
- **CSS Muudatused:** Muutke `css/style.css`
- **JavaScript:** Muutke `js/script.js` (ostukorv, filtrid)
- **Taimete Andmebaas:** Muutke `data/plants.json`

## 📞 Kontakt Teave (Otse Koodis)

Muutke kõigis failides:
- Telefonid: +372 5060115 ja +372 58306665
- Email: taimed@igaverepuukool.ee
- Aadress: Igavere küla, Laiasöödi talu, Raasiku vald
- Aukioloajad: T-R 10:00-18:00, L 10:00-15:00

## 🔒 Privaatsus

Sellel saidil ei koguta personaalset teavet, välja arvatud kontaktvormi kaudu. Kõik andmed saadetakse Formspree'i kaudu teie e-mailile.

## 📜 Litsents

Disain ja kood on tehtud Igavere Puukool OÜ jaoks. Kasutamine teiste eesmärkidega nõuab luba.

---

**Loodud:** Juuni 2026  
**Viimati uuendatud:** Juuni 2026
