import React, { useEffect, useRef } from "react";

export default function DashboardBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    let renderer: any;
    let frameId: number;
    let resizeObserver: ResizeObserver;
    let cleanupFunction: (() => void) | undefined;

    const initThree = () => {
      const THREE = (window as any).THREE;
      if (!THREE) return false;

      const width = container.clientWidth;
      const height = container.clientHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      camera.position.z = 20;

      // Create particles
      const particleCount = 120;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const speeds: number[] = [];
      const opacities: number[] = [];

      for (let i = 0; i < particleCount; i++) {
        // Spread across the viewport width & depth
        positions[i * 3] = (Math.random() - 0.5) * 35;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 15;

        speeds.push(0.02 + Math.random() * 0.05);
        opacities.push(0.1 + Math.random() * 0.6);
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      // Custom Canvas Texture for smooth circular glowing particles
      const createParticleTexture = () => {
        const matCanvas = document.createElement("canvas");
        matCanvas.width = 16;
        matCanvas.height = 16;
        const ctx = matCanvas.getContext("2d");
        if (ctx) {
          const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
          gradient.addColorStop(0, "rgba(249, 115, 22, 1)"); // orange-500
          gradient.addColorStop(0.3, "rgba(249, 115, 22, 0.8)");
          gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 16, 16);
        }
        return new THREE.CanvasTexture(matCanvas);
      };

      const material = new THREE.PointsMaterial({
        size: 0.6,
        map: createParticleTexture(),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const particles = new THREE.Points(geometry, material);
      scene.add(particles);

      const animate = () => {
        frameId = requestAnimationFrame(animate);

        const positionsAttr = geometry.attributes.position;
        const arr = positionsAttr.array as Float32Array;

        for (let i = 0; i < particleCount; i++) {
          // Move y coordinate up
          arr[i * 3 + 1] += speeds[i];

          // Wrap around if particle goes too high
          if (arr[i * 3 + 1] > 12) {
            arr[i * 3 + 1] = -12;
            arr[i * 3] = (Math.random() - 0.5) * 35;
          }

          // Add slight side sway
          arr[i * 3] += Math.sin(frameId * 0.002 + i) * 0.005;
        }

        positionsAttr.needsUpdate = true;

        // Slowly rotate the whole system for depth
        particles.rotation.y += 0.001;

        renderer.render(scene, camera);
      };

      animate();

      resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          renderer.setSize(width, height);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        }
      });

      resizeObserver.observe(container);

      cleanupFunction = () => {
        cancelAnimationFrame(frameId);
        resizeObserver.disconnect();
        scene.remove(particles);
        geometry.dispose();
        material.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };

      return true;
    };

    // Attempt immediately
    if (!initThree()) {
      const interval = setInterval(() => {
        if (initThree()) {
          clearInterval(interval);
        }
      }, 150);
      return () => {
        clearInterval(interval);
        if (cleanupFunction) cleanupFunction();
      };
    }

    return () => {
      if (cleanupFunction) cleanupFunction();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-[-1] overflow-hidden opacity-40"
    />
  );
}
