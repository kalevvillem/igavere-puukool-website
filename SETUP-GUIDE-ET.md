# Igavere Puukool - Veebisaidi Paigaldamise Juhend

**Für:** kalevvillem  
**Kuupäev:** Juuni 2026  
**Keel:** Eesti

---

## 📖 SISUKORD

1. Failide Kopeerimise Juhend
2. Formspree E-mail Setup
3. Logo & Fotode Lisamine
4. GitHub'i Surumise Juhend
5. Probleemilahendamine

---

## 1️⃣ FAILIDE KOPEERIMISE JUHEND

### Kuidas Failid Kopeerida Teie Repo Kausta

**Teile luuakse 5 faili:**

```
index.html              ← Avaleht
meist.html              ← Meist 
pakkumised.html         ← Pakkumised
hinnapakkumine.html     ← Taimed & Hinnad (KÕIGE TÄHTSAM)
kontakt.html            ← Kontakt
```

**3 Järjekorras:**

```
css/style.css           ← Stiil (värvid, disain)
js/script.js            ← Funktsioonid (ostukorv)
data/plants.json        ← Taimed ja hinnad
```

**README.md ja see fail**

### Kopeerimise Sammud:

1. **Avage oma repo kaust Terminal/Command Prompt'is**
   ```
   cd ~/igavere-puukool-website
   ```

2. **Kopeerige kõik .html failid** otse selle kausta

3. **Looge kaustad:**
   ```
   mkdir -p css js data images
   ```

4. **Kopeerige CSS fail:**
   ```
   Kopeerige style.css → css/ kausta
   ```

5. **Kopeerige JS fail:**
   ```
   Kopeerige script.js → js/ kausta
   ```

6. **Kopeerige andmebaas:**
   ```
   Kopeerige plants.json → data/ kausta
   ```

7. **Kontrollige struktuuri:**
   ```
   igavere-puukool-website/
   ├── index.html
   ├── meist.html
   ├── pakkumised.html
   ├── hinnapakkumine.html
   ├── kontakt.html
   ├── css/style.css
   ├── js/script.js
   ├── data/plants.json
   ├── images/  (looge see kaust)
   └── README.md
   ```

---

## 2️⃣ FORMSPREE E-MAIL SETUP

**Mis on Formspree?**  
Tasuta teenus, mis saadab vormis sisestatud andmed otse teie e-mailile.

### Seadistamine:

1. **Minge veebilehele:** https://formspree.io/

2. **Klõpsake "Sign Up"** (registreeru)

3. **Sisestage e-mail ja salasõna:**
   ```
   E-mail: taimed@igaverepuukool.ee (või oma pealemail)
   Salasõna: [looge tugevad]
   ```

4. **Klõpsake "Confirm Email"** saabunud e-mailil

5. **Looge uus vorm:**
   - Klõpsake "+ Create"
   - "New Form" → "Create"

6. **Kopeerige Vorm ID:**
   - Näeb välja selline: `f/xyzjklmn`

7. **Asendage Kõigis HTML Failides:**
   - Otsige: `action="https://formspree.io/f/xyzjklmn"`
   - Asendage oma vorm ID-ga

**Failid, mida redigeerida:**
- `kontakt.html` (kontaktivorm)
- `hinnapakkumine.html` (RFQ vorm)

---

## 3️⃣ LOGO & FOTODE LISAMINE

### Logo:

1. Salvestage oma logo failina `logo.png`
2. Kopeerige `images/` kausta
3. Valmis! HTML failid loevad automaatselt

### Taimete Fotod:

1. **Looge kaustad:**
   ```
   images/plants/  (kõik taimete fotod)
   ```

2. **Nimetage fotod selgelt:**
   ```
   red-baron.jpg
   grefsheim.jpg
   amber-jubilee.jpg
   darts-gold.jpg
   jne...
   ```

3. **Teisendage HEIC → JPG:**
   - **Mac:** Foto app → parem klõps → Ekspordi
   - **Windows:** Online konverteerija (CloudConvert, Zamzar)
   - **Online:** https://heic2jpg.com/

4. **Muutke `data/plants.json`:**
   ```json
   {
     "id": "red-baron-1",
     "image": "images/plants/red-baron.jpg",  ← Siin
     ...
   }
   ```

### Puukool Pilt (Avaleht):

Kui teil on peamiselt puukool pilt:
1. Salvestage `images/nursery.jpg`
2. Muutke `index.html` (hero sektsioon, kui soovite)

---

## 4️⃣ GITHUB'I SURUMISE JUHEND

### Lokaal Test (Enne Surumist):

```bash
# Terminalis oma repo kaustas
cd ~/igavere-puukool-website

# Python 3 kaudu lihtne server
python3 -m http.server 8000

# Avage brauseris
# http://localhost:8000
```

### GitHub'i Surumise Sammud:

```bash
# 1. Lisage kõik failid
git add .

# 2. Kommenteerige muudatusi
git commit -m "Initial website build - all pages, cart system, and plant database"

# 3. Suruge GitHub'i
git push
```

