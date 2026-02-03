// 간단한 에러 로깅 유틸리티
// 추후 Sentry 등으로 교체 가능

export const logger = {
    error: (context, error, meta = {}) => {
        const logData = {
            timestamp: new Date().toISOString(),
            level: 'error',
            context,
            message: error?.message || error,
            stack: error?.stack,
            ...meta
        };

        console.error(JSON.stringify(logData));

        // Sentry 연동 시 여기에 추가
        // if (typeof window !== 'undefined' && window.Sentry) {
        //     window.Sentry.captureException(error, { extra: meta });
        // }
    },

    warn: (context, message, meta = {}) => {
        const logData = {
            timestamp: new Date().toISOString(),
            level: 'warn',
            context,
            message,
            ...meta
        };

        console.warn(JSON.stringify(logData));
    },

    info: (context, message, meta = {}) => {
        const logData = {
            timestamp: new Date().toISOString(),
            level: 'info',
            context,
            message,
            ...meta
        };

        console.log(JSON.stringify(logData));
    }
};
