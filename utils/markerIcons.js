// 수유실 마커 아이콘 (젖병 모양)
export const nursingRoomIcon = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48">
  <!-- 핀 모양 배경 -->
  <path d="M18 0C8 0 0 8 0 18c0 14 18 30 18 30s18-16 18-30C36 8 28 0 18 0z" fill="#FF6B9D"/>
  <path d="M18 2C9.2 2 2 9.2 2 18c0 12 16 26 16 26s16-14 16-26C34 9.2 26.8 2 18 2z" fill="#FF8FB3"/>
  <!-- 젖병 아이콘 -->
  <g transform="translate(9, 8)">
    <rect x="4" y="0" width="10" height="4" rx="1" fill="white"/>
    <rect x="3" y="4" width="12" height="16" rx="2" fill="white"/>
    <rect x="5" y="7" width="2" height="6" rx="1" fill="#FF6B9D" opacity="0.5"/>
    <rect x="8" y="9" width="2" height="4" rx="1" fill="#FF6B9D" opacity="0.5"/>
    <rect x="11" y="8" width="2" height="5" rx="1" fill="#FF6B9D" opacity="0.5"/>
    <ellipse cx="9" cy="22" rx="4" ry="2" fill="white"/>
  </g>
</svg>
`)}`;

// 내 위치 마커 아이콘 (사람 모양)
export const myLocationIcon = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <!-- 외부 원 (펄스 효과용) -->
  <circle cx="16" cy="16" r="14" fill="#4A90D9" opacity="0.2"/>
  <!-- 중간 원 -->
  <circle cx="16" cy="16" r="10" fill="#4A90D9" opacity="0.4"/>
  <!-- 내부 원 -->
  <circle cx="16" cy="16" r="6" fill="#4A90D9"/>
  <!-- 중심점 -->
  <circle cx="16" cy="16" r="3" fill="white"/>
</svg>
`)}`;

// 마커 크기 설정
export const MARKER_SIZE = {
    nursingRoom: { width: 36, height: 48 },
    myLocation: { width: 32, height: 32 }
};
