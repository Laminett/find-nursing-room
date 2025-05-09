// pages/index.js - 카카오 지도 + 네이버 지도 동시에 표시
import { useEffect, useRef, useState } from 'react';

export default function Home() {
    const kakaoMapRef = useRef(null);
    const naverMapRef = useRef(null);
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState(null);

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

    useEffect(() => {
        if (!location) return;

        const fetchAddress = async () => {
            try {
                const res = await fetch(`/api/coord2address?lat=${location.lat}&lng=${location.lng}`);
                const data = await res.json();
                const found = data.documents?.[0];

                setAddress(
                    found?.road_address?.address_name || found?.address?.address_name || '주소없음'
                );
            } catch (err) {
                console.log('주소 가져오기 실패', err);
            }
        };
        fetchAddress();
    }, [location]);


    return (
        <div style={{ display: 'flex', width: '100%', height: '100vh' }}>
            <div ref={kakaoMapRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
}
