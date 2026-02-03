import { limiter } from '../../utils/rateLimit';
import { logger } from '../../utils/logger';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate Limiting
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const { success, remaining } = limiter.check(ip);

  if (!success) {
    return res.status(429).json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' });
  }

  res.setHeader('X-RateLimit-Remaining', remaining);

  const { lat, lng } = req.body;

  // 입력 검증
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ error: '잘못된 좌표입니다.' });
  }

  if (lat < 33 || lat > 43 || lng < 124 || lng > 132) {
    return res.status(400).json({ error: '한국 범위 외의 좌표입니다.' });
  }

  try {
    const response = await fetch(`https://sooyusil.com/home/searchRoomList.do`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'mylat': lat,
        'mylng': lng,
        'searchKeyword': '(내주변검색)'
      })
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    logger.error('nursing-rooms-api', err, { lat, lng });
    res.status(500).json({ error: 'API 호출 실패' });
  }
}