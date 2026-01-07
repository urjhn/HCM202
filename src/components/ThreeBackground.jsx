import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function StarField({ count = 1000 }) {
  const ref = useRef();
  
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Create a sphere distribution
      const radius = Math.random() * 25 + 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Màu xanh dương và tím cho nền trắng
      const colorChoice = Math.random();
      if (colorChoice > 0.6) {
        colors[i * 3] = 0.4; // Xanh dương #667eea
        colors[i * 3 + 1] = 0.49;
        colors[i * 3 + 2] = 0.92;
      } else if (colorChoice > 0.3) {
        colors[i * 3] = 0.46; // Tím #764ba2
        colors[i * 3 + 1] = 0.29;
        colors[i * 3 + 2] = 0.64;
      } else {
        colors[i * 3] = 0.6; // Xám tím nhạt
        colors[i * 3 + 1] = 0.6;
        colors[i * 3 + 2] = 0.7;
      }
    }
    
    return [positions, colors];
  }, [count]);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta * 0.05;
      ref.current.rotation.y -= delta * 0.075;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          vertexColors
          size={0.15}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

function FloatingStars() {
  const ref = useRef();
  const count = 30;
  
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#667eea"
        size={0.3}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
        blending={THREE.NormalBlending}
      />
    </Points>
  );
}

const ThreeBackground = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
      background: '#ffffff'
    }}>
      <Canvas camera={{ position: [0, 0, 1] }}>
        <StarField />
        <FloatingStars />
      </Canvas>
    </div>
  );
};

export default ThreeBackground;
