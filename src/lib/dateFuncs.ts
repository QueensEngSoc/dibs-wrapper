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
