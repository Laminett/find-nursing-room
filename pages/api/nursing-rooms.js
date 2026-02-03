export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lat, lng, radius } = req.body;

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
    res.status(500).json({ error: 'API 호출 실패' });
  }
}