from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any
import unicodedata
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "data" / "catalog.json"
OFFERS_PATH = ROOT / "data" / "offers.json"
LOGO_PATH = ROOT / "images" / "logo-ruut.png"

OUT_CATALOG = ROOT / "Igavere Puukool_Hinnakiri_Suvi 2026.pdf"
OUT_CATALOG_PRINT = ROOT / "Igavere Puukool_Hinnakiri_Suvi 2026_Prinditav.pdf"
OUT_OFFERS = ROOT / "Igavere Puukool_Eripakkumised_Suvi 2026.pdf"
OUT_OFFERS_PRINT = ROOT / "Igavere Puukool_Eripakkumised_Suvi 2026_Prinditav.pdf"

GREEN = colors.HexColor("#2f5d43")
LIGHT_GREEN = colors.HexColor("#eaf3ec")
LIGHT_BORDER = colors.HexColor("#c9d8cc")
MUTED = colors.HexColor("#4f6154")


def euro(value: Any) -> str:
    if value is None:
        return "Küsi pakkumist"
    return f"{float(value):.2f} €"


def clean_text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def parse_height_and_package(label: str) -> tuple[str, str]:
    text = clean_text(label)
    match = re.search(r"\(([^()]*)\)$", text)
    if not match:
        return text, ""
    inside = match.group(1).strip()
    height = text[: match.start()].rstrip(" -")
    if "/" in inside:
        _, package = inside.split("/", 1)
        return height.strip(), package.strip()
    return height.strip(), inside


def normalize_key(value: Any) -> str:
    text = clean_text(value).lower().strip()
    text = unicodedata.normalize("NFD", text)
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    text = text.replace("–", "-").replace("—", "-")
    text = re.sub(r"\s+", " ", text)
    return text


def parse_offer_entry(offer_name: str, label: str) -> tuple[str, str, str]:
    text = clean_text(label)
    if "—" in text:
        plant_name, detail = [part.strip() for part in text.split("—", 1)]
    elif "-" in text and "(" in text and ")" in text and text.count("'") >= 2:
        plant_name = offer_name
        detail = text
    else:
        plant_name = offer_name
        detail = text
    height, package = parse_height_and_package(detail)
    return plant_name, height, package


def category_sort_key(name: str) -> tuple[int, str]:
    order = [
        "Lehtpuud",
        "Viljapuud",
        "Okaspuud",
        "Põõsad",
        "Püsikud",
        "Ronitaimed",
        "Hekitaimed",
        "Roosid",
    ]
    if name in order:
        return (order.index(name), name)
    return (len(order), name)


