// 간단한 인메모리 Rate Limiter
const rateLimit = (options = {}) => {
    const { interval = 60 * 1000, uniqueTokenPerInterval = 500, limit = 10 } = options;

    const tokenCache = new Map();

    // 주기적으로 만료된 토큰 정리
    setInterval(() => {
        const now = Date.now();
        for (const [key, data] of tokenCache.entries()) {
            if (now - data.timestamp > interval) {
                tokenCache.delete(key);
            }
        }
    }, interval);

    return {
        check: (token) => {
            const now = Date.now();
            const tokenData = tokenCache.get(token);

            if (!tokenData) {
                tokenCache.set(token, { count: 1, timestamp: now });
                return { success: true, remaining: limit - 1 };
            }

            if (now - tokenData.timestamp > interval) {
                tokenCache.set(token, { count: 1, timestamp: now });
                return { success: true, remaining: limit - 1 };
            }

            if (tokenData.count >= limit) {
                return { success: false, remaining: 0 };
            }

            tokenData.count++;
            return { success: true, remaining: limit - tokenData.count };
        }
    };
};

// 분당 30회 제한
export const limiter = rateLimit({
    interval: 60 * 1000,
    limit: 30
});
