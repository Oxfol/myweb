const { useCallback, useEffect, useRef } = React;

const FADE_MS = 500;
const FADE_OUT_LEAD = 0.55;

function FadingVideo({ src, className, style }) {
  const videoRef = useRef(null);
  const frameRef = useRef(0);
  const restartTimerRef = useRef(0);
  const fadingOutRef = useRef(false);

  const fadeTo = useCallback((target, duration = FADE_MS) => {
    cancelAnimationFrame(frameRef.current);
    const video = videoRef.current;
    if (!video) return;

    const startOpacity = Number.parseFloat(video.style.opacity || "0");
    const startedAt = performance.now();

    const step = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      video.style.opacity = String(startOpacity + (target - startOpacity) * progress);
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedData = () => {
      video.style.opacity = "0";
      video.play().catch(() => {});
      fadeTo(1);
    };

    const onTimeUpdate = () => {
      const remaining = video.duration - video.currentTime;
      if (!fadingOutRef.current && remaining > 0 && remaining <= FADE_OUT_LEAD) {
        fadingOutRef.current = true;
        fadeTo(0);
      }
    };

    const onEnded = () => {
      video.style.opacity = "0";
      restartTimerRef.current = window.setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(() => {});
        fadingOutRef.current = false;
        fadeTo(1);
      }, 100);
    };

    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);

    return () => {
      cancelAnimationFrame(frameRef.current);
      clearTimeout(restartTimerRef.current);
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
    };
  }, [fadeTo]);

  return <video ref={videoRef} src={src} className={className} style={{ ...style, opacity: 0 }} autoPlay muted playsInline preload="auto" />;
}

window.FadingVideo = FadingVideo;
