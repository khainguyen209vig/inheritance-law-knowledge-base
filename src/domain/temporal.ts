const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/u;

export function addCalendarYears(isoDate: string, years: number): `${number}-${number}-${number}` {
  const match = ISO_DATE.exec(isoDate);
  if (!match || !Number.isInteger(years) || years < 0) throw new Error("Mốc ngày hoặc số năm không hợp lệ.");

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const source = new Date(Date.UTC(year, month - 1, day));
  if (source.getUTCFullYear() !== year || source.getUTCMonth() !== month - 1 || source.getUTCDate() !== day) {
    throw new Error("Mốc ngày không tồn tại trong lịch.");
  }

  const targetYear = year + years;
  const lastDay = new Date(Date.UTC(targetYear, month, 0)).getUTCDate();
  return `${String(targetYear).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(Math.min(day, lastDay)).padStart(2, "0")}` as `${number}-${number}-${number}`;
}
