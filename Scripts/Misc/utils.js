function generateUUID() {
  return crypto.randomUUID();
}

function nearestMultiple(x, multiple) {
    return Math.round(x / multiple) * multiple;
  }

function formatHistoryTimeStamp(timestamp) {
  const date = new Date(timestamp);
  const currentDate = new Date();

  const timeDiff = currentDate.getTime() - date.getTime();
  const secondsDiff = Math.floor(timeDiff / 1000);
  const minutesDiff = Math.floor(secondsDiff / 60);
  const hoursDiff = Math.floor(minutesDiff / 60);
  const daysDiff = Math.floor(hoursDiff / 24);
  const monthsDiff = Math.floor(daysDiff / 30);

  if (monthsDiff > 0) {
    return "over a month ago";
  } else if (daysDiff > 0) {
    return `${daysDiff} day${daysDiff > 1 ? "s" : ""} ago`;
  } else if (hoursDiff > 0) {
    return `${hoursDiff} hour${hoursDiff > 1 ? "s" : ""} ago`;
  } else if (minutesDiff > 0) {
    return `${minutesDiff} minute${minutesDiff > 1 ? "s" : ""} ago`;
  } else {
    return "< 1 min.";
  }
}

function callFunctionEveryMinuteOnTheMinute(callback) {
  if (typeof callback !== 'function') {
      throw new Error('The callback provided is not a function');
  }

  const now = new Date();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();
  const delay = ((60 - seconds) * 1000) - milliseconds;

  setTimeout(function() {
      // Call the provided function immediately, and then set it to be called every minute
      callback();
      setInterval(callback, 60000);
  }, delay);
}


export { nearestMultiple, generateUUID, formatHistoryTimeStamp, callFunctionEveryMinuteOnTheMinute};