export function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3;
    const toRad = Math.PI / 180;

    const lat1Rad = lat1 * toRad;
    const lat2Rad = lat2 * toRad;
    const deltaLat = (lat2 - lat1) * toRad;
    const deltaLng = (lng2 - lng1) * toRad;

    const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export function findClosetLocation(currentLocation, roomList) {
    let closestRoom = null;
    let minDistance = Infinity;

    roomList.forEach(room => {
        const distance = calculateDistance(
            currentLocation.lat,
            currentLocation.lng,
            room.gpsLat,
            room.gpsLong
        );
        if (distance < minDistance) {
            minDistance = distance;
            closestRoom = room;
        }
    });

    return closestRoom;
}