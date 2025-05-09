import { useEffect, useRef, useState } from 'react';

export default function Home() {
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [location, setLocation] = useState(null);
    const [nursingRooms, setNursingRooms] = useState([]);
    const [data, setData] = useState(null);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=f8d5e95a983fc9b3d4077bcddf5f3d13&autoload=false`;
        script.onload = () => {
            window.kakao.maps.load(() => setMapLoaded(true));
        };
        document.head.appendChild(script);
    }, []);

    // 현재 위치 요청
    useEffect(() => {
        if (!mapLoaded) return;

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setLocation({ lat, lng });

                // 지도 랜더링
                const container = mapContainerRef.current;
                const options = {
                    center: new window.kakao.maps.LatLng(lat, lng),
                    level: 3
                };
                const map = new window.kakao.maps.Map(container, options);
                mapRef.current = map;

                // 내 위치 마커표시
                new window.kakao.maps.Marker({
                    map,
                    position: new window.kakao.maps.LatLng(lat, lng),
                    title: '내 위치'
                });

                // TODO 수유실 데이터 요청

            },
            (err) => {
                alert('위치 정보를 가져올 수 없습니다. 위치 권한을 허용해주세요');
            }
        )
    }, [mapLoaded]);

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

    //   return (
    //     <div style={{ padding: '2rem' }}>
    //       <h1>가까운 수유실 찾기</h1>
    //       <button onClick={findNursingRooms}>내 위치로 찾기</button>
    //       {data && <pre style={{ marginTop: '1rem' }}>{JSON.stringify(data, null, 2)}</pre>}
    //     </div>
    //   );

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
}