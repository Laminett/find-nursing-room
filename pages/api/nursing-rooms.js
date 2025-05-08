export default async function handler(req, res) {
    const { lat, lng } = req.query;
  
    try {
      const response = await fetch(`https://sooyusil.com/api/endpoint?lat=${lat}&lng=${lng}`, {
        headers: {
          'Authorization': `Bearer ${process.env.API_KEY}`
        }
      });
  
      const data = await response.json();
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: 'API 호출 실패' });
    }
  }