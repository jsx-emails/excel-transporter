import caseFormatters from "change-case";

function printIfSubject(text, { isSubject, string }) {
  if (isSubject) {
    return string || text;
  }
  return "";
}

function printIfNotSubject(text, { isSubject, string }) {
  if (!isSubject) {
    return string || text;
  }
  return "";
}

export default {
  ...caseFormatters,
  printIfSubject,
  printIfNotSubject,
};
