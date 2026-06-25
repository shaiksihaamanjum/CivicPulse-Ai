import React, { useEffect, useRef } from "react";

export default function BlockchainAnimation() {
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

      const width = container.clientWidth || 300;
      const height = container.clientHeight || 220;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      camera.position.z = 18;

      // Helper to generate canvas texture with a blockchain hash on it
      const createHashTexture = (hashText: string) => {
        const canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Dark metallic background
          ctx.fillStyle = "#0a0a0a";
          ctx.fillRect(0, 0, 128, 128);

          // Subdued border
          ctx.strokeStyle = "rgba(249, 115, 22, 0.3)";
          ctx.lineWidth = 4;
          ctx.strokeRect(2, 2, 124, 124);

          // Inner glowing ambient center
          const radial = ctx.createRadialGradient(64, 64, 10, 64, 64, 50);
          radial.addColorStop(0, "rgba(249, 115, 22, 0.1)");
          radial.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = radial;
          ctx.fillRect(4, 4, 120, 120);

          // White/Orange Hash Text
          ctx.font = "bold 14px 'JetBrains Mono', monospace";
          ctx.fillStyle = "#e5e5e5";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(hashText, 64, 45);

          ctx.font = "9px 'JetBrains Mono', monospace";
          ctx.fillStyle = "#f97316";
          ctx.fillText("POLYGON SEALED", 64, 75);

          ctx.fillStyle = "#22c55e"; // green success dot
          ctx.beginPath();
          ctx.arc(64, 98, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = "8px sans-serif";
          ctx.fillStyle = "#a3a3a3";
          ctx.fillText("VALIDATED", 64, 110);
        }
        return new THREE.CanvasTexture(canvas);
      };

      // Create materials for the cubes
      const hashes = ["0x7a8f...4e9d", "0x91c0...a1b2", "0x3e4f...5c6d", "0xf5b2...8e9a"];
      const materials = hashes.map((hash) => {
        const tex = createHashTexture(hash);
        return new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          opacity: 0.95,
        });
      });

      const cubeSize = 2.4;
      const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
      const chainGroup = new THREE.Group();
      scene.add(chainGroup);

      // Create cubes
      const cubes: any[] = [];
      const edgeLines: any[] = [];
      const cubeCount = 3;

      for (let i = 0; i < cubeCount; i++) {
        const cubeMesh = new THREE.Mesh(geometry, materials[i % materials.length]);
        
        // Position them linked in a chain diagonally
        cubeMesh.position.set((i - 1) * 3.8, (i - 1) * -1.8, (i - 1) * -1.0);
        chainGroup.add(cubeMesh);
        cubes.push(cubeMesh);

        // Add orange glowing edges helper
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMat = new THREE.LineBasicMaterial({
          color: 0xf97316,
          linewidth: 2,
          transparent: true,
          opacity: 0.8,
        });
        const line = new THREE.LineSegments(edges, lineMat);
        cubeMesh.add(line);
        edgeLines.push(line);
      }

      // Connectors (chain links / lasers between the blocks)
      const connectorLines: any[] = [];
      const createConnectors = () => {
        for (let i = 0; i < cubeCount - 1; i++) {
          const start = cubes[i].position;
          const end = cubes[i + 1].position;

          const points = [start, end];
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const lineMat = new THREE.LineDashedMaterial({
            color: 0xf97316,
            dashSize: 0.5,
            gapSize: 0.3,
            transparent: true,
            opacity: 0.5,
          });
          const connLine = new THREE.Line(lineGeo, lineMat);
          connLine.computeLineDistances();
          chainGroup.add(connLine);
          connectorLines.push({ line: connLine, startCube: cubes[i], endCube: cubes[i+1] });
        }
      };

      createConnectors();

      // Lights
      const amb = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(amb);

      const point = new THREE.PointLight(0xf97316, 1, 30);
      point.position.set(0, 0, 5);
      scene.add(point);

      let time = 0;

      const animate = () => {
        frameId = requestAnimationFrame(animate);
        time += 0.005;

        // Rotate each individual cube on its own axis slowly
        cubes.forEach((cube, index) => {
          cube.rotation.x += 0.003 + index * 0.002;
          cube.rotation.y += 0.004 - index * 0.001;

          // Floating movement
          cube.position.y += Math.sin(time + index) * 0.004;
        });

        // Slowly rotate the entire chain
        chainGroup.rotation.y = Math.sin(time * 0.4) * 0.15;
        chainGroup.rotation.x = Math.cos(time * 0.3) * 0.1;

        // Update positions of connecting lines
        connectorLines.forEach((conn) => {
          const pArray = new Float32Array([
            conn.startCube.position.x, conn.startCube.position.y, conn.startCube.position.z,
            conn.endCube.position.x, conn.endCube.position.y, conn.endCube.position.z,
          ]);
          conn.line.geometry.setAttribute("position", new THREE.BufferAttribute(pArray, 3));
          conn.line.computeLineDistances();
        });

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
        
        cubes.forEach((c) => {
          chainGroup.remove(c);
          c.geometry.dispose();
          if (Array.isArray(c.material)) {
            c.material.forEach((m) => m.dispose());
          } else {
            c.material.dispose();
          }
        });

        edgeLines.forEach((el) => {
          el.geometry.dispose();
          el.material.dispose();
        });

        connectorLines.forEach((conn) => {
          chainGroup.remove(conn.line);
          conn.line.geometry.dispose();
          conn.line.material.dispose();
        });

        scene.remove(chainGroup);
        scene.remove(amb);
        scene.remove(point);

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
      className="w-full h-[220px] relative rounded-2xl overflow-hidden border border-white/5 bg-black/40 shadow-inner flex items-center justify-center"
    >
      <div className="absolute top-3 left-4 text-[10px] text-orange-500 uppercase tracking-widest font-mono font-bold flex items-center gap-1.5 z-10 select-none">
        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping"></span>
        Ledger Block Ring Viz
      </div>
      <div ref={containerRef} className="absolute inset-0 pointer-events-none select-none z-0" />
    </div>
  );
}
