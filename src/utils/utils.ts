/**
 * Convert date to string
 * @param {Date} date
 * @return {string}
 */
export function dateToString(date: Date) {
  const string = date.toISOString()
      .replace(/T/, ' ')
      .replace(/\..+/, ''); // delete the dot and everything after

  return string;
}

/**
 * Convert date to date string
 * @param {Date} date
 * @return {string}
 */
export function dateToDateString(date: Date) {
  const string = date.toISOString()
      .replace(/T/, ' ')
      .replace(/\..+/, '') // delete the dot and everything after
      .substr(0, 10);

  return string;
}

/**
 * Format date
 * @param {Date} date
 * @return {string}
 */
export function formatDate(date: Date) {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
    timeZone: 'America/Los_Angeles',
  };

  return new Intl.DateTimeFormat('default', options).format(date);
}

/**
 * Generate random string
 * @param {int} length
 * @param {string} characters
 * @return {string}
 */
export function generateRandomString(length: number, characters?: String) {
  let result = '';
  characters = characters ||
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }

  return result;
}
