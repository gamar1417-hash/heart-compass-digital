 import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Paradise({ totalPoints }: { totalPoints: number }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // إعداد المشهد الأساسي
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.FogExp2(0x87CEEB, 0.02);

    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // الإضاءة
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // الأرضية الخضراء
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x2e8b57 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // حساب النمو بناءً على الرصيد
    const treesCount = Math.min(Math.floor(totalPoints / 10), 60);
    const riverVisible = totalPoints >= 50;
    const palaceVisible = totalPoints >= 200;

    // إضافة الأشجار
    for (let i = 0; i < treesCount; i++) {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2), new THREE.MeshLambertMaterial({ color: 0x8B4513 }));
      const leaves = new THREE.Mesh(new THREE.SphereGeometry(1.5), new THREE.MeshLambertMaterial({ color: 0x228B22 }));
      leaves.position.y = 1.5;
      
      const tree = new THREE.Group();
      tree.add(trunk);
      tree.add(leaves);
      tree.position.set((Math.random() - 0.5) * 40, 1, (Math.random() - 0.5) * 40);
      scene.add(tree);
    }

    // إضافة النهر
    if (riverVisible) {
      const riverGeo = new THREE.PlaneGeometry(8, 100);
      const riverMat = new THREE.MeshLambertMaterial({ color: 0x4169E1, transparent: true, opacity: 0.8 });
      const river = new THREE.Mesh(riverGeo, riverMat);
      river.rotation.x = -Math.PI / 2;
      river.position.set(0, 0.1, 0);
      scene.add(river);
    }

    // إضافة القصر
    if (palaceVisible) {
      const palaceGroup = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 6), new THREE.MeshLambertMaterial({ color: 0xFFF8DC }));
      const dome = new THREE.Mesh(new THREE.SphereGeometry(3), new THREE.MeshLambertMaterial({ color: 0xFFD700 }));
      base.position.y = 2;
      dome.position.y = 5;
      
      const door = new THREE.Mesh(new THREE.PlaneGeometry(2, 3), new THREE.MeshLambertMaterial({ color: 0x8B4513 }));
      door.position.set(0, 1.5, 3.01);

      palaceGroup.add(base);
      palaceGroup.add(dome);
      palaceGroup.add(door);
      palaceGroup.position.set(-10, 0, -10);
      scene.add(palaceGroup);
    }

    // تشغيل الحركة والتحديث
    const animate = function () {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
    };
  }, [totalPoints]);

  return <div ref={mountRef} className="w-full h-full" />;
}
export const paradiseCounts = (points: number) => ({ trees: Math.floor(points / 10), rivers: points >= 50 ? 1 : 0, palaces: points >= 200 ? 1 : 0 });
export const paradiseStage = (points: number) => points >= 200 ? 3 : points >= 50 ? 2 : 1;
export const ParadiseScene = Paradise;
