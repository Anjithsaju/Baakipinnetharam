import Tesseract from "tesseract.js";

export interface ParsedItem {
  item: string;
  qty: number;
  price: number;
  amount: number;
}

export async function extractAndParseBill(
  file: File,
  onProgress?: (progress: number) => void
): Promise<ParsedItem[]> {
  const {
    data: { text },
  } = await Tesseract.recognize(file, "eng", {
    logger: (m) => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(Math.round(m.progress * 100)); // 0–1 → 0–100
      }
    },
  });

  console.log("OCR text:", text);

  return parseBillText(text);
}

function parseBillText(ocrText: string): ParsedItem[] {
  const lines = ocrText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const items: ParsedItem[] = [];

  for (let line of lines) {
    const clean = line.replace(/[^\w\s.\d]/g, "");
    const parts = clean.trim().split(/\s+/);

    const numbers = parts.filter((p) => /^\d+(\.\d{1,2})?$/.test(p));

    if (numbers.length >= 3 && parts.length >= 4) {
      const amount = parseFloat(numbers.pop()!);
      const price = parseFloat(numbers.pop()!);
      const qty = parseInt(numbers.pop()!);

      const itemName = parts
        .slice(0, parts.length - 3)
        .join(" ")
        .replace(/\d+/g, "")
        .trim();

      if (!isNaN(qty) && !isNaN(price) && !isNaN(amount)) {
        items.push({ item: itemName, qty, price, amount });
      }
    } else {
      const taxMatch = line.match(
        /(tax|cgst|sgst|igst)[^\d]*(\d+(\.\d{1,2})?)$/i
      );
      if (taxMatch) {
        items.push({
          item: taxMatch[1].toUpperCase(),
          qty: 0,
          price: 0,
          amount: parseFloat(taxMatch[2]),
        });
      }
    }
  }

  return items;
}
