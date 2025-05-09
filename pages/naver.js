// pages/index.js (네이버 지도 버전)
import { useEffect, useRef, useState } from 'react';

export default function Home() {
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);
    const [location, setLocation] = useState(null);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=YOUR_NCP_CLIENT_ID`;
        script.async = true;
        script.onload = () => initMap();
        document.head.appendChild(script);
    }, []);

    const initMap = () => {
        if (!navigator.geolocation) {
            alert('이 브라우저에서는 위치 정보가 지원되지 않습니다.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setLocation({ lat, lng });

                const map = new naver.maps.Map(mapContainerRef.current, {
                    center: new naver.maps.LatLng(lat, lng),
                    zoom: 15
                });

                mapRef.current = map;

                new naver.maps.Marker({
                    position: new naver.maps.LatLng(lat, lng),
                    map,
                    title: '내 위치'
                });
            },
            () => {
                alert('위치 정보를 가져올 수 없습니다.');
            }
        );
    };

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
}
