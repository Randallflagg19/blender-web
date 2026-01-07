"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState } from "react";
import { Object3D } from "three";

// --- constants ---
const BASE_LIGHT = 1.2;
const HOVER_LIGHT = 2;
const DEFAULT_SCALE = 1;
const ZOOM_SCALE = 1.5;
const CLICK_THRESHOLD_PX = 6;
const CLICK_THRESHOLD_SQ = CLICK_THRESHOLD_PX ** 2;

type PointerStart = { x: number; y: number; id: number };

// --- helpers ---
function useClickWithoutDrag(onClick: () => void) {
  const startRef = useRef<PointerStart | null>(null);
  const draggedRef = useRef(false);

  return useMemo(
    () => ({
      onPointerDown: (e: ThreeEvent<PointerEvent>) => {
        // Не stopPropagation: OrbitControls должен работать при драге по объекту
        startRef.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
        draggedRef.current = false;
      },
      onPointerMove: (e: ThreeEvent<PointerEvent>) => {
        const s = startRef.current;
        if (!s || s.id !== e.pointerId || draggedRef.current) return;
        const dx = e.clientX - s.x;
        const dy = e.clientY - s.y;
        if (dx * dx + dy * dy > CLICK_THRESHOLD_SQ) draggedRef.current = true;
      },
      onPointerUp: (e: ThreeEvent<PointerEvent>) => {
        const s = startRef.current;
        startRef.current = null;
        if (!s || s.id !== e.pointerId || draggedRef.current) return;
        e.stopPropagation(); // "чистый" клик не отдаём OrbitControls
        onClick();
      },
    }),
    [onClick]
  );
}

// --- model ---
function RotatingModel(props: {
  scale: number;
  onHover: (hovered: boolean) => void;
  onToggleScale: () => void;
}) {
  const { scene } = useGLTF("/models/product-card-day2.glb");
  const ref = useRef<Object3D>(null);
  const click = useClickWithoutDrag(props.onToggleScale);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.6;
  });

  return (
    <primitive
      ref={ref}
      object={scene}
      scale={props.scale}
      onPointerOver={() => props.onHover(true)}
      onPointerOut={() => props.onHover(false)}
      {...click}
    />
  );
}

// --- scene ---
export function ThreeScene() {
  const [hovered, setHovered] = useState(false);
  const [scale, setScale] = useState(DEFAULT_SCALE);

  const light = hovered ? HOVER_LIGHT : BASE_LIGHT;
  const toggleScale = () =>
    setScale((s) => (s === DEFAULT_SCALE ? ZOOM_SCALE : DEFAULT_SCALE));

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 1.2, 3], fov: 90 }}>
        <color attach="background" args={["#333333"]} />

        <ambientLight intensity={light} />
        <directionalLight position={[5, 5, 5]} intensity={light} />
        <directionalLight position={[-5, 3, -5]} intensity={light * 0.4} />
        <directionalLight position={[0, 2, -3]} intensity={light * 0.3} />
        <spotLight
          position={[0.5, 3, 2.5]}
          intensity={light}
          angle={0.3}
          penumbra={0.5}
        />

        <Suspense fallback={null}>
          <RotatingModel
            scale={scale}
            onHover={setHovered}
            onToggleScale={toggleScale}
          />
        </Suspense>

        <OrbitControls enablePan={false} minDistance={2} maxDistance={5} />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/product-card-day2.glb");
