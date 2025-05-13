export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { origin, destination } = req.body;

    try {
        const url = `https://apis-navi.kakaomobility.com/v1/directions?origin=${Number(origin.x)},${Number(origin.y)}&destination=${Number(destination.x)},${Number(destination.y)}&priority=RECOMMEND&car_fuel=GASOLINE&car_hipass=true&alternatives=true&road_details=true`

        const kakaoRes = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await kakaoRes.json();
        res.status(200).json(data);
    } catch (err) {
        console.error('길찾기 API 호출 실패', err);
        res.status(500).json({ error: 'Failed to fetch directions' });
    }
}