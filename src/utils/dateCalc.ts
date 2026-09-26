export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  nextBirthdayDays: number;
}

/**
 * Calculates exact age in years, months, and days with leap-year awareness.
 */
export function calculateExactAge(birthDateStr: string, asOfDateStr?: string): AgeResult {
  const birth = new Date(birthDateStr);
  const today = asOfDateStr ? new Date(asOfDateStr) : new Date();

  if (isNaN(birth.getTime())) {
    throw new Error('Invalid birth date');
  }

  // Normalize time to start of day
  birth.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (birth > today) {
    throw new Error('Birth date cannot be in the future');
  }

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    // Get days in preceding month
    const prevMonthLastDay = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const diffTime = today.getTime() - birth.getTime();
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Next birthday calculation
  let nextBdayYear = today.getFullYear();
  let nextBday = new Date(nextBdayYear, birth.getMonth(), birth.getDate());
  if (nextBday < today) {
    nextBday = new Date(nextBdayYear + 1, birth.getMonth(), birth.getDate());
  }
  const nextBirthdayDays = Math.ceil((nextBday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return {
    years,
    months,
    days,
    totalDays,
    nextBirthdayDays,
  };
}

/**
 * Calculates calendar days between two dates.
 */
export function calculateDaysBetween(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid date format');
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffMs = Math.abs(end.getTime() - start.getTime());
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Checks whether a year is a leap year.
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
