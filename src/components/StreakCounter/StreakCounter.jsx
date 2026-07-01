import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import lottie from 'lottie-web';
import './StreakCounter.css';

export default function StreakCounter({ type, count }) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const emojiRef = useRef(null);
  const lottieRef = useRef(null);
  const lottieInstance = useRef(null);
  const [fireFailed, setFireFailed] = useState(false);

  // Load animation
  useEffect(() => {
    if (!lottieRef.current) return;
    try {
      lottieInstance.current = lottie.loadAnimation({
        container: lottieRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/Fire.json'
      });
      lottieInstance.current.addEventListener('data_failed', () => setFireFailed(true));
    } catch {
      setFireFailed(true);
    }
    return () => {
      if (lottieInstance.current) {
        lottieInstance.current.destroy();
        lottieInstance.current = null;
      }
    };
  }, []);

  // Control play/pause based on visibility
  useEffect(() => {
    if (!lottieInstance.current) return;
    if (type === 'hot' && count > 0) {
      lottieInstance.current.play();
    } else {
      lottieInstance.current.stop();
    }
  }, [type, count]);

  // GSAP animations
  useEffect(() => {
    if (!type || count === 0) return;
    const container = containerRef.current;
    const text = textRef.current;
    const emoji = emojiRef.current;
    if (!container || !text || !emoji) return;

    gsap.killTweensOf(container);
    gsap.killTweensOf(text);
    gsap.killTweensOf(emoji);

    gsap.set(container, { display: 'flex', opacity: 1 });

    gsap.fromTo(container,
      { y: 50, opacity: 0, scale: 0.8 },
      { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.5)' }
    );

    gsap.fromTo(text,
      { scale: 1.5 },
      { scale: 1, duration: 0.4, ease: 'bounce.out' }
    );

    if (type === 'hot') {
      gsap.fromTo(emoji,
        { scale: 1.3, rotation: -15 },
        { scale: 1, rotation: 0, duration: 0.4, ease: 'elastic.out(1, 0.5)' }
      );
    } else {
      gsap.fromTo(emoji,
        { x: -5 },
        { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.2)' }
      );
    }

    gsap.to(container, {
      opacity: 0, y: 20, scale: 0.9,
      duration: 0.4, delay: 2,
      onComplete: () => {
        if (containerRef.current) {
          gsap.set(containerRef.current, { display: 'none' });
        }
      }
    });
  }, [count, type]);

  const visible = type && count > 0;
  const showLottie = type === 'hot' && !fireFailed;

  return createPortal(
    <div
      ref={containerRef}
      className={`streak-counter ${type || ''}`}
      style={{ display: visible ? 'flex' : 'none' }}
    >
      <span ref={emojiRef} className="streak-emoji lottie-wrapper">
        <div
          ref={lottieRef}
          style={{
            width: 28, height: 28,
            display: showLottie ? 'block' : 'none'
          }}
        />
        {type === 'hot' && fireFailed && '🔥'}
        {type === 'cold' && '❄️'}
      </span>
      <span ref={textRef} className="streak-text">{count}</span>
    </div>,
    document.body
  );
}
