import { limiter } from '../../utils/rateLimit';
import { logger } from '../../utils/logger';

export default async function handler(req, res) {
    // Rate Limiting
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const { success, remaining } = limiter.check(ip);

    if (!success) {
        return res.status(429).json({ error: '요청이 너무 많습니다.' });
    }

    res.setHeader('X-RateLimit-Remaining', remaining);

    const { lat, lng } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ error: 'Missing lat or lng' });
    }

    // 입력 검증
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
        return res.status(400).json({ error: '잘못된 좌표입니다.' });
    }

    if (latNum < 33 || latNum > 43 || lngNum < 124 || lngNum > 132) {
        return res.status(400).json({ error: '한국 범위 외의 좌표입니다.' });
    }

    try {
        const kakaoRes = await fetch(
            `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`,
            {
                headers: {
                    Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
                },
            }
        );

        if (!kakaoRes.ok) {
            return res.status(kakaoRes.status).json({ error: 'Kakao API error' });
        }

        const data = await kakaoRes.json();
        return res.status(200).json(data);
    } catch (error) {
        logger.error('coord2address-api', error, { lat, lng });
        return res.status(500).json({ error: 'Server error' });
    }
}