import { useState, useRef } from "react";

interface PostCarouselProps {
  urls: string[];
}

const PostCarousel = ({ urls }: PostCarouselProps) => {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  if (urls.length === 0) return null;
  if (urls.length === 1) {
    return (
      <div className="w-full aspect-square bg-secondary/30">
        <img src={urls[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
      </div>
    );
  }

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollLeft = containerRef.current.scrollLeft;
    const width = containerRef.current.clientWidth;
    const idx = Math.round(scrollLeft / width);
    setCurrent(idx);
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {urls.map((url, i) => (
          <div key={i} className="w-full aspect-square shrink-0 snap-center bg-secondary/30">
            <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
        ))}
      </div>
      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {urls.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              i === current ? "bg-primary" : "bg-foreground/30"
            }`}
          />
        ))}
      </div>
      {/* Counter */}
      <div className="absolute top-3 right-3 bg-background/60 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs text-foreground">
        {current + 1}/{urls.length}
      </div>
    </div>
  );
};

export default PostCarousel;
