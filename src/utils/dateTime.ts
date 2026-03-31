const DHAKA_OFFSET_MINUTES = 6 * 60;
const DHAKA_OFFSET_MILLISECONDS = DHAKA_OFFSET_MINUTES * 60 * 1000;

const pad = (value: number) => value.toString().padStart(2, '0');

const parseMonthString = (month: string) => {
  const [year, monthNumber] = month.split('-').map(Number);
  return { year, month: monthNumber };
};

const parseDateString = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  return { year, month, day };
};

const toUtcDateAtStartOfDay = (date: string) => {
  const { year, month, day } = parseDateString(date);
  return new Date(Date.UTC(year, month - 1, day));
};

const getMonthDateRangeUtc = (month: string) => {
  const { year, month: monthNumber } = parseMonthString(month);
  return {
    startDate: new Date(Date.UTC(year, monthNumber - 1, 1)),
    endDate: new Date(Date.UTC(year, monthNumber, 1)),
  };
};

const getDateStringFromUtcDate = (date: Date) => {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
};

const getMonthStringFromUtcDate = (date: Date) => {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
};

const getCurrentDhakaDateString = () => {
  const dhakaNow = new Date(Date.now() + DHAKA_OFFSET_MILLISECONDS);
  return `${dhakaNow.getUTCFullYear()}-${pad(dhakaNow.getUTCMonth() + 1)}-${pad(dhakaNow.getUTCDate())}`;
};

const shiftUtcDateStringByDays = (date: string, offsetDays: number) => {
  const shiftedDate = toUtcDateAtStartOfDay(date);
  shiftedDate.setUTCDate(shiftedDate.getUTCDate() + offsetDays);
  return getDateStringFromUtcDate(shiftedDate);
};

const createUtcInstantFromDhakaDateTime = (date: string, time: string) => {
  const { year, month, day } = parseDateString(date);
  const [hours, minutes] = time.split(':').map(Number);

  return new Date(
    Date.UTC(year, month - 1, day, hours, minutes) - DHAKA_OFFSET_MILLISECONDS,
  );
};

const getMealDeadlineUtc = (scheduleDate: Date, time: string, offsetDays: number) => {
  const scheduleDateString = getDateStringFromUtcDate(scheduleDate);
  const deadlineDateString = shiftUtcDateStringByDays(scheduleDateString, offsetDays);
  return createUtcInstantFromDhakaDateTime(deadlineDateString, time);
};

export {
  createUtcInstantFromDhakaDateTime,
  getCurrentDhakaDateString,
  getDateStringFromUtcDate,
  getMealDeadlineUtc,
  getMonthDateRangeUtc,
  getMonthStringFromUtcDate,
  toUtcDateAtStartOfDay,
};
