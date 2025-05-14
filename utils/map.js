export function calculateBounds(location1, location2) {
    const southWest = {
        lat: Math.min(location1.lat, location2.lat),
        lng: Math.min(location1.lng, location2.lng)
    };

    const northEast = {
        lat: Math.max(location1.lat, location2.lat),
        lng: Math.max(location1.lng, location2.lng)
    };

    return new window.kakao.maps.LatLngBounds(
        new window.kakao.maps.LatLng(southWest.lat, southWest.lng),
        new window.kakao.maps.LatLng(northEast.lat, northEast.lng)
    );
}

export function fitMapToBounds(map, bounds) {
    if (map && bounds) {
        map.setBounds(bounds);
    }
}

export function calculateZoomLevel(distanceMeters) {
    if (distanceMeters < 200) return 3;
    if (distanceMeters < 300) return 4;
    if (distanceMeters < 500) return 5;
    if (distanceMeters < 1000) return 6;
    if (distanceMeters < 2000) return 7;
    if (distanceMeters < 4000) return 8;
    if (distanceMeters < 8000) return 9;
    if (distanceMeters < 15000) return 10;
    return 11;
}