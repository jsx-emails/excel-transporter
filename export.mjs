import XLSX from "xlsx";
import { compile, getEmailTemplatesList, getConfig } from "jsx-email-builder";
import path from "path";
import formatters from "./formatters.mjs";
import { getHeaders, addNewRow } from "./utils/excel.mjs";
import { getShortCodes } from "./utils/shortcodes.mjs";

/**
 * @typedef {{sheet: string, cellData:{headerKey: string, value: string}[]}} ExportMap
 * @typedef {{templatePath: string, texts: string[], subject: string}} TemplateData
 * @param {ExportMap} exportMap
 * @param {TemplateData[]} templatesData
 * @param {string} inputFileName
 * @returns {void}
 */
function updateTranslationsExcel(
  exportMap,
  templatesData,
  inputFileName,
  outputFileName
) {
  let wb = XLSX.readFile(inputFileName);

  let sheet = wb.Sheets[exportMap.sheet];
  if (!sheet) {
    console.error(
      `Sheet "${exportMap.sheet}" not found\n` +
        `Available sheets: ${Object.keys(wb.Sheets).join(", ")}`
    );
    process.exit(1);
  }
  for (let templateData of templatesData) {
    for (let text of templateData.texts) {
      const headers = getHeaders(sheet);
      const row = {};
      for (let rowMap of exportMap.cellData) {
        let column = headers[rowMap.headerKey].columnName;
        // update cell:
        const value = rowMap.value.replace(/%(.+?)%/g, (_match, p1) => {
          const [shortCode, formatter, params] = p1.split(":");
          const shortCodes = getShortCodes({
            templatePath: templateData.templatePath,
            text,
            params,
          });
          let value = shortCodes[shortCode];
          if (formatter) {
            const formatterFn = formatters[formatter];
            if (!formatterFn) {
              throw new Error(`Formatter ${formatter} not found`);
            }
            value = formatterFn(value, {
              isSubject: templateData.subject === text,
              ...shortCodes,
            });
          }
          return value;
        });
        row[column] = {
          t: "s",
          v: value,
          w: value,
        };
      }
      addNewRow(sheet, row, true);
    }
  }

  // write workbook
  XLSX.writeFile(wb, outputFileName);
}

async function exportToExcel() {
  const emailTemplatesList = getEmailTemplatesList();
  const {
    templates: { templatesDir },
    plugins: { "excel-transporter": pluginConfig },
  } = getConfig();

  /** @type {TemplateData[]} */
  const templatesData = [];

  for (const template of emailTemplatesList) {
    const templatePath = path.join(process.cwd(), templatesDir, template);
    // console.log("🤖 :: templatePath:", templatePath);
    let compileResult = await compile({
      templatePath,
      i18nEnabled: true,
      compileAllLangs: false,
      prettify: false,
    });
    // console.log("🤖 :: compileResult.texts:", compileResult.texts);
    templatesData.push({
      templatePath: template,
      texts: compileResult.texts,
      subject: compileResult.subject,
    });
  }

  /** @type {ExportMap} */
  const exportMap = pluginConfig.export.exportMap;
  updateTranslationsExcel(
    exportMap,
    templatesData,
    path.join(process.cwd(), pluginConfig.export.inputFile),
    path.join(process.cwd(), pluginConfig.export.outputFile)
  );
}

export default exportToExcel;
