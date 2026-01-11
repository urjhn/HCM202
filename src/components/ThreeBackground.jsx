import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { trackEvent } from '../utils/tracking'; // Tracking

const ThreeBackground = ({ onClose }) => {
    const containerRef = useRef(null);
    const videoRef = useRef(null);
    const [statusText, setStatusText] = useState("🇻🇳 VIET NAM 🇻🇳");
    const [statusColor, setStatusColor] = useState("#FFD700");
    const [guideText, setGuideText] = useState("Loading AI Model...");

    // System Config
    const CONFIG = {
        goldCount: 2000,
        redCount: 4000, // More red for the flag background
        photoOrbitRadius: 35,
        flagWidth: 80,
        flagHeight: 50
    };

    useEffect(() => {
        // Track 3D View
        trackEvent('3d_view');

        if (!containerRef.current) return;

        // --- RESOURCES ---
        const MUSIC_URL = "/audio.mp3";
        let bgMusic = new Audio(MUSIC_URL);
        bgMusic.loop = true;
        bgMusic.volume = 1.0;

        const loader = new THREE.TextureLoader();
        const photoFiles = ['/image1.jpeg', '/image2.jpeg', '/image3.jpeg', '/image4.jpeg', '/image5.jpeg'];
        const photoTextures = photoFiles.map(f => loader.load(f));

        // --- UTILS ---
        const createCustomTexture = (type) => {
            const canvas = document.createElement('canvas');
            canvas.width = 128; canvas.height = 128;
            const ctx = canvas.getContext('2d');
            const cx = 64, cy = 64;

            if (type === 'gold_glow') {
                const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
                grd.addColorStop(0, '#FFFFFF');
                grd.addColorStop(0.2, '#FFFFE0');
                grd.addColorStop(0.5, '#FFD700');
                grd.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grd; ctx.fillRect(0, 0, 128, 128);
            } else if (type === 'red_light') {
                const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50);
                grd.addColorStop(0, '#FFAAAA');
                grd.addColorStop(0.3, '#FF0000');
                grd.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grd; ctx.fillRect(0, 0, 128, 128);
            }
            return new THREE.CanvasTexture(canvas);
        };

        const textures = {
            gold: createCustomTexture('gold_glow'),
            red: createCustomTexture('red_light')
        };

        // --- 3D SCENE SETUP ---
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.002);

        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 100;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.innerHTML = ''; // Clear previous
        containerRef.current.appendChild(renderer.domElement);

        // --- GLOBAL VARIABLES ---
        let groupGold, groupRed;
        let photoMeshes = [];
        let titleMesh, heartMesh; // "VIET NAM" and "WE LOVE VIET NAM"

        let state = 'FLAG';
        let selectedIndex = 0;
        let handX = 0.5;

        // --- CREATE PARTICLES ---
        function createParticleSystem(type, count, size) {
            const pPositions = [];
            const pFlagTargets = [];
            const pExplodeTargets = [];
            const pHeartTargets = [];
            const sizes = [];
            const phases = [];

            for (let i = 0; i < count; i++) {
                // 1. INITIAL POSITION (Random scatter)
                pPositions.push((Math.random() - 0.5) * 120, (Math.random() - 0.5) * 120, (Math.random() - 0.5) * 120);

                // 2. FLAG TARGETS
                let tx, ty, tz;
                const flagW = CONFIG.flagWidth;
                const flagH = CONFIG.flagHeight;

                if (type === 'gold') {
                    // 5-POINTED STAR SHAPE
                    // Star radius
                    const R = 20;
                    const r = R * 0.382; // inner radius ratio for 5-pointed star

                    // Rejection sampling for uniform fill inside star
                    let valid = false;
                    while (!valid) {
                        // Bounding box of star
                        const px = (Math.random() - 0.5) * 2 * R;
                        const py = (Math.random() - 0.5) * 2 * R;

                        // We will implement rejection sampling with a "Point in Star" function.
                        if (isPointInStar(px, py, 20, 20 * 0.382)) {
                            tx = px; ty = py; tz = 0;
                            valid = true;
                        }
                    }
                } else {
                    // RED BACKGROUND
                    // Rectangle covering flag size
                    tx = (Math.random() - 0.5) * flagW;
                    ty = (Math.random() - 0.5) * flagH;
                    tz = (Math.random() - 0.5) * 1;

                    // HOLE FOR STAR?
                    // "ĐÚNG" flag means star is yellow, background is red. They shouldn't overlap cleanly or just layer?
                    // Layering is fine, but checking if point is in star to EXCLUDE red makes it cleaner.
                    if (isPointInStar(tx, ty, 20, 20 * 0.382)) {
                        // Push slightly back or skip?
                        // To allow Yellow to pop, let's remove red from star area.
                        // Retry pos
                        i--; continue;
                    }
                }
                pFlagTargets.push(tx, ty, tz);

                // 3. EXPLODE TARGETS (Wider & Faster feel -> larger radius)
                const u = Math.random();
                const v = Math.random();
                const phi = Math.acos(2 * v - 1);
                const lam = 2 * Math.PI * u;
                const rad = 100 * Math.cbrt(Math.random()); // Increased from 65 to 100 for wider scatter
                pExplodeTargets.push(rad * Math.sin(phi) * Math.cos(lam), rad * Math.sin(phi) * Math.sin(lam), rad * Math.cos(phi));

                // 4. HEART TARGETS
                const tHeart = Math.random() * Math.PI * 2;
                let hx = 16 * Math.pow(Math.sin(tHeart), 3);
                let hy = 13 * Math.cos(tHeart) - 5 * Math.cos(2 * tHeart) - 2 * Math.cos(3 * tHeart) - Math.cos(4 * tHeart);
                const rFill = Math.pow(Math.random(), 0.3); // Soft fill
                hx *= rFill; hy *= rFill;
                const scaleH = 2.2;
                pHeartTargets.push(hx * scaleH, hy * scaleH + 5, 0);

                sizes.push(size);
                phases.push(Math.random() * Math.PI * 2);
            }

            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.Float32BufferAttribute(pPositions, 3));
            geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

            const colors = new Float32Array(count * 3);
            const baseColor = new THREE.Color();
            if (type === 'gold') baseColor.setHex(0xFFD700);
            else baseColor.setHex(0xDA251D); // Official Flag Red #DA251D

            for (let i = 0; i < count; i++) {
                colors[i * 3] = baseColor.r;
                colors[i * 3 + 1] = baseColor.g;
                colors[i * 3 + 2] = baseColor.b;
            }
            geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            geo.userData = {
                flag: pFlagTargets, explode: pExplodeTargets, heart: pHeartTargets,
                phases: phases, baseColor: baseColor, baseSize: size
            };

            const mat = new THREE.PointsMaterial({
                size: size,
                map: textures[type],
                transparent: true, opacity: 1.0,
                vertexColors: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false, // Important for transp
                sizeAttenuation: true
            });

            const points = new THREE.Points(geo, mat);
            scene.add(points);
            return points;
        }

        // Helper: Check if point (x, y) is inside a 5-pointed star centered at 0,0 with outer radius R, inner r
        function isPointInStar(x, y, R, r) {
            // Rotate so one point is up (which is standard logic)
            // atan2(y, x) -> 0 is Right. PI/2 is Up.
            // Our logic: Up is tip.
            let ang = Math.atan2(y, x) - Math.PI / 2 + Math.PI / 5; // 0 is Up, +36deg to align peak
            // Normalize to 0..2PI
            if (ang < 0) ang += Math.PI * 2;

            // 5 sectors
            const sectorStep = Math.PI * 2 / 5;
            const localAng = ang % sectorStep; // Angle within the current 72-degree sector.
            const mid = sectorStep / 2; // 36 deg

            // Map to 0..36 deg from a peak
            const alpha = Math.abs(localAng - mid);

            const dist = Math.sqrt(x * x + y * y);
            if (dist > R) return false;
            if (dist < r) return true;

            const r_val = r;
            const R_val = R;
            const ang36 = 36 * Math.PI / 180;
            const sin36 = Math.sin(ang36);
            const cos36 = Math.cos(ang36);

            const m = (r_val * cos36 - R_val) / (r_val * sin36);

            // Project point distance to X/Y local logic
            // alpha is angle from Peak (0).
            const X_p = dist * Math.sin(alpha);
            const Y_p = dist * Math.cos(alpha);

            // Check
            return Y_p <= (m * X_p + R_val);
        }

        groupGold = createParticleSystem('gold', CONFIG.goldCount, 2.5);
        groupRed = createParticleSystem('red', CONFIG.redCount, 4.0);

        // --- PHOTOS ---
        function createPhotos() {
            const geo = new THREE.PlaneGeometry(8, 8);
            const borderGeo = new THREE.PlaneGeometry(9, 9);
            const borderMat = new THREE.MeshBasicMaterial({ color: 0xFFD700 });

            for (let i = 0; i < 5; i++) {
                const mat = new THREE.MeshBasicMaterial({ map: photoTextures[i], side: THREE.DoubleSide });
                const mesh = new THREE.Mesh(geo, mat);
                const border = new THREE.Mesh(borderGeo, borderMat);
                border.position.z = -0.1;
                mesh.add(border);
                mesh.visible = false; mesh.scale.set(0, 0, 0);
                scene.add(mesh);
                photoMeshes.push(mesh);
            }
        }
        createPhotos();

        // --- DECORATIONS (TEXT) ---
        function createTextTexture(text, fontSize = 90, color = '#FFD700') {
            const canvas = document.createElement('canvas');
            canvas.width = 1024; canvas.height = 256;
            const ctx = canvas.getContext('2d');
            ctx.font = `bold italic ${fontSize}px "Times New Roman"`;
            ctx.fillStyle = color; ctx.textAlign = 'center';
            ctx.shadowColor = "#FF0000"; ctx.shadowBlur = 40;
            ctx.fillText(text, 512, 130);
            return new THREE.CanvasTexture(canvas);
        }

        function createDecorations() {
            // VIET NAM Title
            const tex = createTextTexture("VIET NAM");
            const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending });
            titleMesh = new THREE.Mesh(new THREE.PlaneGeometry(60, 15), mat);
            titleMesh.position.set(0, 40, 0); // Above Flag
            scene.add(titleMesh);

            // WE LOVE VIET NAM
            const loveTex = createTextTexture("WE LOVE VIET NAM ❤️", 90, '#FFD700');
            const loveMat = new THREE.MeshBasicMaterial({ map: loveTex, transparent: true, blending: THREE.AdditiveBlending });
            heartMesh = new THREE.Mesh(new THREE.PlaneGeometry(80, 20), loveMat);
            heartMesh.position.set(0, 0, 20);
            heartMesh.visible = false;
            scene.add(heartMesh);
        }
        createDecorations();

        // --- ANIMATION UPDATE ---
        function updateParticleGroup(group, type, targetState, speed, handRotY, time) {
            const positions = group.geometry.attributes.position.array;
            const sizes = group.geometry.attributes.size.array;
            const phases = group.geometry.userData.phases;
            const baseSize = group.geometry.userData.baseSize;

            const targetKey = (targetState === 'FLAG') ? 'flag' : (targetState === 'HEART' ? 'heart' : 'explode');
            // If viewing photo, we also just explode/scatter slightly or stay out of way. Let's use explode targets.
            const targets = group.geometry.userData[(targetState === 'PHOTO') ? 'explode' : targetKey];

            for (let i = 0; i < positions.length; i++) {
                positions[i] += (targets[i] - positions[i]) * speed;
            }
            group.geometry.attributes.position.needsUpdate = true;

            // Animation (Waving Flag or Pulse)
            if (targetState === 'FLAG') {
                group.rotation.y = 0;
                group.scale.set(1, 1, 1);

                // Waving effect for Flag
                for (let i = 0; i < positions.length / 3; i++) {
                    const x = positions[i * 3];
                    const z = Math.sin(x * 0.1 + time * 3) * 2;
                    // We only modify Z for visual wave, but here we are lerping to target. 
                    // Let's simpler: just rotate whole group slightly or do vertex shader wave. 
                    // For simplicity in JS:
                    // Reset Z to target first (done by lerp above) then add wave? 
                    // Actually let's just let them be static for sharpness or gentle float.
                    sizes[i] = baseSize * (0.8 + 0.4 * Math.sin(time * 5 + phases[i]));
                }
                // Gentle sway
                group.rotation.z = Math.sin(time) * 0.05;

            } else if (targetState === 'HEART') {
                const beatScale = 1 + Math.abs(Math.sin(time * 3)) * 0.15;
                group.scale.set(beatScale, beatScale, beatScale);
                group.rotation.y = 0;

            } else { // EXPLODE
                group.scale.set(1, 1, 1);
                group.rotation.y += (handRotY - group.rotation.y) * 0.1;
                group.rotation.z = 0;
            }
            group.geometry.attributes.size.needsUpdate = true;
        }

        const animate = () => {
            requestAnimationFrame(animate);
            const time = Date.now() * 0.001;
            const speed = 0.08;
            const handRotY = (handX - 0.5) * 4.0;

            updateParticleGroup(groupGold, 'gold', state, speed, handRotY, time);
            updateParticleGroup(groupRed, 'red', state, speed, handRotY, time);

            // Text Visibility
            if (state === 'FLAG') {
                titleMesh.visible = true;
                titleMesh.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
                heartMesh.visible = false;

                // Hide photos
                photoMeshes.forEach(m => { m.scale.lerp(new THREE.Vector3(0, 0, 0), 0.1); m.visible = false; });

            } else if (state === 'HEART') {
                titleMesh.visible = false;
                heartMesh.visible = true;
                const s = 1 + Math.abs(Math.sin(time * 3)) * 0.1;
                heartMesh.scale.set(s, s, 1);

                photoMeshes.forEach(m => { m.visible = false; });

            } else if (state === 'EXPLODE') {
                titleMesh.visible = false;
                heartMesh.visible = false;

                // Orbit Photos
                const baseAngle = groupGold.rotation.y; // synced with particles rotation
                const angleStep = (Math.PI * 2) / 5;
                let bestIdx = 0; let maxZ = -999;

                photoMeshes.forEach((mesh, i) => {
                    mesh.visible = true;
                    const angle = baseAngle + i * angleStep;
                    const x = Math.sin(angle) * CONFIG.photoOrbitRadius;
                    const z = Math.cos(angle) * CONFIG.photoOrbitRadius;
                    const y = Math.sin(time + i) * 3;

                    mesh.position.lerp(new THREE.Vector3(x, y, z), 0.1);
                    mesh.lookAt(camera.position);

                    if (z > maxZ) { maxZ = z; bestIdx = i; }

                    if (z > 5) {
                        const ds = 1.0 + (z / CONFIG.photoOrbitRadius) * 0.8;
                        mesh.scale.lerp(new THREE.Vector3(ds, ds, ds), 0.1);
                    } else {
                        mesh.scale.lerp(new THREE.Vector3(0.6, 0.6, 0.6), 0.1);
                    }
                });
                selectedIndex = bestIdx;

            } else if (state === 'PHOTO') {
                titleMesh.visible = false;
                heartMesh.visible = false;

                photoMeshes.forEach((mesh, i) => {
                    if (i === selectedIndex) {
                        mesh.position.lerp(new THREE.Vector3(0, 0, 60), 0.1);
                        mesh.scale.lerp(new THREE.Vector3(5, 5, 5), 0.1);
                        mesh.lookAt(camera.position);
                        mesh.rotation.z = 0;
                    } else {
                        mesh.scale.lerp(new THREE.Vector3(0, 0, 0), 0.1);
                    }
                });
            }

            renderer.render(scene, camera);
        };
        animate();

        // --- MEDIAPIPE ---
        let cameraUtils;
        const videoElement = document.createElement('video');
        videoElement.classList.add('input_video');
        videoElement.style.display = 'none';
        document.body.appendChild(videoElement); // Temp append for camera utils
        videoRef.current = videoElement;

        const hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
        hands.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });

        hands.onResults((results) => {
            // 2 Hands Logic (Heart)
            if (results.multiHandLandmarks.length === 2) {
                const h1 = results.multiHandLandmarks[0];
                const h2 = results.multiHandLandmarks[1];
                const distIndex = Math.hypot(h1[8].x - h2[8].x, h1[8].y - h2[8].y);
                const distThumb = Math.hypot(h1[4].x - h2[4].x, h1[4].y - h2[4].y);
                if (distIndex < 0.2 && distThumb < 0.2) {
                    state = 'HEART';
                    setStatusText("❤️ WE LOVE VIET NAM ❤️");
                    setStatusColor("#FF69B4");
                    return;
                }
            }

            // 1 Hand Logic
            if (results.multiHandLandmarks.length > 0) {
                const lm = results.multiHandLandmarks[0];
                handX = lm[9].x;

                const tips = [8, 12, 16, 20]; const wrist = lm[0];
                let openDist = 0; tips.forEach(i => openDist += Math.hypot(lm[i].x - wrist.x, lm[i].y - wrist.y));
                const avgDist = openDist / 4;
                const pinchDist = Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y);

                if (avgDist < 0.25) {
                    state = 'FLAG';
                    setStatusText("🇻🇳 VIET NAM 🇻🇳");
                    setStatusColor("#FFD700");
                } else if (pinchDist < 0.05) {
                    state = 'PHOTO';
                    setStatusText("👌 VIEW PHOTO");
                    setStatusColor("#00FFFF");
                } else {
                    state = 'EXPLODE';
                    setStatusText("🖐️ EXPLODE");
                    setStatusColor("#FFA500");
                }
            } else {
                state = 'FLAG';
                setStatusText("🇻🇳 VIET NAM 🇻🇳");
                setStatusColor("#FFD700");
            }
        });

        // Start Camera
        const startSystem = async () => {
            bgMusic.play().catch(e => console.log("Audio play failed (user interaction needed):", e));
            setGuideText("Camera Active! Use gestures.");

            if (videoRef.current) {
                cameraUtils = new Camera(videoRef.current, {
                    onFrame: async () => { await hands.send({ image: videoRef.current }); },
                    width: 320, height: 240
                });
                await cameraUtils.start();
            }
        };

        // Trigger start immediately or wait for user? 
        // User requested button "START MAGIC".
        // Use external trigger via ref or just auto-start if allowed? 
        // Let's use the button in the UI overlay.

        window.startMagic = startSystem; // Global hook for button

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (cameraUtils) cameraUtils.stop();
            if (videoRef.current) videoRef.current.remove();
            bgMusic.pause();
            renderer.dispose();
            if (containerRef.current) containerRef.current.innerHTML = '';
        };

    }, []);

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'black' }}>
            {/* CANVAS */}
            <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />

            {/* UI LAYOUT */}
            <div style={{
                position: 'absolute', bottom: 30, width: '100%',
                textAlign: 'center', pointerEvents: 'none', zIndex: 100
            }}>
                {/* STATUS BADGE */}
                <div style={{
                    display: 'inline-block', background: 'rgba(0,0,0,0.7)',
                    border: `2px solid ${statusColor}`, color: statusColor,
                    padding: '10px 25px', borderRadius: '50px',
                    fontSize: '18px', fontWeight: 'bold', marginBottom: '15px',
                    boxShadow: `0 0 20px ${statusColor}80`
                }}>
                    {statusText}
                </div>

                {/* GUIDE */}
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '20px', textShadow: '0 2px 4px black' }}>
                    🖐 <b>Open:</b> Explode &nbsp;|&nbsp;
                    👌 <b>Pinch:</b> Photo &nbsp;|&nbsp;
                    ✊ <b>Fist:</b> Flag &nbsp;|&nbsp;
                    👐 <b>2 Hands:</b> Heart
                </div>

                {/* START BUTTON */}
                <button
                    onClick={() => {
                        window.startMagic && window.startMagic();
                        // Hide button after click visually
                        document.getElementById('btnStartMagic').style.display = 'none';
                    }}
                    id="btnStartMagic"
                    style={{
                        pointerEvents: 'auto', cursor: 'pointer',
                        background: 'linear-gradient(to bottom, #D32F2F, #8B0000)',
                        color: '#FFF', border: '2px solid #FFD700',
                        padding: '15px 50px', borderRadius: '30px',
                        fontWeight: '800', fontSize: '16px',
                        boxShadow: '0 0 30px rgba(255, 0, 0, 0.6)',
                        animation: 'pulse 1.5s infinite'
                    }}
                >
                    🇻🇳 START MAGIC 🇻🇳
                </button>
            </div>

            {/* CLOSE BUTTON */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute', top: 20, right: 20,
                    padding: '10px 20px', borderRadius: '20px',
                    border: 'none', background: '#333', color: 'white',
                    pointerEvents: 'auto', cursor: 'pointer', zIndex: 101
                }}
            >
                ✕ Close
            </button>

            {/* COPYRIGHT */}
            <div style={{
                position: 'absolute', bottom: 10, right: 15,
                color: 'rgba(255,255,255,0.3)', fontSize: '12px',
                fontStyle: 'italic'
            }}>
                © Powered by Three.js & MediaPipe
            </div>

            <style>{`
                @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
            `}</style>
        </div>
    );
};

export default ThreeBackground;