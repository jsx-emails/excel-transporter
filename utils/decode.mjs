const specialChars = ["&quot;", "&apos;", "&gt;", "&lt;", "&amp;"];

const encodings = {
  "&quot;": '"',
  "&apos;": "'",
  "&gt;": ">",
  "&lt;": "<",
  "&amp;": "&",
};

export function decodeSpecialChars(str) {
  const regex = new RegExp(specialChars.join("|"), "g");
  return str.replace(regex, function (match) {
    return encodings[match];
  });
}
