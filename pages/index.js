// pages/index.js - 카카오 지도 + 네이버 지도 동시에 표시
import { useEffect, useRef, useState } from 'react';

export default function Home() {
    const kakaoMapRef = useRef(null);
    const naverMapRef = useRef(null);
    const [markers, setMarkers] = useState([]);
    const [location, setLocation] = useState(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const polylineRef = useRef(null);
    const [selectedDestination, setSelectedDestination] = useState(null);
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

    // geo position 기반으로 주소값 추출
    // useEffect(() => {
    //     if (!location) return;

    //     const fetchAddress = async () => {
    //         try {
    //             const res = await fetch(`/api/coord2address?lat=${location.lat}&lng=${location.lng}`);
    //             const data = await res.json();
    //             const found = data.documents?.[0];

    //             setAddress(
    //                 found?.road_address?.address_name || found?.address?.address_name || '주소없음'
    //             );
    //         } catch (err) {
    //             console.log('주소 가져오기 실패', err);
    //         }
    //     };
    //     fetchAddress();
    // }, [location]);

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
            const encodedName = encodeURIComponent(room.roomName || '목적지');
            const deepLink = `kakaonavi://navigate?name=${encodedName}&x=${Number(room.gpsLong)}&y=${Number(room.gpsLat)}&coordType=wgs84`;

            const content = document.createElement('div');
            content.innerHTML = `
            <div style="padding:5px; font-size:13px;">
                <strong>${room.roomName}</strong><br/>
                ${room.location ?? ''}<br/>
                <a href="${deepLink}" target="_blank" rel="noopener noreferrer" style="color:blue; text-decoration:underline;">카카오내비로 열기</a>
            </div>`;

            const infoWindow = new window.kakao.maps.InfoWindow({ content });
            // const infoWindow = new window.kakao.maps.InfoWindow({
            //     content: `<div style="padding:5px; font-size:13px; max-width: 200px;">
            //                                 <strong>${room.roomName}</strong><br/>
            //                                 ${room.location ?? ''}<br/>
            //     <button onclick="location.href='kakaonavi://navigate?name=${encodeURIComponent(room.roomName)}&x=${Number(room.gpsLong)}&y=${Number(room.gpsLat)}'" 
            //         style="margin-top:5px;padding:4px 8px;font-size:12px;border:none;background:#007AFF;color:#fff;border-radius:4px;cursor:pointer;">
            //     카카오내비로 길안내
            // </button>
            //                             </div>`
            // });

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

                    if (polylineRef.current) polylineRef.current.setMap(null);

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

                    // setSelectedDestination(room);
                } catch (err) {
                    console.log('길찾기 API 실패', err);
                }
            });
        });
    }, [markers, location]);

    return (
        <div style={{ display: 'flex', width: '100%', height: '100vh' }}>
            <div ref={kakaoMapRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
    // return (
    //     <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
    //         <div ref={kakaoMapRef} style={{ width: '100%', height: '100%' }} />
    //         {selectedDestination && (
    //             <button
    //                 onClick={() => {
    //                     const { gpsLat, gpsLong, roomName } = selectedDestination;
    //                     window.location.href = `kakaonavi://navigate?coord_type=wgs84&dest_lat=${gpsLat}&dest_lng=${gpsLong}&dest_name=${encodeURIComponent(roomName)}`;
    //                 }}
    //                 style={{
    //                     position: 'absolute',
    //                     bottom: '20px',
    //                     left: '50%',
    //                     transform: 'translateX(-50%)',
    //                     padding: '10px 20px',
    //                     fontSize: '14px',
    //                     zIndex: 999,
    //                     background: '#FAE100',
    //                     border: 'none',
    //                     borderRadius: '8px',
    //                     cursor: 'pointer'
    //                 }}
    //             >
    //                 카카오내비로 길안내
    //             </button>
    //         )}
    //     </div>
    // );
}