def header_block(styles: dict[str, ParagraphStyle], printable: bool, document_title: str) -> Table:
    label_style = ParagraphStyle(
        "HeaderLabel",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9.4,
        textColor=GREEN,
        leading=11,
    )
    body_style = ParagraphStyle(
        "HeaderBody",
        parent=styles["Normal"],
        fontSize=8.2,
        leading=10.4,
        textColor=colors.HexColor("#203127"),
    )
    center_style = ParagraphStyle(
        "HeaderCenter",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=11.5,
        textColor=GREEN,
        alignment=1,
    )
    mini_style = ParagraphStyle(
        "HeaderMini",
        parent=styles["Normal"],
        fontSize=7.5,
        leading=9,
        textColor=MUTED,
    )

    left = Paragraph(
        "<b>LEGEND:</b><br/>"
        "<b>LPU</b> - Lehtpuu<br/>"
        "<b>OKP</b> - Okaspuu<br/>"
        "<b>PÕS</b> - Põõsas<br/>"
        "<b>VIL</b> - Viljapuu<br/>"
        "<b>TÜVE ÜMBERMÕÕT</b> - Tüve jämedus 1m kõrguselt<br/>"
        "<b>PAKEND:</b><br/>"
        "WRB - Traatvõrguga mullapalliga puu<br/>"
        "RB / MP - Mullapalliga puu<br/>"
        "BR / PJ - Paljasjuurne taim<br/>"
        "C2 / K28 - Konteineri suurus liitrites<br/>"
        "P9 / P11 - Väikese poti külg sentimeetrites<br/>"
        "MS - Mitmeharuline puu<br/>"
        "CONT - Spetsifitseerimata suurusega potis olev taim",
        body_style,
    )

    center = Paragraph(
        "Ei leidnud vajalikku taime?<br/>"
        "Vajad nõu aia projekteerimisega?<br/>"
        "Otsid suuremat kogust?<br/><br/>"
        "Võta ühendust ja leiame lahenduse!<br/><br/>"
        "<font size='8'>Hinnad sisaldavad käibemaksu</font><br/>"
        "<font size='8'>NB: Kogused võivad muutuda!</font>",
        center_style,
    )

    right = Paragraph(
        "<b>IGAVERE PUUKOOL OÜ</b><br/>"
        "Reg nr 11489766<br/>"
        "Aaviku, Igavere küla, Raasiku vald<br/>"
        "Harjumaa 74205<br/>"
        "E-post: info@igaverepuukool.ee<br/>"
        "Telefon: +372 56 888 145 / +372 52 84 005<br/>"
        "www.igaverepuukool.ee",
        body_style,
    )

    logo = Image(str(LOGO_PATH), width=16 * mm, height=16 * mm)
    logo.hAlign = "LEFT"

    top = Table(
        [[logo, Paragraph(document_title, label_style), Paragraph("", mini_style)]],
        colWidths=[20 * mm, 160 * mm, 90 * mm],
    )
    top.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
            ]
        )
    )

    bottom = Table(
        [[left, center, right]],
        colWidths=[95 * mm, 95 * mm, 80 * mm],
    )
    bottom_bg = colors.white if printable else LIGHT_GREEN
    bottom.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), bottom_bg),
                ("BOX", (0, 0), (-1, -1), 0.6, LIGHT_BORDER),
                ("INNERGRID", (0, 0), (-1, -1), 0.35, LIGHT_BORDER),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )

    wrapper = Table([[top], [bottom]], colWidths=[270 * mm])
    wrapper.setStyle(
        TableStyle(
            [
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    return wrapper


def make_table(
    rows: list[list[str]],
    printable: bool,
    title: str,
    styles: dict[str, ParagraphStyle],
    document_title: str,
) -> list[Any]:
    story: list[Any] = [
        header_block(styles, printable, document_title),
        Spacer(1, 4 * mm),
        Paragraph(title, ParagraphStyle("Section", parent=styles["Heading3"], textColor=GREEN, fontSize=11)),
        Spacer(1, 2 * mm),
    ]

    table_header = ["Müüginimi", "Ladinakeelne nimi", "Tüüp", "Kõrgus", "Tüve ümbermõõt", "Pakend", "Lisainfo", "Hind"]
    cell_style = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.2,
        leading=8.6,
        textColor=colors.HexColor("#203127"),
    )
    cell_bold_style = ParagraphStyle(
        "TableCellBold",
        parent=cell_style,
        fontName="Helvetica-Bold",
    )
    cell_price_style = ParagraphStyle(
        "TableCellPrice",
        parent=cell_bold_style,
        alignment=2,
    )

    wrapped_rows: list[list[Paragraph]] = []
    for row in rows:
        wrapped_rows.append(
            [
                Paragraph(escape(clean_text(row[0])), cell_bold_style),
                Paragraph(escape(clean_text(row[1])), cell_style),
                Paragraph(escape(clean_text(row[2])), cell_style),
                Paragraph(escape(clean_text(row[3])), cell_style),
                Paragraph(escape(clean_text(row[4])), cell_style),
                Paragraph(escape(clean_text(row[5])), cell_style),
                Paragraph(escape(clean_text(row[6])), cell_style),
                Paragraph(escape(clean_text(row[7])), cell_price_style),
            ]
        )

    data = [table_header, *wrapped_rows]

    table = Table(
        data,
        repeatRows=1,
        colWidths=[52 * mm, 40 * mm, 14 * mm, 20 * mm, 22 * mm, 16 * mm, 72 * mm, 22 * mm],
    )
    header_bg = colors.white if printable else GREEN
    header_fg = colors.black if printable else colors.white
    zebra = colors.white if printable else colors.HexColor("#f7faf7")

    style = [
        ("BACKGROUND", (0, 0), (-1, 0), header_bg),
        ("TEXTCOLOR", (0, 0), (-1, 0), header_fg),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 7.4),
        ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#9bb19f")),
        ("ALIGN", (7, 0), (7, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 2.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5),
    ]
    for row_index in range(1, len(data)):
        if row_index % 2 == 0:
            style.append(("BACKGROUND", (0, row_index), (-1, row_index), zebra))
    table.setStyle(TableStyle(style))
    story.append(table)
    return story


def draw_page(canvas, doc, title: str):
    canvas.saveState()
    width, height = doc.pagesize
    canvas.setStrokeColor(colors.HexColor("#bfd0c2"))
    canvas.setLineWidth(0.5)
    canvas.line(10 * mm, height - 11 * mm, width - 10 * mm, height - 11 * mm)
    canvas.setFont("Helvetica-Bold", 9)
    canvas.setFillColor(GREEN)
    canvas.drawString(12 * mm, height - 8.4 * mm, title)
    canvas.setFillColor(colors.HexColor("#415647"))
    canvas.setFont("Helvetica", 8.2)
    canvas.drawRightString(width - 12 * mm, 8 * mm, f"{canvas.getPageNumber()}")
    canvas.restoreState()


def build_catalog_pdf(output_path: Path, printable: bool = False):
    catalog_payload = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    catalog = catalog_payload.get("items", catalog_payload)
    rows = [
        [
            clean_text(item.get("name")),
            clean_text(item.get("latin")),
            clean_text(item.get("type")),
            clean_text(item.get("height")),
            clean_text(item.get("trunk")),
            clean_text(item.get("package")),
            clean_text(item.get("spec")),
            euro(item.get("price")),
        ]
        for item in sorted(catalog, key=lambda x: (category_sort_key(clean_text(x.get("category") or x.get("type"))), clean_text(x.get("name"))))
    ]

    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=landscape(A4),
        leftMargin=10 * mm,
        rightMargin=10 * mm,
        topMargin=14 * mm,
        bottomMargin=11 * mm,
        title="Igavere Puukool - Hinnakiri",
    )
    styles = getSampleStyleSheet()
    title = "Igavere Puukool - Hinnakiri"
    story = make_table(rows, printable, "Põhihinnakiri", styles, title)
    title = "Igavere Puukool - Hinnakiri"
    doc.build(story, onFirstPage=lambda c, d: draw_page(c, d, title), onLaterPages=lambda c, d: draw_page(c, d, title))


def build_offers_pdf(output_path: Path, printable: bool = False):
    offers_payload = json.loads(OFFERS_PATH.read_text(encoding="utf-8"))
    offers = offers_payload.get("offers", offers_payload)
    catalog_payload = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    catalog = catalog_payload.get("items", catalog_payload)
    catalog_by_name: dict[str, dict[str, Any]] = {}
    for item in catalog:
        key = normalize_key(item.get("name"))
        if key and key not in catalog_by_name:
            catalog_by_name[key] = item

    rows: list[list[str]] = []
    for offer in offers:
        offer_name = clean_text(offer.get("name"))
        offer_latin = clean_text(offer.get("latin"))
        for size in offer.get("sizes", []):
            plant_name, height, package = parse_offer_entry(offer_name, clean_text(size.get("label")))
            catalog_item = catalog_by_name.get(normalize_key(plant_name), {})

            latin = clean_text(catalog_item.get("latin")) or offer_latin
            plant_type = clean_text(catalog_item.get("type")) or "Pakkumine"
            offer_price = size.get("offer_price", size.get("offerPrice"))
            regular_price = size.get("regular_price", size.get("price"))
            note = clean_text(size.get("note"))

            if regular_price is not None and offer_price is not None and float(regular_price) > float(offer_price):
                saved = float(regular_price) - float(offer_price)
                discount = f"Tavahind {euro(regular_price)}, sääst {euro(saved)}"
                note = f"{note}; {discount}" if note else discount

            rows.append(
                [
                    plant_name,
                    latin,
                    plant_type,
                    height,
                    "",
                    package,
                    note,
                    euro(offer_price),
                ]
            )

    rows.sort(key=lambda row: (normalize_key(row[0]), normalize_key(row[3]), normalize_key(row[5])))

    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=landscape(A4),
        leftMargin=10 * mm,
        rightMargin=10 * mm,
        topMargin=14 * mm,
        bottomMargin=11 * mm,
        title="Igavere Puukool - Eripakkumised",
    )
    styles = getSampleStyleSheet()
    title = "Igavere Puukool - Eripakkumised"
    story = make_table(rows, printable=printable, title="Eripakkumiste hinnakiri", styles=styles, document_title=title)
    title = "Igavere Puukool - Eripakkumised"
    doc.build(story, onFirstPage=lambda c, d: draw_page(c, d, title), onLaterPages=lambda c, d: draw_page(c, d, title))


def main():
    build_catalog_pdf(OUT_CATALOG, printable=False)
    build_catalog_pdf(OUT_CATALOG_PRINT, printable=True)
    build_offers_pdf(OUT_OFFERS, printable=False)
    build_offers_pdf(OUT_OFFERS_PRINT, printable=True)
    print("PDFid loodud:")
    print(f"- {OUT_CATALOG.name}")
    print(f"- {OUT_CATALOG_PRINT.name}")
    print(f"- {OUT_OFFERS.name}")
    print(f"- {OUT_OFFERS_PRINT.name}")


if __name__ == "__main__":
    main()
