import "client-only";

export interface Time {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  fractionalSecondDigits: 3,
  hour12: false,
});

export function dateFromDatetime(date: Date, time: Time) {
  date.setHours(time.hours);
  date.setMinutes(time.minutes);
  date.setSeconds(time.seconds);
  date.setMilliseconds(time.milliseconds);

  return date;
}

export function dateToString(value: Date) {
  const parts = dateTimeFormat.formatToParts(value);
  const year = parts
    .find((part) => part.type === "year")!
    .value.padStart(4, "0");
  const month = parts.find((part) => part.type === "month")!.value;
  const day = parts.find((part) => part.type === "day")!.value;
  const hour = parts.find((part) => part.type === "hour")!.value;
  const minute = parts.find((part) => part.type === "minute")!.value;
  const second = parts.find((part) => part.type === "second")!.value;
  const fractionalSecond = parts.find(
    (part) => part.type === "fractionalSecond",
  )!.value;

  const date = `${day} ${month} ${year} ${hour}:${minute}:${second}.${fractionalSecond}`;
  return date;
}

export function dateFromString(value: string) {
  const match = /(.+) (.+) (.+) (.+):(.+):(.+)[.](.+)/.exec(value);
  if (match === null) throw new Error(`'${value}' is not a valid date format`);
  let monthIndex = -1;
  if (match.at(2) === "Jan") monthIndex = 0;
  else if (match.at(2) === "Feb") monthIndex = 1;
  else if (match.at(2) === "Mar") monthIndex = 2;
  else if (match.at(2) === "Apr") monthIndex = 3;
  else if (match.at(2) === "May") monthIndex = 4;
  else if (match.at(2) === "Jun") monthIndex = 5;
  else if (match.at(2) === "Jul") monthIndex = 6;
  else if (match.at(2) === "Aug") monthIndex = 7;
  else if (match.at(2) === "Sep") monthIndex = 8;
  else if (match.at(2) === "Oct") monthIndex = 9;
  else if (match.at(2) === "Nov") monthIndex = 10;
  else if (match.at(2) === "Dec") monthIndex = 11;
  return new Date(
    Number(match.at(3)!),
    monthIndex,
    Number(match.at(1)!),
    Number(match.at(4)!),
    Number(match.at(5)!),
    Number(match.at(6)!),
    Number(match.at(7)!),
  );
}