### GitHub Pages Aktiveerimise Sammud:

1. **Minge GitHub'i repo lehele:**
   ```
   https://github.com/kalevvillem/igavere-puukool-website
   ```

2. **Klõpsake "Settings"** (otsast paremal)

3. **Vasakul menüüs klõpsake "Pages"**

4. **Valige:**
   - Deploy from: Branch
   - Branch: main
   - Folder: / (root)

5. **Klõpsake "Save"**

6. **Oodake 2-3 minutit**

7. **Teie sait elab aadressil:**
   ```
   https://kalevvillem.github.io/igavere-puukool-website/
   ```

---

## 5️⃣ TAIMED & HINNAD MUUTMINE

### Uue TAIME LISAMINE

**Fail:** `data/plants.json`

Kopeerige eksisteeriv taim ja muutke:

```json
{
  "id": "uue-taime-id",
  "estonian_name": "Eesti Nimi",
  "scientific_name": "Teaduslik Nimi",
  "category": "põõsas",  // põõsas, lehtpuu, okaspuu, püsilill
  "size": "80-100cm",
  "image": "images/plants/photo.jpg",
  "base_price": 25,
  "pricing": {
    "1-10": 15,
    "11-50": 12,
    "51+": 10
  },
  "on_sale": false,
  "sale_price": null,
  "description": "Lühikirjeldus taimes"
}
```

Seejärel:
```bash
git add data/plants.json
git commit -m "Add new plant: [Plant Name]"
git push
```

### PAKKUMISTE MUUTMINE

**Fail:** `pakkumised.html`

Otsige taimeid ja muutke hindu enne `<!-- Offer 1: -->` kommentaari.

---

## 6️⃣ VEIDI HILJEM: HYDRANGEA LEHT

### Erileht Hüdrangeadele

Kopeerige `hinnapakkumine.html` → `hüdrangead.html`

Muutke pealkiri ja filtrid ainult hüdrangeadele.

Lisa navigatsioon:
```html
<a href="hüdrangead.html">Hüdrangead</a>
```

---

## ⚠️ PROBLEEMILAHENDAMINE

### "Failid on nähtamata"

**Põhjus:** Failid on vale kausta.  
**Lahendus:** Kontrollige failide rada:
- index.html peab olema **repo juure** (mitte submappes)
- css/style.css peab olema **css/map** sees
- js/script.js peab olema **js/map** sees

### "Fotod ei kuva"

**Põhjus:** Vale pildiraja.  
**Lahendus:** 
1. Kontrollige `data/plants.json` faili
2. Pildinimi peab olema täpselt õige
3. HEIC → JPG teisendus

### "Ostukorv ei tööta"

**Põhjus:** JavaScripti viga.  
**Lahendus:**
1. Avage brauseris F12 → Console
2. Otsige punaseid vigu
3. Kontrollige, et `js/script.js` on õiges kohas

### "Gmail ei saa e-maile"

**Põhjus:** Formspree' seadistus.  
**Lahendus:**
1. Kontrollige Formspree kontot
2. Märkige e-mail teada
3. Teste vormi Formspree'i lehel

---

## 📞 KIIRED LINGID

| Asi | URL |
|-----|-----|
| GitHub Repo | https://github.com/kalevvillem/igavere-puukool-website |
| Teie Sait | https://kalevvillem.github.io/igavere-puukool-website/ |
| Formspree | https://formspree.io/ |
| GitHub Pages Seadistus | https://pages.github.com/ |

---

## ✅ KONTROLL-NIMEKIRI

Enne "Go Live"-i:

- [ ] Kõik failid on kopeeritud õigesse kohta
- [ ] Formspree' vorm ID asendatud
- [ ] Logo on `images/logo.png`
- [ ] Vähemalt mõned taime fotod on `images/plants/` (ülejäänud võib hiljem lisada)
- [ ] `data/plants.json` on uuendatud
- [ ] Aukioloajad on õiged
- [ ] Telefonid on õiged
- [ ] Email on õige
- [ ] Testitud lokaliti (Python server)
- [ ] GitHub'i surumised
- [ ] GitHub Pages on sisse lülitatud
- [ ] Sait on reaalajas!

---

## 🎉 ÕNNITLEKSI!

Teie sait on valmis! Nüüd:

1. Uurige, otsige probleeme
2. Lisage paremaid fotosid
3. Täitke Meist leht oma tekstiga
4. Lisage tiimi bioloogiad
5. Lisage rohkem taimi hinnadena

**Küsimused?** Helista +372 5060115 või saada e-kiri taimed@igaverepuukool.ee

---

**Võtmetähtsad punktid:**
- Kõik on FREE (GitHub, Formspree, GitHub Pages)
- Kõik on Eesti keeles
- Ostukorv saadab RFQ e-maili
- Mobiili jaoks optimeeritud
- Lihtne hallata ja uuendada

Palju õnne! 🌿
