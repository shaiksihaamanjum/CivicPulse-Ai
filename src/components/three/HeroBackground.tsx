import React, { useEffect, useRef } from "react";

export default function HeroBackground() {
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

      // Create scene, camera, renderer
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // Grid System
      const size = 100;
      const divisions = 40;
      const colorCenterLine = 0xf97316; // orange-500
      const colorGrid = 0x262626; // neutral-800
      
      const gridHelper = new THREE.GridHelper(size, divisions, colorCenterLine, colorGrid);
      gridHelper.position.y = -5;
      scene.add(gridHelper);

      // Glowing lines on top
      const gridHelper2 = new THREE.GridHelper(size, divisions, colorCenterLine, 0x1f1207);
      gridHelper2.position.y = -4.95;
      gridHelper2.material.opacity = 0.4;
      gridHelper2.material.transparent = true;
      scene.add(gridHelper2);

      // Pulsing pulse points array
      const maxPulsePoints = 12;
      const pulsePoints: Array<{
        mesh: any;
        ring: any;
        life: number;
        maxLife: number;
        speed: number;
      }> = [];

      // Helper to generate a pulse point
      const createPulsePoint = () => {
        // Pick random location on the grid
        const x = (Math.random() - 0.5) * size * 0.7;
        const z = (Math.random() - 0.5) * size * 0.7;
        const y = -4.9;

        // Central core dot
        const coreGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({
          color: 0xf97316,
          transparent: true,
          opacity: 0.9,
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        coreMesh.position.set(x, y, z);
        scene.add(coreMesh);

        // Pulsing outer ring
        const ringGeo = new THREE.RingGeometry(0.1, 1.2, 32);
        ringGeo.rotateX(-Math.PI / 2); // Make it flat on the grid
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xf97316,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.6,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.set(x, y + 0.05, z);
        scene.add(ringMesh);

        pulsePoints.push({
          mesh: coreMesh,
          ring: ringMesh,
          life: 0,
          maxLife: 60 + Math.random() * 60, // 1-2 seconds
          speed: 0.01 + Math.random() * 0.015,
        });
      };

      // Initialize initial points
      for (let i = 0; i < 5; i++) {
        createPulsePoint();
      }

      // Light up background slightly
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xf97316, 0.8);
      dirLight.position.set(0, 10, 5);
      scene.add(dirLight);

      // Initial camera position
      camera.position.set(0, 8, 30);
      camera.lookAt(0, -2, 0);

      // Animation Loop
      let time = 0;

      const animate = () => {
        frameId = requestAnimationFrame(animate);
        time += 0.003;

        // 1. Slow camera drift
        camera.position.x = Math.sin(time) * 12;
        camera.position.z = 25 + Math.cos(time * 0.7) * 5;
        camera.position.y = 8 + Math.sin(time * 0.5) * 3;
        camera.lookAt(0, -2, 0);

        // 2. Animate and recycle pulse points
        for (let i = pulsePoints.length - 1; i >= 0; i--) {
          const p = pulsePoints[i];
          p.life += 1;

          // Scale up ring and fade out
          const ratio = p.life / p.maxLife;
          p.ring.scale.set(1 + ratio * 3, 1 + ratio * 3, 1);
          p.ring.material.opacity = 0.8 * (1 - ratio);
          
          // Core blink
          p.mesh.material.opacity = 0.9 * (1 - ratio * 0.5);

          // Remove old point and create new one
          if (p.life >= p.maxLife) {
            scene.remove(p.mesh);
            scene.remove(p.ring);
            p.mesh.geometry.dispose();
            p.mesh.material.dispose();
            p.ring.geometry.dispose();
            p.ring.material.dispose();
            pulsePoints.splice(i, 1);
            
            if (pulsePoints.length < maxPulsePoints) {
              createPulsePoint();
            }
          }
        }

        // Randomly spawn report alerts dynamically
        if (pulsePoints.length < maxPulsePoints && Math.random() < 0.03) {
          createPulsePoint();
        }

        renderer.render(scene, camera);
      };

      animate();

      // Handle Resize using ResizeObserver
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

        // Dispose pulse points
        pulsePoints.forEach((p) => {
          scene.remove(p.mesh);
          scene.remove(p.ring);
          p.mesh.geometry.dispose();
          p.mesh.material.dispose();
          p.ring.geometry.dispose();
          p.ring.material.dispose();
        });

        // Dispose grid and lights
        scene.remove(gridHelper);
        scene.remove(gridHelper2);
        gridHelper.geometry.dispose();
        (gridHelper.material as any).dispose();
        gridHelper2.geometry.dispose();
        (gridHelper2.material as any).dispose();

        scene.remove(ambientLight);
        scene.remove(dirLight);

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
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-[-1] overflow-hidden opacity-60"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
