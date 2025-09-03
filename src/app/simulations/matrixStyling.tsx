'use client'
import React, { useRef, useEffect } from "react";
import styled from "styled-components";

export const MatrixRainCanvas = styled.canvas`
  position: fixed;
  inset: 0;
  z-index: -1; /* Always behind your app */
  background: transparent; /* Changed from black to transparent */
  pointer-events: none;
  display: block; /* Prevent hydration issues */
`;

export const MatrixRain: React.FC<{
  fontSize?: number;
  layers?: number;
  style?: React.CSSProperties;
}> = ({ fontSize = 16, layers = 3, style }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set initial dimensions
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animationId: number;

    const characters = "01░▒▓█𓀀𓀁𓀂𓀃𓀄  الم الر ق كهيعص ق ص طه";

    const layerConfigs = Array.from({ length: layers }).map((_, i) => {
      const size = fontSize * (0.8 + i * 0.4);
      const cols = Math.floor(width / size);
      return {
        font: `${size}px monospace`,
        drops: Array(cols).fill(0),
        speed: 1 + i * 0.5,
        color: `rgba(30, 64, 175, ${0.15 + i * 0.1})`, // Darker blue for light background
        size,
      };
    });

    const draw = () => {
      if (!ctx || !canvas) return;

      // fade previous frame with white for light mode trailing effect
      ctx.fillStyle = "rgba(255,255,255,0.12)"; // Changed from black to white fade
      ctx.fillRect(0, 0, width, height);

      layerConfigs.forEach(layer => {
        ctx.font = layer.font;
        ctx.fillStyle = layer.color;

        layer.drops.forEach((drop, i) => {
          const text = characters.charAt(Math.floor(Math.random() * characters.length));
          const x = i * layer.size;
          const y = drop * layer.size;

          ctx.fillText(text, x, y);

          if (y > height && Math.random() > 0.95) layer.drops[i] = 0;
          layer.drops[i] += layer.speed;
        });
      });

      animationId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;

      layerConfigs.forEach(layer => {
        const cols = Math.floor(width / layer.size);
        layer.drops = Array(cols).fill(0);
      });
    };

    // Start animation
    draw();

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [fontSize, layers]);

  return <MatrixRainCanvas ref={canvasRef} style={style} />;
};