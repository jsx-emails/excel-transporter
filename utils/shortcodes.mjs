import path from "path";
import { createHash } from "./hash.mjs";

export function getShortCodes({ templatePath, text, params }) {
  const rootFolder =
    path.dirname(templatePath).split(path.sep)[0] ||
    path.dirname(templatePath).split(path.sep)[1];
  const templateName = path.basename(templatePath).replace(".template.tsx", "");
  const textHash = createHash(text);
  return {
    rootFolder,
    templateName,
    text,
    hash: textHash,
    string: params,
  };
}
