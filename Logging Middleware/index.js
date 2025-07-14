const TEST_SERVER_URL = 'https://your-test-server-url.com/log';

async function sendLogToServer(logEntry) {
  try {
    const response = await fetch(TEST_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logEntry),
    });

    if (!response.ok) {
      console.error('Failed to send log to Test Server:', await response.text());
    }
  } catch (error) {
    console.error('Error sending log to Test Server:', error);
  }
}

async function log(stack, level, packageName, message) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    stack,
    level,
    package: packageName,
    message
  };

  console.log(`[${logEntry.timestamp}] [${logEntry.level}] ${logEntry.stack} - ${logEntry.package}: ${logEntry.message}`);

  await sendLogToServer(logEntry);
}

export const logDebug = (stack, packageName, message) => log(stack, 'DEBUG', packageName, message);
export const logInfo = (stack, packageName, message) => log(stack, 'INFO', packageName, message);
export const logWarn = (stack, packageName, message) => log(stack, 'WARN', packageName, message);
export const logError = (stack, packageName, message) => log(stack, 'ERROR', packageName, message);
export { log };