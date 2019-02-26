export function getPrettyHour(hour: number, showAmPm: boolean = false): string {
  let amOrPm = showAmPm ? (hour >= 12 ? ' PM' : ' AM') : '';

  if (hour > 12) {
    return (hour - 12).toString() + ':30' + amOrPm;
  }

  if (hour === 12) {
      return hour.toString() + ':30' + amOrPm
  }

  return hour.toString() + ':30' + amOrPm;
}

export function sanitiseTime(hour: number, checkMinutes: boolean = false): number {
  const minutes = new Date().getMinutes();
  let testHour = hour;

  if (checkMinutes && minutes < 30) {
    testHour--;
  }

  if (testHour > 23 || testHour < 7) {
    return 7;
  }

  return testHour;
}

export function getDaysFromToday(dateToCheck: Date): number {
  dateToCheck.setHours(8, 0, 0, 0); // set both dates to be at 8am, thus the math does not break in situations where the difference in time is not equal to the difference in calendar days.
  // Eg: 11:59pm and 7:30am are less than 24h apart, but it is the next calendar day, or annoyingly cases like 8:58:49 vs 8:46:20 which falsely gives a difference of one day instead of zero
  const today = new Date();
  today.setHours(8, 0, 0, 0);

  let number = Math.ceil((+dateToCheck - +today)/(1000*60*60*24)); // from https://github.com/Microsoft/TypeScript/issues/5710, the '+' forces the date to a number (presumably using the getTime() func)
  if (number === -0)
    number = 0;
  return number;
}
