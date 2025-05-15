// pages/index.js
import { useEffect, useRef, useState } from 'react';
import { findClosetLocation } from '../utils/distance';
import { calculateBounds, fitMapToBounds } from '../utils/map';

export default function Home() {
    const kakaoMapRef = useRef(null);
    const [location, setLocation] = useState(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const markerPoolRef = useRef([]);
    const infoWindowRef = useRef(null);
    const clustererRef = useRef(null);
    const isFirstFetchRef = useRef(true);
    const debounceRef = useRef(null);
    const lastRequestedCenterRef = useRef(null);

    const fetchNursingRooms = async (center, shouldAdjustBounds = false) => {
        const map = kakaoMapRef.current?.__kakaoMapInstance;
        if (!map) return;

        const requestData = {
            lat: center.getLat(),
            lng: center.getLng(),
            radius: 5000
        };

        lastRequestedCenterRef.current = `${center.getLat().toFixed(5)}_${center.getLng().toFixed(5)}`;

        try {
            const res = await fetch('/api/nursing-rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

            const data = await res.json();
            const currentCenter = map.getCenter();
            const currentKey = `${currentCenter.getLat().toFixed(5)}_${currentCenter.getLng().toFixed(5)}`;

            if (lastRequestedCenterRef.current !== currentKey) {
                return;
            }

            const rooms = data.nursingRoomSearchList;

            if (clustererRef.current) clustererRef.current.clear();

            const bounds = new window.kakao.maps.LatLngBounds();
            const markers = rooms.map((room, i) => {
                const position = new window.kakao.maps.LatLng(room.gpsLat, room.gpsLong);

                let marker = markerPoolRef.current[i];
                if (!marker) {
                    marker = new window.kakao.maps.Marker({ title: room.roomName });
                    markerPoolRef.current[i] = marker;
                }

                marker.setPosition(position);
                marker.setMap(null); // 클러스터러에 의해 표시됨
                bounds.extend(position);

                window.kakao.maps.event.addListener(marker, 'click', () => {
                    const content = `
                        <div style="padding:5px; font-size:13px;">
                            <strong>${room.roomName}</strong><br/>
                            ${room.location ?? ''}<br/>
                            <button id="navigate-btn-${room.roomNo}" style="margin-top:5px;">안내하기</button>
                        </div>`;

                    if (!infoWindowRef.current) {
                        infoWindowRef.current = new window.kakao.maps.InfoWindow();
                    }
                    infoWindowRef.current.setContent(content);
                    infoWindowRef.current.open(map, marker);

                    setTimeout(() => {
                        const btn = document.getElementById(`navigate-btn-${room.roomNo}`);
                        if (btn) {
                            btn.addEventListener('click', () => {
                                if (window.Kakao?.Navi) {
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
                });

                return marker;
            });

            if (clustererRef.current) {
                clustererRef.current.addMarkers(markers);
            }

            if (shouldAdjustBounds && rooms.length > 0) {
                const closest = findClosetLocation(
                    { lat: requestData.lat, lng: requestData.lng },
                    rooms
                );

                if (closest) {
                    const bounds = new window.kakao.maps.LatLngBounds();

                    const currentPos = new window.kakao.maps.LatLng(requestData.lat, requestData.lng);
                    const closestPos = new window.kakao.maps.LatLng(closest.gpsLat, closest.gpsLong);

                    bounds.extend(currentPos);
                    bounds.extend(closestPos);

                    map.setBounds(bounds); // 👈 여기서 fitMapToBounds 대신 setBounds를 직접 써도 됩니다
                }
            }
        } catch (err) {
            console.error('수유실 api 호출 실패', err);
        }
    };

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => setLocation({ lat: 37.540318, lng: 127.013213 })
        );
    }, []);

    useEffect(() => {
        if (!location) return;

        const script = document.createElement('script');
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&autoload=false&libraries=clusterer`;
        script.onload = () => {
            window.kakao.maps.load(() => {
                const map = new window.kakao.maps.Map(kakaoMapRef.current, {
                    center: new window.kakao.maps.LatLng(location.lat, location.lng),
                    level: 3
                });

                kakaoMapRef.current.__kakaoMapInstance = map;

                clustererRef.current = new window.kakao.maps.MarkerClusterer({
                    map,
                    averageCenter: true,
                    minLevel: 7
                });

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

    useEffect(() => {
        if (!mapLoaded || !location) return;
        const map = kakaoMapRef.current.__kakaoMapInstance;
        if (!map) return;

        fetchNursingRooms(map.getCenter(), true);
    }, [mapLoaded, location]);

    useEffect(() => {
        if (!mapLoaded) return;
        const map = kakaoMapRef.current?.__kakaoMapInstance;
        if (!map) return;

        const onIdle = () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);

            debounceRef.current = setTimeout(() => {
                const map = kakaoMapRef.current.__kakaoMapInstance;
                if (!map) return;


                if (isFirstFetchRef.current) {
                    isFirstFetchRef.current = false;
                    return;
                }
                fetchNursingRooms(map.getCenter(), false);
            }, 300);
        };

        const listener = window.kakao.maps.event.addListener(map, 'idle', onIdle);
        return () => window.kakao.maps.event.removeListener(listener);
    }, [mapLoaded]);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.4.0/kakao.min.js';
        script.async = true;
        script.onload = () => {
            if (window.Kakao && !window.Kakao.isInitialized()) {
                window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
            }
        };
        document.head.appendChild(script);
    }, []);

    return <div ref={kakaoMapRef} style={{ width: '100%', height: '100vh' }} />;
}