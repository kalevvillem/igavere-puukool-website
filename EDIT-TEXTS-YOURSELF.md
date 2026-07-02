# 📝 HOW TO EDIT WEBSITE TEXT YOURSELF

You no longer need to ask me to edit text! Here's how to do it yourself.

---

## ⚡ QUICK START - 3 WAYS TO EDIT

### **METHOD 1: Edit HTML Files Directly (Easiest for Small Changes)**

**If you want to change a specific text:**

1. **Open your GitHub repo folder:**
   ```
   ~/Documents/GitHub/igavere-puukool-website/
   ```

2. **Find and open the HTML file you want to edit:**
   - `index.html` - Avaleht (Home page)
   - `meist.html` - Meist (About page)
   - `pakkumised.html` - Pakkumised (Offers)
   - `hinnapakkumine.html` - Hinnakirjed (Price list)
   - `kontakt.html` - Kontakt (Contact)

3. **Use any text editor (notepad, VS Code, etc.):**
   - Right-click file → Open with → Your editor

4. **Find the text you want to change** (use Ctrl+F / Cmd+F to search)

5. **Edit the text between the tags**

6. **Save the file** (Ctrl+S / Cmd+S)

7. **Refresh your browser** to see changes

---

### **METHOD 2: Use config.json (Best for Content Organization)**

**If you want a centralized place for ALL text content:**

The file `config.json` contains ALL website text. Edit it like a form:

```json
{
  "site": {
    "title": "Change this text",
    "tagline": "Change this too"
  },
  "footer": {
    "hours": [
      { "days": "E-P", "time": "Suletud" },
      { "days": "T-R", "time": "10:00-18:00" },
      { "days": "L", "time": "10:00-15:00" }
    ]
  }
}
```

**Step-by-step:**
1. Open `config.json` in any text editor
2. Find the text you want to change
3. Modify the VALUE (the text after the colon `:`)
4. **DO NOT change the KEY** (the label on the left)
5. Save the file

**Example:**
```json
// BEFORE:
"email": "taimed@igaverepuukool.ee"

// AFTER (changed email):
"email": "uusemeil@igaverepuukool.ee"
```

---

### **METHOD 3: Full-Text Sections (For Longer Content)**

**For pages like "Meist" that have longer paragraphs:**

Each HTML file has clearly marked sections:

```html
<!-- ===== MEIST SECTION ===== -->
<h1>Meist</h1>
<p>Edit this text...</p>
<!-- ===== END MEIST SECTION ===== -->
```

**Steps:**
1. Open the HTML file
2. Look for the section you want to change (look for comments like `<!-- MEIST -->`)
3. Change the text between `<p>...</p>` tags
4. Save and refresh browser

---

## 🎯 WHERE TO FIND SPECIFIC TEXT

### **Navigation Menu**
- File: `index.html`, `meist.html`, etc.
- Look for: `<nav>` section at the top
- Text: "Kodu", "Meist", "Pakkumised", etc.

### **Footer (same on all pages)**
- File: Any HTML file, scroll to bottom
- Look for: `<footer>` section
- Text: Phone numbers, hours, social links

### **Home Page (Avaleht)**
- File: `index.html`
- Sections: Hero title, stats, services, CTA buttons

### **About Page (Meist)**
- File: `meist.html`
- Sections: Company story, services, team placeholders

### **Offers Page (Pakkumised)**
- File: `pakkumised.html`
- Sections: Special offer cards (27%-40% discounts)

### **Price List Page (Hinnakirjed)**
- File: `hinnapakkumine.html`
- Sections: Product grid, search, filters, cart

### **Contact Page (Kontakt)**
- File: `kontakt.html`
- Sections: Contact form, FAQ, hours, location

---

## 🖼️ ADDING PHOTOS

Photos are already linked in `plants.json` and HTML.

**To add plant photos:**

1. **Convert HEIC to JPG** (if needed):
   - Mac: Use Photos app → Export as JPG
   - Windows: Use https://cloudconvert.com (free, drag & drop)

2. **Place photos in:**
   ```
   ~/Documents/GitHub/igavere-puukool-website/images/plants/
   ```

3. **Filenames MUST match exactly** what's in `plants.json`

   Example: If `plants.json` says:
   ```json
   "image": "poiosenel_red_baron_60-80cm.jpg"
   ```
   
   Then your file must be named:
   ```
   poiosenel_red_baron_60-80cm.jpg
   ```

4. **Once photos are in place, refresh your browser** - they'll show up automatically!

---

## 📋 COMMON EDITS

### **Change phone number:**
Find: `+372 5060115`
Replace with: Your new number

### **Change email:**
Find: `taimed@igaverepuukool.ee`
Replace with: Your new email

### **Change hours:**
Find: `T-R: 10:00-18:00`
Replace with: Your new hours

### **Add new plant:**
1. Edit `data/plants.json`
2. Add a new plant object in the `plants` array
3. Follow the same format as existing plants

### **Change colors:**
1. Open `css/style.css`
2. Find `:root {` at the top
3. Change colors like:
   ```css
   --primary-green: #5DB83C;  /* Change this hex value */
   ```

---

## ✅ TESTING YOUR CHANGES

**After editing:**

1. Save the file
2. Open terminal:
   ```bash
   cd ~/Documents/GitHub/igavere-puukool-website
   python3 -m http.server 8000
   ```
3. Open browser: `http://localhost:8000`
4. Refresh the page (Cmd+R or Ctrl+R)
5. Check if changes appear

---

## 📤 PUSHING CHANGES TO GITHUB

**After editing and testing locally:**

```bash
cd ~/Documents/GitHub/igavere-puukool-website

# See what changed
git status

# Add all changes
git add .

# Commit with description
git commit -m "Update: Fixed footer wording and phone numbers"

# Push to GitHub
git push origin main
```

Your website updates live in a few seconds! 🚀

---

## ⚠️ IMPORTANT NOTES

1. **Don't change HTML structure** - only the text content
2. **Keep the quotation marks and commas in JSON** - they're important
3. **Use UTF-8 encoding** when saving files (most editors do this by default)
4. **Keep backups** - save the old version before making big changes
5. **Test locally** before pushing to GitHub

---

## 🆘 HELP!

**If something breaks:**

1. Use `git status` to see what changed
2. Use `git diff` to see exact changes
3. Use `git checkout filename` to undo changes to a file
4. Use `git reset --hard` to undo everything

**If you're unsure:**
1. Make a copy of the file first
2. Edit the copy to test
3. Only replace the original if it works

---

## 🎓 LEARN MORE

- **HTML basics:** https://www.w3schools.com/html/
- **JSON format:** https://www.json.org/json-en.html
- **Git basics:** https://git-scm.com/book/en/v2/Getting-Started-Git-Basics

---

**You've got this! 🌿**

Questions? Check the SETUP-GUIDE-ET.md or test with the local server first.
