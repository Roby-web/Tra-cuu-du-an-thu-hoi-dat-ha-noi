// Use global fetch (available in Node.js 18+) which follows redirects automatically
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
          // Escaped quote
          currentToken += '"';
          i++; // skip next quote
        } else {
          // End of quotes
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
  // Replace space and map ',' to '.'
  const cleaned = val.replace(/\s+/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

async function main() {
  try {
    console.log("Downloading CSV using global fetch...");
    const res = await fetch(SHEET_URL);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const csvContent = await res.text();
    console.log(`Downloaded ${csvContent.length} bytes.`);

    const rows = parseCSV(csvContent);
    console.log(`Parsed ${rows.length} rows.`);

    const headers = rows[0];
    console.log("Headers:", headers);

    const uniqueWards = new Set();
    const uniquePurposes = new Set();
    const uniqueClassifications = new Set();
    
    let totalProjectArea = 0;
    let totalRecoveredArea = 0;

    const dataRows = rows.slice(1).filter(r => r.length >= headers.length && r[0]);

    dataRows.forEach((row) => {
      uniqueWards.add(row[0]);
      uniquePurposes.add(row[2]);
      uniqueClassifications.add(row[6]);
      
      const pArea = parseArea(row[4]);
      const rArea = parseArea(row[5]);
      totalProjectArea += pArea;
      totalRecoveredArea += rArea;
    });

    console.log(`\nStatistics:`);
    console.log(`- Total data rows: ${dataRows.length}`);
    console.log(`- Unique Wards/Communes (${uniqueWards.size}):`, Array.from(uniqueWards).slice(0, 15), "...");
    console.log(`- Unique Purposes (${uniquePurposes.size}):`, Array.from(uniquePurposes).slice(0, 10), "...");
    console.log(`- Unique Classifications (${uniqueClassifications.size}):`, Array.from(uniqueClassifications));
    console.log(`- Total Project Area: ${totalProjectArea.toFixed(2)} ha`);
    console.log(`- Total Recovered Area: ${totalRecoveredArea.toFixed(2)} ha`);

    console.log("\nSample row 1:", dataRows[0]);
    console.log("Sample row 2:", dataRows[1]);
    console.log("Sample row 3:", dataRows[2]);

  } catch (error) {
    console.error("Error analyzing CSV:", error);
  }
}

main();
