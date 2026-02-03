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

// 내 위치 마커 아이콘 (아기 모양)
export const myLocationIcon = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
  <!-- 배경 원 -->
  <circle cx="20" cy="20" r="18" fill="#FFE4B5" stroke="#FFB347" stroke-width="2"/>
  <!-- 얼굴 -->
  <circle cx="20" cy="18" r="10" fill="#FFDBAC"/>
  <!-- 머리카락 -->
  <ellipse cx="20" cy="11" rx="8" ry="4" fill="#8B4513"/>
  <circle cx="14" cy="10" r="2" fill="#8B4513"/>
  <circle cx="26" cy="10" r="2" fill="#8B4513"/>
  <!-- 볼터치 -->
  <circle cx="13" cy="19" r="2" fill="#FFB6C1" opacity="0.6"/>
  <circle cx="27" cy="19" r="2" fill="#FFB6C1" opacity="0.6"/>
  <!-- 눈 -->
  <circle cx="16" cy="17" r="1.5" fill="#333"/>
  <circle cx="24" cy="17" r="1.5" fill="#333"/>
  <!-- 입 -->
  <path d="M17 22 Q20 25 23 22" stroke="#333" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <!-- 몸통 -->
  <ellipse cx="20" cy="32" rx="8" ry="6" fill="#87CEEB"/>
</svg>
`)}`;

// 마커 크기 설정
export const MARKER_SIZE = {
    nursingRoom: { width: 36, height: 48 },
    myLocation: { width: 40, height: 40 }
};
