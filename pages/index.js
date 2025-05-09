// pages/index.js - 카카오 지도 + 네이버 지도 동시에 표시
import { useEffect, useRef, useState } from 'react';

export default function Home() {
    const kakaoMapRef = useRef(null);
    const naverMapRef = useRef(null);
    const [location, setLocation] = useState(null);

    // 위치 정보 받아오기
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setLocation({ lat, lng });
            },
            () => {
                alert('위치 정보를 가져올 수 없습니다.');
            }
        );
    }, []);

    // 카카오맵 로딩
    useEffect(() => {
        if (!location) return;

        const script = document.createElement('script');
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=f8d5e95a983fc9b3d4077bcddf5f3d13&autoload=false`;
        script.onload = () => {
            window.kakao.maps.load(() => {
                const map = new window.kakao.maps.Map(kakaoMapRef.current, {
                    center: new window.kakao.maps.LatLng(location.lat, location.lng),
                    level: 3
                });
                new window.kakao.maps.Marker({
                    map,
                    position: new window.kakao.maps.LatLng(location.lat, location.lng),
                    title: '내 위치'
                });
            });
        };
        document.head.appendChild(script);
    }, [location]);

    // 네이버맵 로딩
    useEffect(() => {
        if (!location) return;

        const script = document.createElement('script');
        script.src = "https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=fij7b2p6tq";
        script.async = true;
        script.onload = () => {
            const map = new window.naver.maps.Map(naverMapRef.current, {
                center: new window.naver.maps.LatLng(location.lat, location.lng),
                zoom: 15
            });
            new window.naver.maps.Marker({
                map,
                position: new window.naver.maps.LatLng(location.lat, location.lng),
                title: '내 위치'
            });
        };
        document.head.appendChild(script);
    }, [location]);

    return (
        <div style={{ display: 'flex', width: '100%', height: '100vh' }}>
            <div ref={kakaoMapRef} style={{ width: '50%', height: '100%' }} />
            <div ref={naverMapRef} style={{ width: '50%', height: '100%' }} />
        </div>
    );
}
