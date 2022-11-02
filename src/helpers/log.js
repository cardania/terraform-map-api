import { styles } from './logStyles.js';

export const log = (logLevel, message, ...args) => {
  const delimeter = styles.dim(' - ');
  let logLevelMessage = styles.brand('Cardania') + delimeter;

  switch (logLevel) {
    case 'success': {
      logLevelMessage += styles.success('success');
      break;
    }
    case 'info': {
      logLevelMessage += styles.info('info');
      break;
    }
    case 'warn': {
      logLevelMessage += styles.warn('warn');
      break;
    }
    case 'error': {
      logLevelMessage += styles.error('error');
      break;
    }
    default: {
      break;
    }
  }

  console.log(`${logLevelMessage}${delimeter}${message}`, ...args);
};

export const successLog = (message, ...args) => {
  log('success', message, ...args);
};

export const infoLog = (message, ...args) => {
  log('info', message, ...args);
};

export const warnLog = (message, ...args) => {
  log('warn', message, ...args);
}

export const errorLog = (message, ...args) => {
  log('error', message, ...args);
}
