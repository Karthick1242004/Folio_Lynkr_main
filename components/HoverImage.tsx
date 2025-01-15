import React, { useState, useEffect, useRef } from 'react';

interface HoverImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const HoverImage: React.FC<HoverImageProps> = ({ src, alt, className = '' }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!imageRef.current) return;

      const bounds = imageRef.current.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      
      const x = e.clientX - centerX;
      const y = e.clientY - centerY;

      // Limit movement to 35px radius
      const radius = 35;
      const distance = Math.sqrt(x * x + y * y);
      const scale = distance > radius ? radius / distance : 1;

      // Add smooth easing
      setPosition(prev => ({
        x: x * scale * 0.8, // Add slight damping for smoother movement
        y: y * scale * 0.8,
      }));
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={imageRef}
      className="relative transition-transform duration-300 ease-out"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      <img src={src} alt={alt} className={className} />
    </div>
  );
};