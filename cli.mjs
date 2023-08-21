#!/usr/bin/env node

import fs from "fs-extra";
import path from "path";
import parseArgs from "minimist";
import exportToExcel from "./export.mjs";
import importFromExcel from "./import.mjs";

const logger = console;

function printHelp() {
  logger.log("[Excel Transporter] Help");
  logger.log("  Commands:");
  logger.log("    help: Show this help");
  logger.log("    version: Show version");
  logger.log("    export: export texts from email templates to excel");
  logger.log("    import: import translations from excel to email templates");
}

function printVersion() {
  const workingDir = process.cwd();
  const packageJsonPath = path.join(workingDir, "package.json");
  const packageJson = fs.readJsonSync(packageJsonPath);
  logger.log(`[Excel Transporter] ${packageJson.version}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  switch (args?._?.[0]) {
    case "help":
      printHelp();
      break;
    case "version":
      printVersion();
      break;
    case "export":
      await exportToExcel();
      break;
    case "import":
      importFromExcel();
      break;
    case undefined:
      logger.error("[Excel Transporter] error: No command specified");
      process.exit(1);
    default:
      logger.error("[Excel Transporter] error: Unknown command");
      process.exit(1);
  }
}

await main();
