import XLSX from "xlsx";
import { generateTranslations, getConfig } from "jsx-email-builder";
import path from "path";
import { decodeSpecialChars } from "./utils/decode.mjs";

async function importFromExcel() {
  // step 1
  const {
    plugins: { "excel-transporter": pluginConfig },
  } = getConfig();

  // step 2
  let wb = XLSX.readFile(
    path.join(process.cwd(), pluginConfig.import.inputFile)
  );

  // step 3
  let sheet = wb.Sheets[pluginConfig.import.importMap.sheet];
  if (!sheet) {
    console.error(
      `Sheet "${pluginConfig.import.importMap.sheet}" not found\n` +
        `Available sheets: ${Object.keys(wb.Sheets).join(", ")}`
    );
    process.exit(1);
  }

  // step 4
  const translations = {};

  // step 5
  const rows = XLSX.utils.sheet_to_json(sheet);
  for (const row of rows) {
    // step 5.1
    const key = decodeSpecialChars(
      row[pluginConfig.import.importMap.keyColumn]
    );

    // step 5.2
    for (const cellData of pluginConfig.import.importMap.cellData) {
      // step 5.2.1
      const languageCode = cellData.languageCode;

      // step 5.2.2
      const text = decodeSpecialChars(row[cellData.headerKey]);

      // step 5.2.3
      if (!translations[key]) {
        translations[key] = {};
      }
      translations[key][languageCode] = text;
    }
  }
  // console.log("🤖 :: translations:", translations);

  // step 6
  await generateTranslations(translations);
}

export default importFromExcel;
