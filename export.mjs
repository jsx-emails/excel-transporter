import XLSX from "xlsx";
import { compile, getEmailTemplatesList, getConfig } from "jsx-email-builder";
import path from "path";
import formatters from "./formatters.mjs";
import { getHeaders, addNewRow } from "./utils/excel.mjs";
import { getShortCodes } from "./utils/shortcodes.mjs";

/**
 * @typedef {{sheet: string, keyColumn:string, cellData:{headerKey: string, value: string}[]}} MapObject
 * @typedef {{templatePath: string, texts: string[], subject: string}} TemplateData
 * @param {MapObject} mapObject
 * @param {TemplateData[]} templatesData
 * @param {string} inputFileName
 * @returns {void}
 */
function updateTranslationsExcel(
  mapObject,
  templatesData,
  inputFileName,
  outputFileName
) {
  let wb = XLSX.readFile(inputFileName);

  let sheet = wb.Sheets[mapObject.sheet];
  for (let templateData of templatesData) {
    for (let text of templateData.texts) {
      const headers = getHeaders(sheet);
      const row = {};
      for (let rowMap of mapObject.cellData) {
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
    plugins: { "excel-translations": pluginConfig },
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

  /** @type {MapObject} */
  const mapObject = pluginConfig.mapper;
  updateTranslationsExcel(
    mapObject,
    templatesData,
    "template.xls",
    "translations.xls"
  );
}

export default exportToExcel;
