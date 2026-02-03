// pages/index.js
import { useEffect, useRef, useState } from 'react';
import { findClosetLocation } from '../utils/distance';
import { calculateBounds, fitMapToBounds } from '../utils/map';
import KakaoAdFit from '../components/KakaoAdFit';

// 카카오 애드핏 광고 단위 ID
const ADFIT_UNIT_ID = 'DAN-M2uffRhPeDZn1Vnj';

export default function Home() {
    const kakaoMapRef = useRef(null);
    const [location, setLocation] = useState(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [locationDenied, setLocationDenied] = useState(false);
    const markerPoolRef = useRef([]);
    const markerListenersRef = useRef(new Set());
    const infoWindowRef = useRef(null);
    const clustererRef = useRef(null);
    const isFirstFetchRef = useRef(true);
    const debounceRef = useRef(null);
    const lastRequestedCenterRef = useRef(null);

    const handleNavigate = (room) => {
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
    };

    const fetchNursingRooms = async (center, shouldAdjustBounds = false) => {
        const map = kakaoMapRef.current?.__kakaoMapInstance;
        if (!map) return;

        const requestData = {
            lat: center.getLat(),
            lng: center.getLng(),
            radius: 5000
        };

        lastRequestedCenterRef.current = `${center.getLat().toFixed(5)}_${center.getLng().toFixed(5)}`;
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/nursing-rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

            if (!res.ok) {
                throw new Error('서버 오류가 발생했습니다.');
            }

            const data = await res.json();
            const currentCenter = map.getCenter();
            const currentKey = `${currentCenter.getLat().toFixed(5)}_${currentCenter.getLng().toFixed(5)}`;

            if (lastRequestedCenterRef.current !== currentKey) {
                return;
            }

            const rooms = data.nursingRoomSearchList || [];

            if (rooms.length === 0) {
                setError('주변에 수유실이 없습니다. 지도를 이동해보세요.');
                setIsLoading(false);
                return;
            }

            if (clustererRef.current) clustererRef.current.clear();

            markerListenersRef.current.forEach(({ marker, listener }) => {
                window.kakao.maps.event.removeListener(marker, 'click', listener);
            });
            markerListenersRef.current.clear();

            const bounds = new window.kakao.maps.LatLngBounds();
            const markers = rooms.map((room, i) => {
                const position = new window.kakao.maps.LatLng(room.gpsLat, room.gpsLong);

                let marker = markerPoolRef.current[i];
                if (!marker) {
                    marker = new window.kakao.maps.Marker({ title: room.roomName });
                    markerPoolRef.current[i] = marker;
                }

                marker.setPosition(position);
                marker.setMap(null);
                bounds.extend(position);

                const clickListener = () => {
                    const content = `
                        <div style="padding:10px; font-size:13px; min-width:150px;">
                            <strong>${room.roomName}</strong><br/>
                            ${room.location ?? ''}<br/>
                            <button onclick="window.__handleNavigate(${JSON.stringify(room).replace(/"/g, '&quot;')})"
                                style="margin-top:8px; padding:5px 10px; background:#fee500; border:none; border-radius:4px; cursor:pointer;">
                                길안내
                            </button>
                        </div>`;

                    if (!infoWindowRef.current) {
                        infoWindowRef.current = new window.kakao.maps.InfoWindow();
                    }
                    infoWindowRef.current.setContent(content);
                    infoWindowRef.current.open(map, marker);
                };

                window.kakao.maps.event.addListener(marker, 'click', clickListener);
                markerListenersRef.current.add({ marker, listener: clickListener });

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
                    const adjustBounds = new window.kakao.maps.LatLngBounds();
                    const currentPos = new window.kakao.maps.LatLng(requestData.lat, requestData.lng);
                    const closestPos = new window.kakao.maps.LatLng(closest.gpsLat, closest.gpsLong);

                    adjustBounds.extend(currentPos);
                    adjustBounds.extend(closestPos);
                    map.setBounds(adjustBounds);
                }
            }
        } catch (err) {
            console.error('수유실 api 호출 실패', err);
            setError('수유실 정보를 불러오는데 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        window.__handleNavigate = (room) => handleNavigate(room);
        return () => { delete window.__handleNavigate; };
    }, []);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => {
                setLocationDenied(true);
                setLocation({ lat: 37.540318, lng: 127.013213 });
            }
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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100dvh', minHeight: '-webkit-fill-available' }}>
            <div style={{ position: 'relative', flex: 1 }}>
                <div ref={kakaoMapRef} style={{ width: '100%', height: '100%' }} />

            {isLoading && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(255,255,255,0.9)',
                    padding: '15px 25px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    zIndex: 1000
                }}>
                    수유실 검색 중...
                </div>
            )}

            {error && (
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#ff6b6b',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    maxWidth: '80%',
                    textAlign: 'center'
                }}>
                    {error}
                </div>
            )}

            {locationDenied && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#ffeaa7',
                    color: '#2d3436',
                    padding: '10px 15px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    fontSize: '13px',
                    maxWidth: '90%',
                    textAlign: 'center'
                }}>
                    위치 권한이 거부되어 기본 위치(서울)로 표시됩니다.
                </div>
            )}

                <a
                    href="/privacy"
                    style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        background: 'rgba(255,255,255,0.8)',
                        color: '#666',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        textDecoration: 'none',
                        zIndex: 1000
                    }}
                >
                    개인정보 처리방침
                </a>
            </div>

            {/* 하단 광고 배너 */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#f5f5f5',
                padding: '5px 0',
                borderTop: '1px solid #ddd'
            }}>
                <KakaoAdFit unit={ADFIT_UNIT_ID} width={320} height={50} />
            </div>
        </div>
    );
}