const { useEffect: useBlurEffect, useRef: useBlurRef, useState } = React;
const { motion: blurMotion } = Motion;

function BlurText({ text, className = "" }) {
  const elementRef = useBlurRef(null);
  const [visible, setVisible] = useState(false);

  useBlurEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <p ref={elementRef} className={className} style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", rowGap: "0.1em" }}>
      {text.split(" ").map((word, index) => (
        <blurMotion.span
          key={`${word}-${index}`}
          initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
          animate={visible ? { filter: ["blur(10px)", "blur(5px)", "blur(0px)"], opacity: [0, 0.5, 1], y: [50, -5, 0] } : {}}
          transition={{ duration: 0.7, times: [0, 0.5, 1], ease: "easeOut", delay: (index * 100) / 1000 }}
          style={{ display: "inline-block", marginRight: "0.28em" }}
        >
          {word}
        </blurMotion.span>
      ))}
    </p>
  );
}

window.BlurText = BlurText;
