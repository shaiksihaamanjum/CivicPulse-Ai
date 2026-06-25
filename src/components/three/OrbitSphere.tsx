import React, { useEffect, useRef } from "react";

const departments = [
  { icon: "🛣️", label: "Roads", angle: 0, tilt: 0.1 },
  { icon: "💧", label: "Water", angle: 60, tilt: -0.2 },
  { icon: "💡", label: "Power", angle: 120, tilt: 0.3 },
  { icon: "🗑️", label: "Waste", angle: 180, tilt: -0.1 },
  { icon: "🌳", label: "Parks", angle: 240, tilt: 0.2 },
  { icon: "🔗", label: "Ledger", angle: 300, tilt: -0.3 },
];

export default function OrbitSphere() {
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

      const width = container.clientWidth || 400;
      const height = container.clientHeight || 400;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      camera.position.z = 16;

      // 1. Central Glowing Core Sphere & Rings
      const coreGroup = new THREE.Group();
      scene.add(coreGroup);

      // Glowing core sphere
      const coreGeo = new THREE.SphereGeometry(1.5, 32, 32);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xf97316,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreGroup.add(coreMesh);

      // Solid small center
      const solidGeo = new THREE.SphereGeometry(0.5, 16, 16);
      const solidMat = new THREE.MeshBasicMaterial({
        color: 0xf97316,
        transparent: true,
        opacity: 0.7,
      });
      const solidMesh = new THREE.Mesh(solidGeo, solidMat);
      coreGroup.add(solidMesh);

      // Outer orbital rings for aesthetics
      const rings: any[] = [];
      const ringCount = 3;
      for (let i = 0; i < ringCount; i++) {
        const ringGeo = new THREE.RingGeometry(3.5 + i * 1.2, 3.52 + i * 1.2, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xf97316,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.15 - i * 0.04,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        // Give them unique inclined tilts
        ringMesh.rotation.x = Math.PI / 2 + (i - 1) * 0.3;
        ringMesh.rotation.y = (i - 1) * 0.2;
        scene.add(ringMesh);
        rings.push(ringMesh);
      }

      // Helper to draw clean high-resolution billboard textures
      const createDeptBillboardTexture = (icon: string, label: string) => {
        const canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Rounded corner rect background
          ctx.fillStyle = "rgba(10, 10, 10, 0.95)";
          ctx.beginPath();
          const r = 24;
          ctx.roundRect ? ctx.roundRect(4, 4, 120, 120, r) : ctx.rect(4, 4, 120, 120);
          ctx.fill();

          // Glowing border matching orange
          ctx.strokeStyle = "rgba(249, 115, 22, 0.4)";
          ctx.lineWidth = 4;
          ctx.stroke();

          // Icon Emoji
          ctx.font = "38px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(icon, 64, 50);

          // Text Label
          ctx.font = "bold 13px 'Inter', sans-serif";
          ctx.fillStyle = "#e5e5e5";
          ctx.letterSpacing = "1px";
          ctx.fillText(label.toUpperCase(), 64, 95);
        }
        return new THREE.CanvasTexture(canvas);
      };

      // 2. Create orbiting department items
      const orbitsGroup = new THREE.Group();
      scene.add(orbitsGroup);

      const orbitRadius = 5.2;
      const items: Array<{
        mesh: any;
        angleOffset: number;
        tiltOffset: number;
      }> = [];

      departments.forEach((dept) => {
        const tex = createDeptBillboardTexture(dept.icon, dept.label);
        const mat = new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          side: THREE.DoubleSide,
        });
        const geo = new THREE.PlaneGeometry(1.8, 1.8);
        const mesh = new THREE.Mesh(geo, mat);

        orbitsGroup.add(mesh);
        items.push({
          mesh,
          angleOffset: (dept.angle * Math.PI) / 180,
          tiltOffset: dept.tilt,
        });
      });

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);

      let time = 0;

      const animate = () => {
        frameId = requestAnimationFrame(animate);
        time += 0.006;

        // Rotate core sphere wireframe
        coreMesh.rotation.y += 0.01;
        coreMesh.rotation.x += 0.005;

        // Rotate extra rings subtly
        rings.forEach((ring, index) => {
          ring.rotation.z += 0.002 * (index + 1);
        });

        // Orbit departments around the core in 3D
        items.forEach((item) => {
          const theta = time + item.angleOffset;
          
          // Circular orbit equations with custom inclinational tilts
          const x = Math.sin(theta) * orbitRadius;
          const z = Math.cos(theta) * orbitRadius;
          const y = Math.sin(theta * 1.5) * item.tiltOffset * orbitRadius;

          item.mesh.position.set(x, y, z);

          // Keep the department billboards facing straight towards the camera (Billboarding)
          item.mesh.lookAt(camera.position);
        });

        // Slowly rotate the entire system
        orbitsGroup.rotation.y = time * 0.05;

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

        // Dispose items
        items.forEach((item) => {
          orbitsGroup.remove(item.mesh);
          item.mesh.geometry.dispose();
          item.mesh.material.dispose();
        });

        // Dispose core and rings
        coreGroup.remove(coreMesh);
        coreGroup.remove(solidMesh);
        coreMesh.geometry.dispose();
        coreMesh.material.dispose();
        solidMesh.geometry.dispose();
        solidMesh.material.dispose();

        rings.forEach((ring) => {
          scene.remove(ring);
          ring.geometry.dispose();
          ring.material.dispose();
        });

        scene.remove(coreGroup);
        scene.remove(orbitsGroup);
        scene.remove(ambientLight);

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
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-10 overflow-hidden"
    />
  );
}
