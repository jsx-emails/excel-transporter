import XLSX from "xlsx";

export function getHeaders(sheet) {
  let range = XLSX.utils.decode_range(sheet["!ref"]);
  let headerRow = [];
  for (let C = range.s.c; C <= range.e.c; ++C) {
    let address = XLSX.utils.encode_col(C) + XLSX.utils.encode_row(range.s.r);
    let cell = sheet[address];
    if (cell) {
      headerRow[cell.v] = {
        address,
        columnName: XLSX.utils.encode_col(C),
        rowName: XLSX.utils.encode_row(range.s.r),
      };
    }
  }
  return headerRow;
}

export function addNewRow(sheet, row, fillWithPreviousRow = false) {
  let range = XLSX.utils.decode_range(sheet["!ref"]);
  const isNewRowFirstDataRow = range.e.r === 1;
  const isFirstRowAlreadyFilled = Boolean(
    sheet[Object.keys(row)[0] + XLSX.utils.encode_row(1)]?.v,
  );

  let newRowIdx =
    isNewRowFirstDataRow && !isFirstRowAlreadyFilled
      ? range.e.r
      : range.e.r + 1;
  // add new row:
  for (let C = range.s.c; C <= range.e.c; C++) {
    const currentColumnName = XLSX.utils.encode_col(C);
    const address = currentColumnName + XLSX.utils.encode_row(newRowIdx);
    if (Object.keys(row).includes(currentColumnName)) {
      sheet[address] = row[currentColumnName];
    } else {
      if (fillWithPreviousRow) {
        let prevRowIdx = range.e.r;
        let prevAddress = currentColumnName + XLSX.utils.encode_row(prevRowIdx);
        sheet[address] = {
          ...sheet[prevAddress],
        };
      } else {
        sheet[address] = {
          t: "s",
          v: undefined,
          w: undefined,
        };
      }
    }
  }
  // update ref:
  sheet["!ref"] = XLSX.utils.encode_range({
    s: { c: 0, r: 0 },
    e: { c: range.e.c, r: newRowIdx },
  });
}
