import { useEffect, useRef } from 'react';

export default function KakaoAdFit({ unit, width = 320, height = 100 }) {
    const containerRef = useRef(null);
    const isLoadedRef = useRef(false);

    useEffect(() => {
        if (isLoadedRef.current) return;

        const script = document.createElement('script');
        script.src = 'https://t1.daumcdn.net/kas/static/ba.min.js';
        script.async = true;
        script.onload = () => {
            isLoadedRef.current = true;
        };

        const ins = document.createElement('ins');
        ins.className = 'kakao_ad_area';
        ins.style.display = 'none';
        ins.setAttribute('data-ad-unit', unit);
        ins.setAttribute('data-ad-width', width.toString());
        ins.setAttribute('data-ad-height', height.toString());

        if (containerRef.current) {
            containerRef.current.appendChild(ins);
            containerRef.current.appendChild(script);
        }

        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [unit, width, height]);

    return <div ref={containerRef} style={{ width, height }} />;
}
