# 수유실 찾기 (Find Nursing Room)

사용자의 현재 위치를 기반으로 주변 수유실을 찾아주고, 카카오내비를 통해 길안내를 제공하는 웹 애플리케이션입니다.

## 주요 기능

- **실시간 위치 기반 검색**: GPS를 통해 현재 위치 주변 수유실 자동 검색
- **인터랙티브 지도**: 카카오맵 API를 활용한 지도 표시 및 마커 클러스터링
- **수유실 상세 정보**: 마커 클릭 시 수유실 정보 확인
- **길안내**: 카카오내비 연동으로 선택한 수유실까지 경로 안내

## 기술 스택

- **Frontend**: React 18, Next.js 13
- **Map**: Kakao Maps API, Kakao Navi
- **Backend**: Next.js API Routes
- **Data**: 수유시설 공공데이터 API
- **Deploy**: Vercel

## 프로젝트 구조

```
find-nursing-room/
├── components/          # React 컴포넌트
│   └── KakaoAdFit.js   # 카카오 애드핏 광고
├── pages/              # Next.js 페이지
│   ├── index.js        # 메인 페이지 (지도)
│   ├── privacy.js      # 개인정보 처리방침
│   └── api/            # API 라우트
│       ├── nursing-rooms.js   # 수유실 검색
│       └── coord2address.js   # 좌표→주소 변환
├── utils/              # 유틸리티 함수
│   ├── distance.js     # 거리 계산
│   ├── map.js          # 지도 관련 함수
│   ├── markerIcons.js  # 마커 아이콘 (SVG)
│   ├── rateLimit.js    # API 요청 제한
│   └── logger.js       # 로깅
└── public/             # 정적 파일
```

## 시작하기

### 필수 조건

- Node.js 18 이상
- npm 또는 yarn

### 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경 변수를 설정합니다:

```env
KAKAO_REST_API_KEY=your_kakao_rest_api_key
NEXT_PUBLIC_KAKAO_JS_KEY=your_kakao_js_key
API_KEY=your_nursing_room_api_key
```

- `KAKAO_REST_API_KEY`: [카카오 개발자 사이트](https://developers.kakao.com/)에서 발급
- `NEXT_PUBLIC_KAKAO_JS_KEY`: 카카오맵 JavaScript SDK용 키
- `API_KEY`: [공공데이터포털](https://www.data.go.kr/)에서 수유시설 API 키 발급

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

개발 서버는 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## API 엔드포인트

### POST /api/nursing-rooms

현재 위치 기반 주변 수유실 검색

**Request Body:**
```json
{
  "lat": 37.5403,
  "lng": 127.0132
}
```

**Response:**
```json
{
  "success": true,
  "nursingRoomSearchList": [...]
}
```

### GET /api/coord2address

좌표를 주소로 변환

**Query Parameters:**
- `lat`: 위도
- `lng`: 경도

## 라이선스

MIT License - [LICENSE](./LICENSE) 파일 참조

## 저작권

Copyright (c) 2025 Laminett
