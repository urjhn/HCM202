import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Hands } from '@mediapipe/hands';

const ThreeBackground = ({ onClose }) => {
    const containerRef = useRef();
    const sceneRef = useRef();
    const pointsRef = useRef();
    const materialRef = useRef();
    const geometryRef = useRef();
    const videoRef = useRef();
    const controlsRef = useRef();
    const [shape, setShape] = useState('galaxy');
    const [color, setColor] = useState('#00ffcc');
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    // Màu mặc định cho mỗi hình
    const defaultColors = {
        galaxy: '#ff9933',
        heart: '#1e90ff',
        flower: '#ff69b4',
        vietnam: '#da251d'
    };

    useEffect(() => {
        if (!containerRef.current) return;

        // --- TẠO SCENE THREE.JS ---
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        
        const camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        camera.position.set(0, 2, 8); // Đặt camera cao hơn để nhìn rõ hơn

        const renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true 
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        containerRef.current.appendChild(renderer.domElement);
        
        // --- ORBIT CONTROLS ---
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.rotateSpeed = 0.5;
        controls.zoomSpeed = 1.2;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.3;
        controls.minDistance = 3;
        controls.maxDistance = 20;
        controlsRef.current = controls;

        // --- TẠO PARTICLES ---
        const PARTICLE_COUNT = 15000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const colors = new Float32Array(PARTICLE_COUNT * 3);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometryRef.current = geometry;

        const material = new THREE.PointsMaterial({
            size: 0.035,
            vertexColors: true,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });
        materialRef.current = material;

        const points = new THREE.Points(geometry, material);
        pointsRef.current = points;
        scene.add(points);

        // Store base and spread positions for interpolation
        const basePositions = new Float32Array(PARTICLE_COUNT * 3);
        const spreadPositions = new Float32Array(PARTICLE_COUNT * 3);

        // --- SHAPE GENERATORS WITH COLORS ---
        const updatePositions = (type) => {
            const pos = geometry.attributes.position.array;
            const cols = geometry.attributes.color.array;
            
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                let x, y, z, r, g, b;
                
                if (type === 'heart') {
                    // Heart shape - Blue color
                    const t = (i / PARTICLE_COUNT) * Math.PI * 2;
                    const scale = 2.0;
                    x = scale * 1.6 * Math.pow(Math.sin(t), 3);
                    y = scale * (1.3 * Math.cos(t) - 0.5 * Math.cos(2 * t) - 
                        0.2 * Math.cos(3 * t) - 0.1 * Math.cos(4 * t));
                    z = (Math.random() - 0.5) * 0.3;
                    
                    // Gradient blue
                    r = 0.12 + Math.random() * 0.1;
                    g = 0.56 + Math.random() * 0.2;
                    b = 0.9 + Math.random() * 0.1;
                    
                } else if (type === 'flower') {
                    // Flower - Pink color with distinct petals
                    const angle = (i / PARTICLE_COUNT) * Math.PI * 10;
                    const radius = Math.pow(i / PARTICLE_COUNT, 0.5) * 3.5;
                    const petalAngle = Math.sin(angle * 6) * 0.8;
                    
                    x = (radius + petalAngle) * Math.cos(angle);
                    y = (radius + petalAngle) * Math.sin(angle);
                    z = Math.sin(angle * 4) * 0.5;
                    
                    // Pink gradient
                    r = 1.0;
                    g = 0.41 + Math.random() * 0.2;
                    b = 0.71 + Math.random() * 0.2;
                    
                } else if (type === 'vietnam') {
                    // Cờ Đỏ Sao Vàng Việt Nam (chuẩn theo ảnh)
                    const flagWidth = 10;
                    const flagHeight = 6.67; // Tỷ lệ 2:3
                    const starParticles = PARTICLE_COUNT * 0.16; // 16% cho sao
                    const centerParticles = starParticles * 0.5; // 50% particles cho tâm sao
                    
                    if (i < starParticles) {
                        // Phần tâm sao - đầy đặc ở giữa
                        if (i < centerParticles) {
                            const centerRadius = 0.4; // Tăng radius để fill đầy
                            const angle = Math.random() * Math.PI * 2;
                            const radius = Math.random() * centerRadius;
                            
                            x = radius * Math.cos(angle);
                            y = radius * Math.sin(angle);
                            z = (Math.random() - 0.5) * 0.04;
                            
                            // Gradient từ trắng (tâm) sang vàng sáng
                            const normalizedRadius = radius / centerRadius;
                            if (normalizedRadius < 0.3) {
                                // Tâm rất sáng - gần trắng
                                r = 1.0;
                                g = 0.98 + Math.random() * 0.02;
                                b = 0.6 + Math.random() * 0.2;
                            } else if (normalizedRadius < 0.6) {
                                // Vùng giữa - vàng sáng
                                r = 1.0;
                                g = 0.94 + Math.random() * 0.04;
                                b = 0.4 + Math.random() * 0.15;
                            } else {
                                // Rìa tâm - vàng
                                r = 1.0;
                                g = 0.90 + Math.random() * 0.05;
                                b = 0.25 + Math.random() * 0.15;
                            }
                            
                        } else {
                            // 5 cánh sao từ tam giác
                            const outerRadius = 1.5;
                            const innerRadius = 0.58;
                            const numArms = 5;
                            
                            const armIndex = Math.floor(Math.random() * numArms);
                            
                            const outerAngle = (armIndex / numArms) * Math.PI * 2 - Math.PI / 2;
                            const innerAngle1 = ((armIndex + 0.5) / numArms) * Math.PI * 2 - Math.PI / 2;
                            const innerAngle2 = ((armIndex - 0.5 + numArms) / numArms) * Math.PI * 2 - Math.PI / 2;
                            
                            const p1x = outerRadius * Math.cos(outerAngle);
                            const p1y = outerRadius * Math.sin(outerAngle);
                            
                            const p2x = innerRadius * Math.cos(innerAngle1);
                            const p2y = innerRadius * Math.sin(innerAngle1);
                            
                            const p3x = innerRadius * Math.cos(innerAngle2);
                            const p3y = innerRadius * Math.sin(innerAngle2);
                            
                            let u = Math.random();
                            let v = Math.random();
                            
                            if (u + v > 1) {
                                u = 1 - u;
                                v = 1 - v;
                            }
                            
                            const w = 1 - u - v;
                            
                            x = p1x * u + p2x * v + p3x * w;
                            y = p1y * u + p2y * v + p3y * w;
                            z = (Math.random() - 0.5) * 0.05;
                            
                            // Gradient màu vàng từ trong ra ngoài
                            const distanceFromCenter = Math.sqrt(x*x + y*y);
                            const maxDistance = outerRadius;
                            const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);
                            
                            if (normalizedDistance < 0.35) {
                                // Gần tâm - vàng sáng
                                r = 1.0;
                                g = 0.92 + Math.random() * 0.05;
                                b = 0.2 + Math.random() * 0.1;
                            } else if (normalizedDistance < 0.65) {
                                // Vùng giữa - vàng tươi
                                r = 1.0;
                                g = 0.85 + Math.random() * 0.05;
                                b = 0.05 + Math.random() * 0.05;
                            } else {
                                // Rìa ngoài - vàng chuẩn #FFCD00
                                r = 1.0;
                                g = 0.804;
                                b = 0.0;
                            }
                        }
                        
                    } else {
                        // Nền đỏ chuẩn
                        x = (Math.random() - 0.5) * flagWidth;
                        y = (Math.random() - 0.5) * flagHeight;
                        z = (Math.random() - 0.5) * 0.1;
                        
                        // Màu đỏ chuẩn #DA251D
                        r = 0.855;
                        g = 0.145;
                        b = 0.114;
                    }
                    
                } else { // Galaxy - Saturn-like planet with rings
                    const totalParticles = PARTICLE_COUNT;
                    const planetParticles = totalParticles * 0.4; // 40% for planet
                    const ringParticles = totalParticles * 0.6;   // 60% for rings
                    
                    if (i < planetParticles) {
                        // Planet sphere (like Saturn)
                        const phi = Math.acos(2 * (i / planetParticles) - 1);
                        const theta = Math.sqrt(planetParticles * Math.PI) * phi;
                        const radius = 1.5 + (Math.random() - 0.5) * 0.1;
                        
                        x = radius * Math.sin(phi) * Math.cos(theta);
                        y = radius * Math.sin(phi) * Math.sin(theta);
                        z = radius * Math.cos(phi);
                        
                        // Saturn colors - orange/yellow with bands
                        const band = Math.abs(Math.sin(phi * 8));
                        r = 0.9 + Math.random() * 0.1;
                        g = 0.6 + band * 0.3;
                        b = 0.2 + Math.random() * 0.1;
                        
                    } else {
                        // Ring system (like Saturn's rings)
                        const ringIndex = i - planetParticles;
                        const ringProgress = ringIndex / ringParticles;
                        
                        // Multiple ring layers
                        const ringLayer = Math.floor(ringProgress * 5);
                        const angle = Math.random() * Math.PI * 2;
                        
                        // Ring radius varies by layer
                        const innerRadius = 2.0 + ringLayer * 0.4;
                        const outerRadius = innerRadius + 0.3;
                        const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
                        
                        x = Math.cos(angle) * radius;
                        z = Math.sin(angle) * radius;
                        y = (Math.random() - 0.5) * 0.08; // Very thin rings
                        
                        // Ring colors - gray/silver with transparency variation
                        const brightness = 0.4 + Math.random() * 0.4;
                        r = brightness;
                        g = brightness * 0.95;
                        b = brightness * 0.9;
                    }
                }
                
                // Store base position (formed shape)
                basePositions[i * 3] = x;
                basePositions[i * 3 + 1] = y;
                basePositions[i * 3 + 2] = z;
                
                // Store spread position (scattered with direction from center)
                // Tính vector hướng từ tâm (0,0,0) đến particle
                const centerX = 0;
                const centerY = 0;
                const centerZ = 0;
                
                const dirX = x - centerX;
                const dirY = y - centerY;
                const dirZ = z - centerZ;
                const distance = Math.sqrt(dirX*dirX + dirY*dirY + dirZ*dirZ);
                
                // Normalize direction và spread theo hướng đó
                if (distance > 0.01) {
                    const normalizedDirX = dirX / distance;
                    const normalizedDirY = dirY / distance;
                    const normalizedDirZ = dirZ / distance;
                    
                    const spreadDistance = distance * 3 + Math.random() * 4;
                    
                    spreadPositions[i * 3] = centerX + normalizedDirX * spreadDistance;
                    spreadPositions[i * 3 + 1] = centerY + normalizedDirY * spreadDistance;
                    spreadPositions[i * 3 + 2] = centerZ + normalizedDirZ * spreadDistance;
                } else {
                    // Particles tại tâm - random spread
                    const randomAngle = Math.random() * Math.PI * 2;
                    const randomDistance = 3 + Math.random() * 4;
                    spreadPositions[i * 3] = Math.cos(randomAngle) * randomDistance;
                    spreadPositions[i * 3 + 1] = Math.sin(randomAngle) * randomDistance;
                    spreadPositions[i * 3 + 2] = (Math.random() - 0.5) * randomDistance;
                }
                
                // Start with base position
                pos[i * 3] = x;
                pos[i * 3 + 1] = y;
                pos[i * 3 + 2] = z;
                
                cols[i * 3] = r;
                cols[i * 3 + 1] = g;
                cols[i * 3 + 2] = b;
            }
            
            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.color.needsUpdate = true;
        };

        updatePositions(shape);

        // --- MEDIAPIPE HAND TRACKING ---
        let morphProgress = 0; // 0 = formed (closed hand), 1 = spread (open hand)
        const targetMorph = { value: 0 };
        
        const hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        hands.onResults((results) => {
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                const landmarks = results.multiHandLandmarks[0];
                
                // Distance between thumb tip (4) and index finger tip (8)
                const dx = landmarks[4].x - landmarks[8].x;
                const dy = landmarks[4].y - landmarks[8].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Map distance to morph: closed hand (0) = formed, open hand (1) = spread
                targetMorph.value = THREE.MathUtils.clamp(distance * 3, 0, 1);
            }
        });

        // Setup webcam
        const videoElement = document.createElement('video');
        videoElement.style.display = 'none';
        videoRef.current = videoElement;
        
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: 640, height: 480 } 
                });
                videoElement.srcObject = stream;
                await videoElement.play();
                
                const predict = async () => {
                    if (videoElement.readyState === 4) {
                        await hands.send({ image: videoElement });
                    }
                    requestAnimationFrame(predict);
                };
                predict();
            } catch (error) {
                console.warn('Camera access denied:', error);
            }
        };
        
        startCamera();

        // --- ANIMATION LOOP ---
        const animate = () => {
            requestAnimationFrame(animate);
            
            // Smooth morph transition between formed and spread
            morphProgress = THREE.MathUtils.lerp(morphProgress, targetMorph.value, 0.06);
            
            // Interpolate between base and spread positions with easing
            const pos = geometry.attributes.position.array;
            const easedProgress = morphProgress * morphProgress * (3 - 2 * morphProgress); // Smoothstep
            
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const i3 = i * 3;
                pos[i3] = THREE.MathUtils.lerp(basePositions[i3], spreadPositions[i3], easedProgress);
                pos[i3 + 1] = THREE.MathUtils.lerp(basePositions[i3 + 1], spreadPositions[i3 + 1], easedProgress);
                pos[i3 + 2] = THREE.MathUtils.lerp(basePositions[i3 + 2], spreadPositions[i3 + 2], easedProgress);
            }
            geometry.attributes.position.needsUpdate = true;
            
            // Disable auto-rotate when hand is detected
            if (morphProgress > 0.05) {
                controls.autoRotate = false;
            } else {
                controls.autoRotate = true;
            }
            
            // Update controls
            controls.update();
            
            renderer.render(scene, camera);
        };
        animate();

        // Handle window resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
            
            if (controlsRef.current) {
                controlsRef.current.dispose();
            }
            
            renderer.dispose();
            geometry.dispose();
            material.dispose();
            
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [shape]);

    // Update color when shape changes (auto set default color)
    useEffect(() => {
        if (defaultColors[shape]) {
            setColor(defaultColors[shape]);
        }
    }, [shape]);
    
    // Update color when manually changed (not needed with vertex colors but kept for compatibility)
    useEffect(() => {
        // Color is now handled by vertex colors in updatePositions
    }, [color]);

    const handleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    return (
        <div style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 9999, 
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Canvas Container */}
            <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

            {/* UI Control Panel */}
            <div style={{ 
                position: 'absolute', 
                top: 20, 
                left: 20,
                background: 'rgba(255, 255, 255, 0.08)', 
                backdropFilter: 'blur(15px)',
                padding: '20px', 
                borderRadius: '15px', 
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                zIndex: 10001,
                minWidth: '220px'
            }}>
                <h3 style={{ 
                    color: 'white', 
                    margin: '0 0 15px 0', 
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    letterSpacing: '0.5px'
                }}>
                    Particle Control
                </h3>
                
                {/* Shape Selector */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ 
                        color: 'rgba(255, 255, 255, 0.7)', 
                        fontSize: '0.75rem',
                        display: 'block',
                        marginBottom: '5px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        Shape
                    </label>
                    <select 
                        value={shape} 
                        onChange={(e) => setShape(e.target.value)} 
                        style={{ 
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.1)', 
                            color: 'white', 
                            border: '1px solid rgba(255, 255, 255, 0.2)', 
                            padding: '10px',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        <option value="galaxy" style={{ background: '#1a1a2e' }}>🪐 Saturn Planet</option>
                        <option value="heart" style={{ background: '#1a1a2e' }}>❤️ Heart</option>
                        <option value="flower" style={{ background: '#1a1a2e' }}>🌸 Flower</option>
                        <option value="vietnam" style={{ background: '#1a1a2e' }}>⭐ Vietnam Flag</option>
                    </select>
                </div>

                {/* Color Picker */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ 
                        color: 'rgba(255, 255, 255, 0.7)', 
                        fontSize: '0.75rem',
                        display: 'block',
                        marginBottom: '5px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        Color
                    </label>
                    <input 
                        type="color" 
                        value={color} 
                        onChange={(e) => setColor(e.target.value)}
                        style={{
                            width: '100%',
                            height: '40px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: 'transparent'
                        }}
                    />
                </div>

                {/* Fullscreen Button */}
                <button 
                    onClick={handleFullscreen}
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        marginBottom: '15px',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                        e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.transform = 'translateY(0)';
                    }}
                >
                    {isFullscreen ? '🗗 Exit Fullscreen' : '🗖 Fullscreen'}
                </button>

                {/* Info Text */}
                <div style={{ 
                    color: 'rgba(255, 255, 255, 0.5)', 
                    fontSize: '0.7rem',
                    lineHeight: '1.4',
                    marginTop: '10px',
                    padding: '8px',
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '6px'
                }}>
                    👋 Close hand = Form shape<br/>
                    🖐️ Open hand = Scatter particles<br/>
                    🔄 Drag to rotate view
                </div>
            </div>

            {/* Close Button */}
            <button 
                onClick={onClose}
                style={{
                    position: 'absolute', 
                    top: 20, 
                    right: 20,
                    padding: '12px 24px', 
                    borderRadius: '50px',
                    border: 'none', 
                    background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)', 
                    color: 'white',
                    cursor: 'pointer', 
                    zIndex: 10001,
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    boxShadow: '0 4px 15px rgba(255, 65, 108, 0.4)',
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 6px 20px rgba(255, 65, 108, 0.6)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 4px 15px rgba(255, 65, 108, 0.4)';
                }}
            >
                ✕ Close Experience
            </button>

            {/* Instructions Overlay */}
            <div style={{ 
                position: 'absolute', 
                bottom: 30, 
                left: '50%', 
                transform: 'translateX(-50%)',
                background: 'rgba(0, 0, 0, 0.6)', 
                backdropFilter: 'blur(10px)',
                padding: '12px 24px', 
                borderRadius: '25px', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                zIndex: 10001,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <span style={{ fontSize: '1.2rem' }}>✊</span>
                <span style={{ 
                    color: 'white', 
                    fontSize: '0.85rem',
                    fontWeight: '500'
                }}>
                    Close hand to form • Open hand to scatter
                </span>
                <span style={{ fontSize: '1.2rem' }}>🖐️</span>
            </div>
        </div>
    );
};

export default ThreeBackground;