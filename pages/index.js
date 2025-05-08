import { useState } from 'react';

export default function Home() {
  const [location, setLocation] = useState(null);
  const [data, setData] = useState(null);

  const findNursingRooms = () => {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setLocation({ lat, lng });

      fetch(`/api/nursing-rooms?lat=${lat}&lng=${lng}`)
        .then(res => res.json())
        .then(setData)
        .catch(err => console.error(err));
    });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>가까운 수유실 찾기</h1>
      <button onClick={findNursingRooms}>내 위치로 찾기</button>
      {data && <pre style={{ marginTop: '1rem' }}>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}