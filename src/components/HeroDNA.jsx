import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

const HeroDNA = ({ isMobile }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x060a14, isMobile ? 0.015 : 0.012); // Slightly less fog on mobile

        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
        camera.position.set(0, 0, isMobile ? 45 : 35); // Adjusted for mobile view

        const renderer = new THREE.WebGLRenderer({ 
            canvas, 
            antialias: !isMobile, // Disable antialiasing on mobile for performance
            alpha: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        // On mobile, cap pixel ratio at 1.5 to save GPU cycles
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
        renderer.setClearColor(0x060a14, 0); 
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;

        // ─── POST-PROCESSING (BLOOM) ───
        // Disable bloom on mobile for significant performance gains
        let composer = null;
        let bloomPass = null;
        if (!isMobile) {
            composer = new EffectComposer(renderer);
            composer.addPass(new RenderPass(scene, camera));
            bloomPass = new UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                1.4, 0.6, 0.15
            );
            composer.addPass(bloomPass);
            composer.addPass(new OutputPass());
        }

        // ─── SCENE LIGHTING ───
        // Reduced light count for mobile performance
        const ambientLight = new THREE.AmbientLight(0x1a2a4a, 0.5);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0x4a8eff, 0.8);
        keyLight.position.set(10, 15, 10);
        scene.add(keyLight);

        if (!isMobile) {
            const rimLight = new THREE.DirectionalLight(0x00d4ff, 0.4);
            rimLight.position.set(-10, -5, -10);
            scene.add(rimLight);
            
            const pointLight1 = new THREE.PointLight(0x2d7aff, 2, 50);
            pointLight1.position.set(15, 5, 5);
            scene.add(pointLight1);
        }

        const pointLight2 = new THREE.PointLight(0x00d4ff, isMobile ? 1.0 : 1.5, 50);
        pointLight2.position.set(-10, -8, 8);
        scene.add(pointLight2);

        // ─── HELPER: Build one DNA helix group ───
        function buildDNA(opts) {
            const group = new THREE.Group();
            let { radius, height, turns, stepsPerTurn, tubeRadius, nodeRadius } = opts;
            
            // Reduce complexity for mobile
            if (isMobile) {
                stepsPerTurn = Math.round(stepsPerTurn / 2.5);
                turns = Math.min(turns, 5);
            }
            
            const totalSteps = turns * stepsPerTurn;

            const bp1 = [], bp2 = [];
            for (let i = 0; i <= totalSteps; i++) {
                const t = i / totalSteps;
                const angle = t * turns * Math.PI * 2;
                const y = t * height - height / 2;
                bp1.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
                bp2.push(new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius));
            }

            const curve1 = new THREE.CatmullRomCurve3(bp1);
            const curve2 = new THREE.CatmullRomCurve3(bp2);

            const strandMat1 = new THREE.MeshStandardMaterial({
                color: 0x2d7aff, emissive: 0x2d7aff, emissiveIntensity: isMobile ? 0.3 : 0.9,
                transparent: true, opacity: opts.strandOpacity ?? 0.85, roughness: 0.3, metalness: 0.6
            });
            const strandMat2 = new THREE.MeshStandardMaterial({
                color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: isMobile ? 0.2 : 0.7,
                transparent: true, opacity: (opts.strandOpacity ?? 0.85) * 0.85, roughness: 0.3, metalness: 0.6
            });

            // Simplify Tube Geometry for mobile
            const radialSegments = isMobile ? 4 : 8;
            const tubularSegments = totalSteps * (isMobile ? 1 : 2);
            
            const tube1 = new THREE.Mesh(new THREE.TubeGeometry(curve1, tubularSegments, tubeRadius, radialSegments, false), strandMat1);
            group.add(tube1);
            const tube2 = new THREE.Mesh(new THREE.TubeGeometry(curve2, tubularSegments, tubeRadius, radialSegments, false), strandMat2);
            group.add(tube2);

            const basePairColors = [
                [0xff4060, 0x40ff90], 
                [0xff9020, 0xa050ff],
            ];
            const basePairInterval = isMobile ? (opts.basePairInterval ?? 4) * 2 : (opts.basePairInterval ?? 4);

            for (let i = 0; i < totalSteps; i += basePairInterval) {
                const t = i / totalSteps;
                const p1 = curve1.getPoint(t);
                const p2 = curve2.getPoint(t);
                const mid = p1.clone().add(p2).multiplyScalar(0.5);
                const dir = p2.clone().sub(p1);
                const colorPair = basePairColors[(i / basePairInterval) % 2];

                for (let half = 0; half < 2; half++) {
                    const start = half === 0 ? p1 : p2;
                    const halfDir = mid.clone().sub(start);
                    const halfLen = halfDir.length();
                    const halfCenter = start.clone().add(mid).multiplyScalar(0.5);

                    const mat = new THREE.MeshStandardMaterial({
                        color: colorPair[half], emissive: colorPair[half],
                        emissiveIntensity: 0.5, transparent: true,
                        opacity: opts.rungOpacity ?? 0.7, roughness: 0.4, metalness: 0.3
                    });

                    // Cylinder geometry simplification
                    const geo = new THREE.CylinderGeometry(tubeRadius * 0.5, tubeRadius * 0.5, halfLen, isMobile ? 4 : 6);
                    const mesh = new THREE.Mesh(geo, mat);
                    mesh.position.copy(halfCenter);
                    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), halfDir.normalize());
                    group.add(mesh);
                }

                if (!isMobile) { // Skip bond spheres on mobile
                    const bondMat = new THREE.MeshStandardMaterial({
                        color: 0xffffff, emissive: 0xaaddff, emissiveIntensity: 0.8,
                        transparent: true, opacity: opts.bondOpacity ?? 0.6
                    });
                    const bond = new THREE.Mesh(new THREE.SphereGeometry(tubeRadius * 0.35, 6, 6), bondMat);
                    bond.position.copy(mid);
                    group.add(bond);
                }
            }

            // Reducing node count for mobile
            const nodeInterval = isMobile ? (opts.nodeInterval ?? 5) * 2 : (opts.nodeInterval ?? 5);
            if (nodeInterval < totalSteps) {
                const nodeGeo = new THREE.SphereGeometry(nodeRadius, isMobile ? 6 : 10, isMobile ? 6 : 10);
                const nodeMat1 = new THREE.MeshStandardMaterial({
                    color: 0x4a9dff, emissive: 0x2d7aff, emissiveIntensity: 0.6,
                    transparent: true, opacity: opts.nodeOpacity ?? 0.85, roughness: 0.2, metalness: 0.7
                });
                const nodeMat2 = new THREE.MeshStandardMaterial({
                    color: 0x00e5ff, emissive: 0x00bbdd, emissiveIntensity: 0.5,
                    transparent: true, opacity: (opts.nodeOpacity ?? 0.85) * 0.9, roughness: 0.2, metalness: 0.7
                });
                for (let i = 0; i <= totalSteps; i += nodeInterval) {
                    const t = i / totalSteps;
                    const s1 = new THREE.Mesh(nodeGeo, nodeMat1);
                    s1.position.copy(curve1.getPoint(t));
                    group.add(s1);
                    const s2 = new THREE.Mesh(nodeGeo, nodeMat2);
                    s2.position.copy(curve2.getPoint(t));
                    group.add(s2);
                }
            }

            group.userData = { strandMat1, strandMat2 };
            return group;
        }

        // ─── MAIN DNA ───
        const dnaGroup = buildDNA({
            radius: isMobile ? 3.2 : 3.8, height: isMobile ? 55 : 65, turns: 7, stepsPerTurn: 42,
            tubeRadius: 0.1, nodeRadius: 0.18, basePairInterval: 4, nodeInterval: 5
        });
        dnaGroup.position.set(isMobile ? 0 : 13, 0, -3);
        dnaGroup.rotation.z = 0.15;
        scene.add(dnaGroup);

        // ─── SECOND DNA (Skip or simplify for mobile) ───
        let dna2 = null;
        if (!isMobile) {
            dna2 = buildDNA({
                radius: 2.8, height: 45, turns: 5, stepsPerTurn: 36,
                tubeRadius: 0.06, nodeRadius: 0.1, basePairInterval: 5, nodeInterval: 6,
                strandOpacity: 0.35, rungOpacity: 0.25, bondOpacity: 0.2, nodeOpacity: 0.3
            });
            dna2.position.set(-17, -5, -12);
            dna2.rotation.z = -0.3;
            dna2.scale.set(0.6, 0.6, 0.6);
            scene.add(dna2);
        }

        // ─── THIRD DNA (Skip for mobile) ───
        let dna3 = null;
        if (!isMobile) {
            dna3 = buildDNA({
                radius: 2, height: 35, turns: 4, stepsPerTurn: 30,
                tubeRadius: 0.04, nodeRadius: 0.06, basePairInterval: 6, nodeInterval: 8,
                strandOpacity: 0.15, rungOpacity: 0.08, bondOpacity: 0.06, nodeOpacity: 0.12
            });
            dna3.position.set(-5, 10, -25);
            dna3.rotation.z = 0.5;
            dna3.rotation.x = 0.3;
            dna3.scale.set(0.4, 0.4, 0.4);
            scene.add(dna3);
        }

        // ─── FLOATING MOLECULAR PARTICLES ───
        const particleCount = isMobile ? 120 : 1000; // Even more for desktop "premium" feel
        const particleGeo = new THREE.BufferGeometry();
        const pPositions = new Float32Array(particleCount * 3);
        const pColors = new Float32Array(particleCount * 3);
        const pSpeeds = new Float32Array(particleCount);
        for (let i = 0; i < particleCount; i++) {
            pPositions[i * 3] = (Math.random() - 0.5) * 100;
            pPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
            pPositions[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10;
            pSpeeds[i] = 0.3 + Math.random() * 0.7;
            const c = new THREE.Color().setHSL(0.55 + Math.random() * 0.12, 0.8, 0.4 + Math.random() * 0.4);
            pColors[i * 3] = c.r;
            pColors[i * 3 + 1] = c.g;
            pColors[i * 3 + 2] = c.b;
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
        particleGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

        const particleMat = new THREE.PointsMaterial({
            size: isMobile ? 0.25 : 0.15, vertexColors: true, transparent: true, opacity: 0.6,
            blending: THREE.AdditiveBlending, sizeAttenuation: true
        });
        const particles = new THREE.Points(particleGeo, particleMat);
        scene.add(particles);

        // ─── ORBITING ENERGY RINGS (Simplify for mobile) ───
        const ringGroup = new THREE.Group();
        const ringCount = isMobile ? 2 : 4;
        for (let i = 0; i < ringCount; i++) {
            const ringGeo = new THREE.TorusGeometry(6 + i * 3, 0.015, isMobile ? 4 : 8, isMobile ? 40 : 120);
            const ringMat = new THREE.MeshStandardMaterial({
                color: i % 2 === 0 ? 0x2d7aff : 0x00d4ff,
                emissive: i % 2 === 0 ? 0x2d7aff : 0x00d4ff,
                emissiveIntensity: 0.4, transparent: true,
                opacity: 0.2 - i * 0.03, roughness: 0.3
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2 + (i - 1.5) * 0.4;
            ring.rotation.y = i * 0.7;
            ringGroup.add(ring);
        }
        ringGroup.position.set(isMobile ? 0 : 13, 0, -3);
        scene.add(ringGroup);

        // Skip connection lines and hex grid on mobile for performance
        let hexGroup = null;
        let connectionGroup = null;
        if (!isMobile) {
            hexGroup = new THREE.Group();
            const hexMat = new THREE.MeshStandardMaterial({
                color: 0x2d7aff, emissive: 0x1a3a6a, emissiveIntensity: 0.3,
                transparent: true, opacity: 0.06, side: THREE.DoubleSide, roughness: 0.5
            });
            for (let row = -4; row <= 4; row++) {
                for (let col = -6; col <= 6; col++) {
                    const hex = new THREE.Mesh(new THREE.CircleGeometry(0.8, 6), hexMat);
                    const xOff = row % 2 === 0 ? 0 : 1.1;
                    hex.position.set(col * 2.2 + xOff, row * 1.9, -30);
                    hexGroup.add(hex);
                }
            }
            scene.add(hexGroup);

            connectionGroup = new THREE.Group();
            const connectionNodes = [];
            for (let i = 0; i < 30; i++) {
                connectionNodes.push(new THREE.Vector3(
                    (Math.random() - 0.5) * 60,
                    (Math.random() - 0.5) * 60,
                    -15 - Math.random() * 15
                ));
            }
            const lineMat = new THREE.LineBasicMaterial({
                color: 0x2d7aff, transparent: true, opacity: 0.06,
                blending: THREE.AdditiveBlending
            });
            for (let i = 0; i < connectionNodes.length; i++) {
                for (let j = i + 1; j < connectionNodes.length; j++) {
                    if (connectionNodes[i].distanceTo(connectionNodes[j]) < 20) {
                        const geo = new THREE.BufferGeometry().setFromPoints([connectionNodes[i], connectionNodes[j]]);
                        const line = new THREE.Line(geo, lineMat);
                        connectionGroup.add(line);
                    }
                }
            }
            scene.add(connectionGroup);
        }

        // ─── MOUSE & SCROLL STATE ───
        let mouseX = 0, mouseY = 0;
        let scrollProgress = 0;
        
        const handleMouseMove = (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        };

        const handleScroll = () => {
            const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
            scrollProgress = window.scrollY / maxScroll;
            dnaGroup.rotation.z = 0.15 + scrollProgress * 0.6;
            if (dna2) dna2.rotation.z = -0.3 - scrollProgress * 0.4;
            if (dna3) dna3.rotation.z = 0.5 + scrollProgress * 0.3; // Animate third DNA too
            if (bloomPass) bloomPass.strength = 1.6 + scrollProgress * 0.8; // Stronger bloom for desktop
        };

        if (!isMobile) window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll);

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            if (composer) composer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // ─── ANIMATION ───
        const clock = new THREE.Clock();
        let animationFrameId;

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const elapsed = clock.getElapsedTime();

            if (!isMobile) {
                camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
                camera.position.y += (-mouseY * 2 - scrollProgress * 25 - camera.position.y) * 0.03;
            } else {
                // Gentle swaying for mobile instead of mouse tracking
                camera.position.y += (-scrollProgress * 25 - camera.position.y) * 0.03;
                camera.position.x = Math.sin(elapsed * 0.4) * 1.5;
            }
            camera.lookAt(0, camera.position.y * 0.3, 0);

            dnaGroup.rotation.y = elapsed * 0.1;
            if (dna2) dna2.rotation.y = -elapsed * 0.07;
            if (dna3) dna3.rotation.y = elapsed * 0.04;

            const breathe = 1 + Math.sin(elapsed * 0.8) * 0.03;
            dnaGroup.scale.set(breathe, breathe, breathe);

            dnaGroup.position.y = Math.sin(elapsed * 0.3) * 2;
            if (dna2) dna2.position.y = -5 + Math.cos(elapsed * 0.25) * 1.5;

            // Shimmer effect (only on main DNA for mobile)
            const shimmer = 0.7 + Math.sin(elapsed * 2.0) * 0.25;
            if (dnaGroup.userData.strandMat1) {
                dnaGroup.userData.strandMat1.emissiveIntensity = shimmer;
            }

            ringGroup.rotation.y = elapsed * 0.15;
            ringGroup.rotation.x = Math.sin(elapsed * 0.2) * 0.15;
            ringGroup.position.y = dnaGroup.position.y;
            ringGroup.children.forEach((ring, i) => {
                ring.rotation.z = elapsed * (0.05 + i * 0.02);
                ring.material.opacity = 0.12 + Math.sin(elapsed * 1.5 + i) * 0.06;
            });

            if (hexGroup) {
                hexGroup.children.forEach((hex, i) => {
                    hex.position.z = -30 + Math.sin(elapsed * 0.5 + hex.position.x * 0.2 + hex.position.y * 0.2) * 0.8;
                });
            }

            // Only update positions every other frame on mobile
            if (!isMobile || Math.floor(elapsed * 60) % 2 === 0) {
                const pos = particles.geometry.attributes.position.array;
                for (let i = 0; i < particleCount; i++) {
                    pos[i * 3] += Math.sin(elapsed * 0.3 + i * 0.05) * 0.008 * pSpeeds[i];
                    pos[i * 3 + 1] += Math.cos(elapsed * 0.4 + i * 0.07) * 0.006 * pSpeeds[i];
                }
                particles.geometry.attributes.position.needsUpdate = true;
            }

            if (composer) {
                composer.render();
            } else {
                renderer.render(scene, camera);
            }
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
            
            renderer.dispose();
            scene.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        };
    }, [isMobile]);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: -1,
            opacity: 1 // Full opacity for desktop and mobile
        }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export default HeroDNA;
