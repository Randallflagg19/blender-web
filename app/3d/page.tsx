"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { useRef, Suspense } from "react";
import { Mesh } from "three";

function Model() {
  const { scene } = useGLTF("/models/product-card-day2.glb");

  const ref = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.6;
  });

  return <primitive ref={ref} object={scene} />;
}

export default function Page() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 1.2, 3], fov: 90 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <directionalLight position={[-5, 3, -5]} intensity={0.4} />
        <Suspense fallback={null}>
          <Model />
        </Suspense>
        <OrbitControls enablePan={false} minDistance={2} maxDistance={5} />
      </Canvas>
    </div>
  );
}
