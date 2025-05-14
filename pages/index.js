// pages/index.js - 카카오 지도 + 네이버 지도 동시에 표시
import { useEffect, useRef, useState } from 'react';
import { calculateDistance, findClosetLocation } from '../utils/distance';
import { calculateBounds, fitMapToBounds } from '../utils/map';

export default function Home() {
    const kakaoMapRef = useRef(null);
    const naverMapRef = useRef(null);
    const [markers, setMarkers] = useState([]);
    const [location, setLocation] = useState(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const polylineRef = useRef(null);

    // 위치 정보 받아오기
    useEffect(() => {
        const defaultGeoLocation = { lat: 37.540318, lng: 127.013213 };

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setLocation({ lat, lng });
            },
            () => {
                setLocation({ lat, lng });
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

                kakaoMapRef.current.__kakaoMapInstance = map;

                const markerImage = new window.kakao.maps.MarkerImage(
                    'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                    new window.kakao.maps.Size(23, 35)
                );

                new window.kakao.maps.Marker({
                    map,
                    position: new window.kakao.maps.LatLng(location.lat, location.lng),
                    title: '내 위치',
                    image: markerImage
                });

                setMapLoaded(true);
            });
        };
        document.head.appendChild(script);
    }, [location]);

    // 수유실 API 호출
    useEffect(() => {
        if (!location || !mapLoaded || !kakaoMapRef.current) return;

        const map = kakaoMapRef.current.__kakaoMapInstance;
        if (!map) return;

        const fetchNursingRooms = async () => {
            try {
                const requestData = {
                    lat: location.lat,
                    lng: location.lng,
                    radius: 5000
                }

                const res = await fetch(`/api/nursing-rooms`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                })

                const data = await res.json();

                const closest = findClosetLocation(location, data.nursingRoomSearchList);
                if (closest) {
                    const bounds = calculateBounds(location, { lat: closest.gpsLat, lng: closest.gpsLong });
                    fitMapToBounds(map, bounds);
                }

                const newMarkers = data.nursingRoomSearchList.map((room) => {
                    const marker = new window.kakao.maps.Marker({
                        map,
                        position: new window.kakao.maps.LatLng(room.gpsLat, room.gpsLong),
                        title: room.roomName
                    });

                    return { marker, room };
                });

                setMarkers(newMarkers);
            } catch (err) {
                console.log('수유실 api 호출 실패');
            }
        };
        fetchNursingRooms();
    }, [location, mapLoaded]);

    useEffect(() => {
        if (!markers.length || !location || !kakaoMapRef.current) return;

        const map = kakaoMapRef.current.__kakaoMapInstance;
        let openInfoWindow = null;

        markers.forEach(({ marker, room }) => {

            const content = document.createElement('div');
            content.innerHTML = `
                <div style="padding:5px; font-size:13px;">
                    <strong>${room.roomName}</strong><br/>
                    ${room.location ?? ''}<br/>
                    <button id="navigate-btn-${room.roomNo}" style="margin-top:5px;">안내하기</button>
                </div>`;

            const infoWindow = new window.kakao.maps.InfoWindow({ content });

            window.kakao.maps.event.addListener(marker, 'click', async () => {
                if (openInfoWindow) openInfoWindow.close();
                infoWindow.open(map, marker);
                openInfoWindow = infoWindow;

                try {
                    const res = await fetch(`/api/directions`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            origin: { x: location.lng, y: location.lat },
                            destination: { x: room.gpsLong, y: room.gpsLat }
                        })
                    });

                    const data = await res.json();

                    const roads = data.routes?.[0]?.sections?.[0]?.roads || [];
                    const path = [];

                    roads.forEach((road) => {
                        const vertexes = road.vertexes;
                        for (let i = 0; i < vertexes.length; i += 2) {
                            path.push(new window.kakao.maps.LatLng(vertexes[i + 1], vertexes[i]));
                        }
                    })

                    if (polylineRef.current) {
                        polylineRef.current.setMap(null);
                        polylineRef.current = null;
                    }

                    const polyline = new window.kakao.maps.Polyline({
                        map,
                        path,
                        strokeWeight: 5,
                        strokeColor: '#007AFF',
                        strokeOpacity: 0.9,
                        strokeStyle: 'solid'
                    });
                    polyline.setMap(map);
                    polylineRef.current = polyline;

                    setTimeout(() => {
                        const btn = document.getElementById(`navigate-btn-${room.roomNo}`)
                        if (btn) {
                            btn.addEventListener('click', () => {
                                if (window.Kakao && window.Kakao.Navi) {
                                    window.Kakao.Navi.start({
                                        name: room.roomName,
                                        x: Number(room.gpsLong),
                                        y: Number(room.gpsLat),
                                        coordType: 'wgs84'
                                    });
                                } else {
                                    alert('카카오내비를 사용할 수 없습니다.');
                                }
                            });
                        }
                    }, 100);
                } catch (err) {
                    console.log('길찾기 API 실패', err);
                }
            });
        });
    }, [markers, location]);

    // 카카오 내비 SDK 로드
    useEffect(() => {
        const script = document.createElement('script');
        script.src = `https://t1.kakaocdn.net/kakao_js_sdk/2.4.0/kakao.min.js`;
        script.async = true;
        script.onload = () => {
            if (window.Kakao && !window.Kakao.isInitialized()) {
                window.Kakao.init('f8d5e95a983fc9b3d4077bcddf5f3d13');
            }
        };
        document.head.appendChild(script);
    }, []);

    return (
        <div style={{ display: 'flex', width: '100%', height: '100vh' }}>
            <div ref={kakaoMapRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );

}
