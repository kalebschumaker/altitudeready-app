import { useEffect } from 'react';

export default function GoogleAd({ slot, format = 'auto', responsive = true, style = {} }) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('Ad error:', err);
    }
  }, []);

  return (
    <div style={{ margin: '20px 0', textAlign: 'center', ...style }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXXX" // Replace with your AdSense ID
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
}
