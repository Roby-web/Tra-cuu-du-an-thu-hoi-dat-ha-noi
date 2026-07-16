const fs = require('fs');
const path = require('path');

const SHEET_URL = "https://docs.google.com/spreadsheets/d/1buSzZWhi-hWYXXcSTTY1kwQ4qlzzS9LBNrOomarJUjA/export?format=csv";

function parseCSV(csvText) {
  const lines = [];
  let currentLine = [];
  let currentToken = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentToken += '"';
          i++; // skip next quote
        } else {
          inQuotes = false;
        }
      } else {
        currentToken += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentLine.push(currentToken.trim());
        currentToken = '';
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && nextChar === '\n') {
          i++; // skip \n
        }
        currentLine.push(currentToken.trim());
        lines.push(currentLine);
        currentLine = [];
        currentToken = '';
      } else {
        currentToken += char;
      }
    }
  }
  
  if (currentToken || currentLine.length > 0) {
    currentLine.push(currentToken.trim());
    lines.push(currentLine);
  }

  return lines;
}

function parseArea(val) {
  if (!val) return 0;
  const cleaned = val.replace(/\s+/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

async function main() {
  try {
    console.log("Fetching latest Google Sheet CSV...");
    const res = await fetch(SHEET_URL);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const csvContent = await res.text();
    console.log(`Downloaded ${csvContent.length} bytes.`);

    const rows = parseCSV(csvContent);
    const headers = rows[0];
    const dataRows = rows.slice(1).filter(r => r.length >= headers.length && r[0]);

    const formattedData = dataRows.map((row) => {
      return {
        xaPhuong: row[0] || '',
        tenDuAn: row[1] || '',
        mucDich: row[2] || '',
        donVi: row[3] || '',
        dienTichDa: parseArea(row[4]),
        dienTichTh: parseArea(row[5]),
        phanLoai: row[6] || ''
      };
    });

    const outputPath = path.join(__dirname, '../src/data.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(formattedData, null, 2), 'utf-8');
    console.log(`Successfully generated clean JSON data with ${formattedData.length} records at ${outputPath}`);

  } catch (error) {
    console.error("Error fetching and formatting data:", error);
    process.exit(1);
  }
}

main();
