export default function Privacy() {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', lineHeight: '1.8' }}>
            <h1>개인정보 처리방침</h1>

            <p>본 서비스는 수유실 찾기 서비스를 제공하기 위해 아래와 같이 개인정보를 처리합니다.</p>

            <h2>1. 수집하는 개인정보</h2>
            <ul>
                <li><strong>위치 정보</strong>: 주변 수유실 검색을 위해 사용자의 현재 위치(GPS 좌표)를 수집합니다.</li>
            </ul>

            <h2>2. 개인정보의 이용 목적</h2>
            <ul>
                <li>사용자 위치 기반 주변 수유실 검색</li>
                <li>수유실까지의 길안내 서비스 제공</li>
            </ul>

            <h2>3. 개인정보의 보유 및 이용 기간</h2>
            <p>위치 정보는 서버에 저장되지 않으며, 검색 요청 시에만 일시적으로 사용됩니다.</p>

            <h2>4. 제3자 제공</h2>
            <p>본 서비스는 아래 제3자 서비스를 이용합니다:</p>
            <ul>
                <li><strong>카카오맵 API</strong>: 지도 표시 및 길안내</li>
                <li><strong>수유시설 공공데이터</strong>: 수유실 정보 조회</li>
            </ul>

            <h2>5. 이용자의 권리</h2>
            <ul>
                <li>브라우저 설정에서 위치 권한을 거부할 수 있습니다.</li>
                <li>위치 권한 거부 시 기본 위치(서울)로 서비스가 제공됩니다.</li>
            </ul>

            <h2>6. 연락처</h2>
            <p>개인정보 관련 문의사항은 아래로 연락해주세요.</p>
            <ul>
                <li>이메일: [이메일 주소를 입력하세요]</li>
            </ul>

            <p style={{ marginTop: '40px', color: '#666', fontSize: '14px' }}>
                최종 수정일: 2025년 2월
            </p>

            <div style={{ marginTop: '30px' }}>
                <a href="/" style={{ color: '#3498db' }}>← 메인으로 돌아가기</a>
            </div>
        </div>
    );
}
