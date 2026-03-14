"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Sphere, MeshDistortMaterial } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function RotatingSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 100, 100]} scale={2}>
        <MeshDistortMaterial
          color="#3b82f6"
          attach="material"
          distort={0.4}
          speed={1.5}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

function GridBackground() {
  return (
    <gridHelper 
      args={[100, 50, "#1e293b", "#0f172a"]} 
      position={[0, -5, 0]} 
      rotation={[Math.PI / 10, 0, 0]}
    />
  );
}

export function Scene3D() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#030406]">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <color attach="background" args={["#030406"]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#3b82f6" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#22c55e" />
        
        <RotatingSphere />
        <GridBackground />
        
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={true} rotateSpeed={0.3} />
        
        {/* Subtle Fog for Depth */}
        <fog attach="fog" args={["#030406", 5, 15]} />
      </Canvas>
    </div>
  );
}
