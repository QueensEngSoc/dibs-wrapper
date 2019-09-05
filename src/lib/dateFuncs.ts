import router from "../routes";

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

export function formatDate(date) {
  let d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

export function formatDateAsYMD(date: Date): string {
  let d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

export function getPrettyDay(intDay: number, fullString: boolean = false): string {
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

  if (!fullString) {
    if (intDay == 0)
      return 'Today';

    if (intDay == 1)
      return 'Tomorrow';

    if (intDay == -1)
      return 'Yesterday';
  }

  const today = new Date();
  today.setTime(today.getTime() + intDay * 24 * 60 * 60 * 1000);
  return today.toLocaleDateString(undefined, dateOptions);
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

export function getCurrentHour() {
  let currentHour = new Date().getHours();
  const current_min = new Date().getMinutes();

  if (current_min < 30)   // logic here is that we are returning the status based on the start hour.  Since the min booking time is
    currentHour--;       // 1 hour, if the current minute is less than 30, we are still within the previous booking slot
                          // and we should therefore subtract 1 from the hour to get the right data (eg. if it is 7:10pm
                          // right now, then we really want the data from 6:30 - 7:30, not 7:30 - 8:30)

  return currentHour;
}

export function getDaysFromToday(dateToCheck: Date): number {
  if (!dateToCheck)
    return null;

  dateToCheck.setHours(8, 0, 0, 0); // set both dates to be at 8am, thus the math does not break in situations where the difference in time is not equal to the difference in calendar days.
  // Eg: 11:59pm and 7:30am are less than 24h apart, but it is the next calendar day, or annoyingly cases like 8:58:49 vs 8:46:20 which falsely gives a difference of one day instead of zero
  const today = new Date();
  today.setHours(8, 0, 0, 0);

  let number = Math.ceil((+dateToCheck - +today) / (1000 * 60 * 60 * 24)); // from https://github.com/Microsoft/TypeScript/issues/5710, the '+' forces the date to a number (presumably using the getTime() func)
  if (number === -0)
    number = 0;
  return number;
}

export function isValidTime(time: number, day: number = 0): boolean {
  const current_min = new Date().getMinutes();

  if (time < 7 || time > 23 || (time == 23 && current_min > 30) || (time == 7 && current_min < 30))
    return false;

  return true;
}
