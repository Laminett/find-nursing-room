export default async function handler(req, res) {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ error: 'Missing lat or lng' });
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
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
}