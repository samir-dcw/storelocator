export function createLogger(name) {
  return {
    info(message, context = {}) {
      console.log(JSON.stringify({ level: 'info', name, message, ...context }));
    },
    warn(message, context = {}) {
      console.warn(JSON.stringify({ level: 'warn', name, message, ...context }));
    },
    error(message, context = {}) {
      console.error(JSON.stringify({ level: 'error', name, message, ...context }));
    },
  };
}
