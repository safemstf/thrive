import React, { useEffect, useRef, useState } from 'react';
import { COLORS } from './phylogeny.config';
import { SimulationEngine, wrapDelta } from './phylogeny.logic';

interface PhylogenySimProps {
    isRunning: boolean;
    speed: number;
}

// Helper: Add texture noise for surface variation
function addNoise(base: number, amount: number): number {
    return base + (Math.random() - 0.5) * amount;
}

function renderSimulation(ctx: CanvasRenderingContext2D, engine: SimulationEngine) {
    const world = engine.world;

    // OCEAN FLOOR BASE - deep sea ambient lighting with blue-green cast
    const baseGradient = ctx.createRadialGradient(world.width / 2, world.height / 2, 0, world.width / 2, world.height / 2, Math.max(world.width, world.height) * 0.7);
    baseGradient.addColorStop(0, 'rgba(48, 55, 62, 1)');
    baseGradient.addColorStop(1, 'rgba(35, 42, 48, 1)');
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, world.width, world.height);
    
    // Sediment patches scattered across floor
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * world.width;
        const y = Math.random() * world.height;
        const size = 2 + Math.random() * 6;
        const alpha = 0.3 + Math.random() * 0.25;
        ctx.fillStyle = `rgba(${addNoise(60, 10)}, ${addNoise(63, 10)}, ${addNoise(56, 8)}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Pillow basalt formations (top-down view)
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * world.width;
        const y = Math.random() * world.height;
        const w = 18 + Math.random() * 30;
        const h = 15 + Math.random() * 25;
        
        const rockGrad = ctx.createRadialGradient(x - w * 0.15, y - h * 0.15, 0, x, y, Math.max(w, h) * 0.7);
        rockGrad.addColorStop(0, `rgba(${addNoise(70, 10)}, ${addNoise(74, 10)}, ${addNoise(67, 9)}, 0.75)`);
        rockGrad.addColorStop(0.6, `rgba(${addNoise(55, 8)}, ${addNoise(59, 8)}, ${addNoise(53, 7)}, 0.65)`);
        rockGrad.addColorStop(1, `rgba(${addNoise(45, 6)}, ${addNoise(49, 6)}, ${addNoise(43, 5)}, 0.45)`);
        
        ctx.fillStyle = rockGrad;
        ctx.beginPath();
        ctx.ellipse(x, y, w, h, Math.random() * Math.PI * 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Crack patterns in seafloor
    ctx.strokeStyle = 'rgba(20, 22, 24, 0.4)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
        const startX = Math.random() * world.width;
        const startY = Math.random() * world.height;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        let x = startX;
        let y = startY;
        for (let j = 0; j < 6; j++) {
            x += (Math.random() - 0.5) * 50;
            y += (Math.random() - 0.5) * 50;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    
    // Distant suspended particles (marine snow)
    for (let i = 0; i < 180; i++) {
        const x = (Math.random() * world.width + world.time * 0.05) % world.width;
        const y = (Math.random() * world.height + world.time * 0.08) % world.height;
        const alpha = 0.1 + Math.random() * 0.15;
        const size = Math.random() < 0.95 ? 0.9 : 1.5;
        ctx.fillStyle = `rgba(220, 230, 240, ${alpha})`;
        ctx.fillRect(x, y, size, size);
    }

    // Hydrothermal vents (top-down view - circular plumes)
    for (const vent of world.vents) {
        const pulse = Math.sin(world.time * 0.05 + vent.phase) * 0.08 + 0.92;

        // Turbulent mineral plume spreading radially (top-down)
        const maxRadius = 120;
        const particleCount = 60;
        
        for (let i = 0; i < particleCount; i++) {
            const t = i / particleCount;
            const radius = t * maxRadius;
            const angle = Math.random() * Math.PI * 2 + world.time * 0.03;
            
            const turbulence = Math.sin(world.time * 0.09 + i * 0.35) * 8 * t;
            const wobble = Math.sin(world.time * 0.14 + i * 0.65) * 5 * t;
            
            const x = vent.x + Math.cos(angle) * (radius + turbulence + wobble);
            const y = vent.y + Math.sin(angle) * (radius + turbulence + wobble);
            
            if (x > 0 && x < world.width && y > 0 && y < world.height) {
                const alpha = (1 - t) * 0.25 * pulse * (0.6 + Math.random() * 0.4);
                const size = (1 - t * 0.65) * (0.9 + Math.random() * 1.9);
                
                const brightness = 140 + Math.random() * 60;
                ctx.fillStyle = `rgba(${brightness}, ${brightness * 0.82}, ${brightness * 0.7}, ${alpha})`;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Vent opening (top-down circular view)
        const ventRadius = 14;
        
        // Outer ambient occlusion ring
        const aoGradient = ctx.createRadialGradient(vent.x, vent.y, ventRadius * 0.3, vent.x, vent.y, ventRadius * 2.5);
        aoGradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
        aoGradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.2)');
        aoGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = aoGradient;
        ctx.beginPath();
        ctx.arc(vent.x, vent.y, ventRadius * 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Vent crater
        ctx.fillStyle = 'rgba(18, 16, 14, 0.85)';
        ctx.beginPath();
        ctx.arc(vent.x, vent.y, ventRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Hot fluid core
        const coreGradient = ctx.createRadialGradient(vent.x, vent.y, 0, vent.x, vent.y, ventRadius * 0.6);
        coreGradient.addColorStop(0, `rgba(255, 170, 80, ${0.6 * pulse})`);
        coreGradient.addColorStop(0.7, `rgba(240, 130, 55, ${0.4 * pulse})`);
        coreGradient.addColorStop(1, 'rgba(210, 100, 35, 0)');
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(vent.x, vent.y, ventRadius * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Heat shimmer rings
        for (let ring = 0; ring < 3; ring++) {
            const ringRadius = 20 + ring * 10 + pulse * 5;
            const ringAlpha = (0.12 - ring * 0.03) * pulse;
            ctx.strokeStyle = `rgba(220, 115, 45, ${ringAlpha})`;
            ctx.lineWidth = 1.8 - ring * 0.4;
            ctx.beginPath();
            ctx.arc(vent.x, vent.y, ringRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // ROCKS (top-down view)
    for (const rock of world.rocks) {
        if (rock.type === 'chimney') {
            // Chimney from above - circular with radial texture
            const radius = rock.radius * 2;
            
            // Shadow
            const aoGradient = ctx.createRadialGradient(rock.x, rock.y, radius * 0.3, rock.x, rock.y, radius * 1.5);
            aoGradient.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
            aoGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
            aoGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = aoGradient;
            ctx.beginPath();
            ctx.arc(rock.x, rock.y, radius * 1.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Main chimney body
            const mainGrad = ctx.createRadialGradient(rock.x - radius * 0.2, rock.y - radius * 0.2, 0, rock.x, rock.y, radius);
            mainGrad.addColorStop(0, `rgba(${addNoise(54, 8)}, ${addNoise(50, 7)}, ${addNoise(46, 6)}, 0.6)`);
            mainGrad.addColorStop(0.5, `rgba(${addNoise(44, 6)}, ${addNoise(41, 5)}, ${addNoise(38, 5)}, 0.5)`);
            mainGrad.addColorStop(1, `rgba(${addNoise(34, 5)}, ${addNoise(32, 4)}, ${addNoise(30, 4)}, 0.4)`);
            ctx.fillStyle = mainGrad;
            ctx.beginPath();
            ctx.arc(rock.x, rock.y, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Radial mineral deposits
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + rock.roughness;
                const length = radius * (0.7 + Math.random() * 0.3);
                ctx.strokeStyle = `rgba(${addNoise(68, 10)}, ${addNoise(60, 9)}, ${addNoise(54, 8)}, ${0.35 + Math.random() * 0.15})`;
                ctx.lineWidth = 1.2 + Math.random() * 0.6;
                ctx.beginPath();
                ctx.moveTo(rock.x, rock.y);
                ctx.lineTo(rock.x + Math.cos(angle) * length, rock.y + Math.sin(angle) * length);
                ctx.stroke();
            }
            
        } else if (rock.type === 'ridge') {
            // Ridge from above - elongated irregular shape
            const points = 9;
            const vertices = [];
            
            for (let i = 0; i < points; i++) {
                const angle = (i / points) * Math.PI * 2;
                const radiusVar = rock.radius * (0.75 + Math.sin(i * 2.5 + rock.roughness * 6) * 0.4);
                const stretch = Math.cos(angle) > 0 ? 1.7 : 0.9;
                vertices.push({
                    x: rock.x + Math.cos(angle) * radiusVar * stretch,
                    y: rock.y + Math.sin(angle) * radiusVar * 0.55
                });
            }
            
            // Shadow
            const shadowGrad = ctx.createRadialGradient(rock.x, rock.y, 0, rock.x + 8, rock.y + 8, rock.radius * 1.5);
            shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
            shadowGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.18)');
            shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = shadowGrad;
            ctx.beginPath();
            vertices.forEach((v, i) => {
                if (i === 0) ctx.moveTo(v.x + 8, v.y + 8);
                else ctx.lineTo(v.x + 8, v.y + 8);
            });
            ctx.closePath();
            ctx.fill();
            
            // Main body
            const lightGrad = ctx.createRadialGradient(
                rock.x - rock.radius * 0.25, rock.y - rock.radius * 0.25, 0,
                rock.x, rock.y, rock.radius * 1.5
            );
            lightGrad.addColorStop(0, `rgba(${addNoise(60, 8)}, ${addNoise(56, 7)}, ${addNoise(52, 6)}, 0.55)`);
            lightGrad.addColorStop(0.5, `rgba(${addNoise(50, 6)}, ${addNoise(46, 5)}, ${addNoise(42, 5)}, 0.48)`);
            lightGrad.addColorStop(1, `rgba(${addNoise(40, 5)}, ${addNoise(37, 4)}, ${addNoise(34, 4)}, 0.38)`);
            ctx.fillStyle = lightGrad;
            ctx.beginPath();
            vertices.forEach((v, i) => {
                if (i === 0) ctx.moveTo(v.x, v.y);
                else ctx.lineTo(v.x, v.y);
            });
            ctx.closePath();
            ctx.fill();
            
            // Edge definition
            ctx.strokeStyle = `rgba(${addNoise(26, 4)}, ${addNoise(24, 3)}, ${addNoise(22, 3)}, 0.45)`;
            ctx.lineWidth = 1.3;
            ctx.stroke();
            
        } else {
            // Boulder - circular irregular
            const sides = 8;
            const vertices = [];
            
            for (let i = 0; i < sides; i++) {
                const angle = (i / sides) * Math.PI * 2 + rock.roughness * 0.9;
                const r = rock.radius * (0.65 + Math.sin(i * 2.9 + rock.roughness * 7) * 0.45);
                vertices.push({
                    x: rock.x + Math.cos(angle) * r,
                    y: rock.y + Math.sin(angle) * r
                });
            }
            
            // Shadow
            const shadowGrad = ctx.createRadialGradient(rock.x, rock.y, 0, rock.x + 6, rock.y + 6, rock.radius * 1.3);
            shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.42)');
            shadowGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.2)');
            shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = shadowGrad;
            ctx.beginPath();
            vertices.forEach((v, i) => {
                if (i === 0) ctx.moveTo(v.x + 6, v.y + 6);
                else ctx.lineTo(v.x + 6, v.y + 6);
            });
            ctx.closePath();
            ctx.fill();
            
            // Main body
            const mainGrad = ctx.createRadialGradient(
                rock.x - rock.radius * 0.3, rock.y - rock.radius * 0.3, 0,
                rock.x, rock.y, rock.radius * 1.2
            );
            mainGrad.addColorStop(0, `rgba(${addNoise(64, 9)}, ${addNoise(58, 8)}, ${addNoise(54, 7)}, 0.52)`);
            mainGrad.addColorStop(0.6, `rgba(${addNoise(50, 7)}, ${addNoise(46, 6)}, ${addNoise(42, 5)}, 0.45)`);
            mainGrad.addColorStop(1, `rgba(${addNoise(38, 5)}, ${addNoise(35, 4)}, ${addNoise(32, 4)}, 0.36)`);
            ctx.fillStyle = mainGrad;
            ctx.beginPath();
            vertices.forEach((v, i) => {
                if (i === 0) ctx.moveTo(v.x, v.y);
                else ctx.lineTo(v.x, v.y);
            });
            ctx.closePath();
            ctx.fill();
            
            // Edge
            ctx.strokeStyle = `rgba(${addNoise(27, 4)}, ${addNoise(25, 3)}, ${addNoise(23, 3)}, 0.48)`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }

    // Chemical bonds - more visible
    for (const bond of engine.bonds) {
        const mol1 = engine.moleculeMap.get(bond.mol1);
        const mol2 = engine.moleculeMap.get(bond.mol2);
        if (mol1 && mol2) {
            const dx = wrapDelta(mol2.x - mol1.x, world.width);
            const dy = wrapDelta(mol2.y - mol1.y, world.height);
            
            let alpha = 0.18;
            if (bond.type === 'covalent') alpha = 0.4;
            else if (bond.type === 'hydrogen') alpha = 0.14;
            
            ctx.strokeStyle = `rgba(${addNoise(195, 18)}, ${addNoise(205, 18)}, ${addNoise(220, 18)}, ${alpha})`;
            ctx.lineWidth = bond.type === 'covalent' ? 1.6 : 1.0;
            ctx.beginPath();
            ctx.moveTo(mol1.x, mol1.y);
            ctx.lineTo(mol1.x + dx, mol1.y + dy);
            ctx.stroke();
        }
    }

    // VOLUMETRIC MOLECULES - Bright and visible
    if (!engine.lucaBorn) {
        engine.molecules.forEach((m) => {
            const baseOpacity = m.complexity === 1 ? 0.15 : m.complexity === 2 ? 0.4 : 0.7;
            const bondBonus = Math.min(m.bondedTo.size * 0.09, 0.22);
            const finalOpacity = baseOpacity + bondBonus;
            
            let r = 190, g = 195, b = 205;
            if (m.type === 'amino_acid') { r = 215; g = 180; b = 195; }
            else if (m.type === 'nucleotide') { r = 160; g = 175; b = 215; }
            else if (m.type === 'lipid') { r = 225; g = 200; b = 160; }
            else if (m.type === 'sugar') { r = 185; g = 205; b = 185; }
            
            if (m.type === 'peptide') {
                r = 200; g = 140; b = 170;
                const segments = 4;
                const segmentLen = m.radius * 0.7;
                const zigzagHeight = m.radius * 0.32;
                
                ctx.strokeStyle = `rgba(${addNoise(r, 12)}, ${addNoise(g, 10)}, ${addNoise(b, 10)}, ${finalOpacity * 0.9})`;
                ctx.lineWidth = 2.4;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();
                ctx.moveTo(m.x - segmentLen, m.y);
                
                for (let i = 0; i < segments; i++) {
                    const x = m.x - segmentLen + (i * segmentLen / (segments - 1)) * 2;
                    const y = m.y + (i % 2 === 0 ? -zigzagHeight : zigzagHeight);
                    ctx.lineTo(x, y);
                }
                ctx.stroke();
                
                for (let i = 0; i < segments; i++) {
                    const x = m.x - segmentLen + (i * segmentLen / (segments - 1)) * 2;
                    const y = m.y + (i % 2 === 0 ? -zigzagHeight : zigzagHeight);
                    
                    const nodeGrad = ctx.createRadialGradient(x, y, 0, x, y, 3.8);
                    nodeGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${finalOpacity * 1.0})`);
                    nodeGrad.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${finalOpacity * 0.55})`);
                    nodeGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
                    ctx.fillStyle = nodeGrad;
                    ctx.beginPath();
                    ctx.arc(x, y, 3.8, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            else if (m.type === 'rna_fragment') {
                r = 135; g = 130; b = 195;
                const fragmentLength = m.radius * 2.5;
                
                ctx.strokeStyle = `rgba(${addNoise(r, 10)}, ${addNoise(g, 10)}, ${addNoise(b, 12)}, ${finalOpacity * 0.95})`;
                ctx.lineWidth = 2.2;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();
                
                const startX = m.x - fragmentLength * 0.5;
                const startY = m.y;
                ctx.moveTo(startX, startY);
                
                for (let i = 1; i <= 5; i++) {
                    const t = i / 15;
                    const x = startX + fragmentLength * t * 0.3;
                    const y = startY - fragmentLength * t * 0.6 + Math.sin(t * Math.PI * 3) * 2;
                    ctx.lineTo(x, y);
                }
                
                const loopCenterX = m.x - fragmentLength * 0.2;
                const loopCenterY = m.y - fragmentLength * 0.4;
                const loopRadius = fragmentLength * 0.15;
                for (let i = 0; i <= 8; i++) {
                    const angle = Math.PI + (i / 8) * Math.PI;
                    const x = loopCenterX + Math.cos(angle) * loopRadius;
                    const y = loopCenterY + Math.sin(angle) * loopRadius;
                    ctx.lineTo(x, y);
                }
                
                for (let i = 5; i >= 1; i--) {
                    const t = i / 15;
                    const x = startX + fragmentLength * t * 0.3 + fragmentLength * 0.08;
                    const y = startY - fragmentLength * t * 0.6 + Math.sin(t * Math.PI * 3) * 2;
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(m.x + fragmentLength * 0.3, startY);
                ctx.stroke();
                
                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${finalOpacity * 0.65})`;
                ctx.lineWidth = 1.3;
                for (let i = 1; i <= 4; i++) {
                    const t = i / 5;
                    const x1 = startX + fragmentLength * t * 0.3;
                    const x2 = x1 + fragmentLength * 0.08;
                    const y = startY - fragmentLength * t * 0.6 + Math.sin(t * Math.PI * 3) * 2;
                    ctx.beginPath();
                    ctx.moveTo(x1, y);
                    ctx.lineTo(x2, y);
                    ctx.stroke();
                }
            }
            else if (m.type === 'lipid' || m.type === 'membrane_vesicle') {
                const layers = 3;
                for (let layer = 0; layer < layers; layer++) {
                    const layerOpacity = finalOpacity * (1.05 - layer * 0.18);
                    const layerSize = 1 + layer * 0.4;
                    
                    const grad = ctx.createRadialGradient(
                        m.x, m.y - m.radius * 0.5, 0,
                        m.x, m.y, m.radius * layerSize * 1.1
                    );
                    grad.addColorStop(0, `rgba(${addNoise(r, 12)}, ${addNoise(g, 10)}, ${addNoise(b, 10)}, ${layerOpacity})`);
                    grad.addColorStop(0.5, `rgba(${addNoise(r, 12)}, ${addNoise(g, 10)}, ${addNoise(b, 10)}, ${layerOpacity * 0.75})`);
                    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
                    
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.ellipse(m.x, m.y, m.radius * 0.6 * layerSize, m.radius * 1.3 * layerSize, m.vx * 0.08, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                const headGrad = ctx.createRadialGradient(m.x, m.y - m.radius * 0.9, 0, m.x, m.y - m.radius * 0.9, m.radius * 0.6);
                headGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${finalOpacity * 1.25})`);
                headGrad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${finalOpacity * 0.75})`);
                headGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
                ctx.fillStyle = headGrad;
                ctx.beginPath();
                ctx.arc(m.x, m.y - m.radius * 0.9, m.radius * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
            else {
                const layers = m.complexity === 1 ? 4 : 3;
                for (let layer = 0; layer < layers; layer++) {
                    const layerOpacity = finalOpacity * (1.25 - layer * 0.28);
                    const layerRadius = m.radius * (2.1 - layer * 0.42);
                    
                    const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, layerRadius);
                    grad.addColorStop(0, `rgba(${addNoise(r, 14)}, ${addNoise(g, 14)}, ${addNoise(b, 14)}, ${layerOpacity})`);
                    grad.addColorStop(0.5, `rgba(${addNoise(r, 12)}, ${addNoise(g, 12)}, ${addNoise(b, 12)}, ${layerOpacity * 0.65})`);
                    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(m.x, m.y, layerRadius, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });
    }

    // Animated caustics light patterns (Cesium-style water effects)
    for (let i = 0; i < 30; i++) {
        const x = (Math.random() * world.width + world.time * 0.3) % world.width;
        const y = (Math.random() * world.height + world.time * 0.25) % world.height;
        const radius = 15 + Math.random() * 35;
        const alpha = 0.018 + Math.random() * 0.03;
        
        const causticsGrad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        causticsGrad.addColorStop(0, `rgba(155, 185, 205, ${alpha})`);
        causticsGrad.addColorStop(0.5, `rgba(135, 165, 185, ${alpha * 0.65})`);
        causticsGrad.addColorStop(1, 'rgba(135, 165, 185, 0)');
        ctx.fillStyle = causticsGrad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Water fog overlay for depth (Cesium-style atmospheric perspective)
    const fogGradient = ctx.createRadialGradient(world.width / 2, world.height / 2, 0, world.width / 2, world.height / 2, Math.max(world.width, world.height) * 0.65);
    fogGradient.addColorStop(0, 'rgba(38, 52, 67, 0)');
    fogGradient.addColorStop(0.65, 'rgba(38, 52, 67, 0.09)');
    fogGradient.addColorStop(1, 'rgba(30, 44, 57, 0.16)');
    ctx.fillStyle = fogGradient;
    ctx.fillRect(0, 0, world.width, world.height);

    // Protocells
    engine.protoCells.forEach((p) => {
        const stability = p.stability / 100;
        ctx.fillStyle = `rgba(95, 100, 115, ${0.12 * stability})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius - 4, 0, Math.PI * 2);
        ctx.fill();

        if (p.hasMembrane) {
            const lipids = 24;
            for (let i = 0; i < lipids; i++) {
                const angle = (i / lipids) * Math.PI * 2 + world.time * 0.01;
                const x = p.x + Math.cos(angle) * p.radius;
                const y = p.y + Math.sin(angle) * p.radius;
                ctx.strokeStyle = `rgba(200, 170, 130, ${0.35 * stability})`;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x - Math.cos(angle) * 3, y - Math.sin(angle) * 3);
                ctx.stroke();
                ctx.fillStyle = `rgba(215, 180, 120, ${0.45 * stability})`;
                ctx.beginPath();
                ctx.arc(x, y, 1.4, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            ctx.strokeStyle = `rgba(200, 170, 130, ${0.22 * stability})`;
            ctx.lineWidth = 1.6;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        if (p.canReplicate) {
            ctx.strokeStyle = `rgba(130, 120, 180, ${0.28 * stability})`;
            ctx.lineWidth = 1.2;
            for (let s = 0; s < 2; s++) {
                ctx.beginPath();
                const offset = s * 8 - 4;
                for (let i = 0; i <= 15; i++) {
                    const t = i / 15;
                    const angle = t * Math.PI * 4;
                    const x = p.x + offset + Math.cos(angle) * 3;
                    const y = p.y - 8 + t * 16;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
        }
        
        if (p.hasMetabolism) {
            ctx.strokeStyle = `rgba(180, 120, 150, ${0.25 * stability})`;
            ctx.lineWidth = 1.2;
            for (let s = 0; s < 3; s++) {
                const angle = s * Math.PI * 2 / 3;
                const baseX = p.x + Math.cos(angle) * (p.radius * 0.4);
                const baseY = p.y + Math.sin(angle) * (p.radius * 0.4);
                ctx.beginPath();
                for (let i = 0; i < 4; i++) {
                    const x = baseX + (i % 2 === 0 ? -2 : 2);
                    const y = baseY - 4 + i * 2.5;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
        }

        ctx.font = '9px system-ui';
        ctx.textAlign = 'center';
        const labelY = p.y - p.radius - 6;
        let label = 'Vesicle';
        if (p.hasMembrane && p.hasMetabolism && p.canReplicate) label = 'Protocell';
        else if (p.hasMembrane) label = 'Liposome';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        const metrics = ctx.measureText(label);
        ctx.fillRect(p.x - metrics.width / 2 - 2, labelY - 7, metrics.width + 4, 11);
        ctx.fillStyle = `rgba(200, 210, 220, ${0.6 + stability * 0.35})`;
        ctx.fillText(label, p.x, labelY);
    });

    if (engine.luca && engine.luca.isAlive) {
        const luca = engine.luca;
        const auraGradient = ctx.createRadialGradient(luca.x, luca.y, 0, luca.x, luca.y, luca.radius * 1.8);
        auraGradient.addColorStop(0, 'rgba(210, 190, 150, 0.12)');
        auraGradient.addColorStop(1, 'rgba(210, 190, 150, 0)');
        ctx.fillStyle = auraGradient;
        ctx.beginPath();
        ctx.arc(luca.x, luca.y, luca.radius * 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(115, 110, 125, 0.4)';
        ctx.beginPath();
        ctx.arc(luca.x, luca.y, luca.radius, 0, Math.PI * 2);
        ctx.fill();
        const lipidCount = 32;
        for (let i = 0; i < lipidCount; i++) {
            const angle = (i / lipidCount) * Math.PI * 2 + world.time * 0.005;
            const x = luca.x + Math.cos(angle) * luca.radius;
            const y = luca.y + Math.sin(angle) * luca.radius;
            ctx.strokeStyle = 'rgba(200, 170, 130, 0.5)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - Math.cos(angle) * 3.5, y - Math.sin(angle) * 3.5);
            ctx.stroke();
            ctx.fillStyle = 'rgba(210, 180, 140, 0.6)';
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.strokeStyle = 'rgba(130, 120, 170, 0.32)';
        ctx.lineWidth = 1.6;
        for (let r = 0; r < 3; r++) {
            ctx.beginPath();
            ctx.arc(luca.x, luca.y, 10 + r * 3, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.fillStyle = 'rgba(150, 140, 170, 0.38)';
        for (let i = 0; i < 16; i++) {
            const angle = (world.time * 0.003 + i * Math.PI / 8);
            const r = luca.radius * (0.3 + (i % 4) * 0.12);
            ctx.beginPath();
            ctx.arc(luca.x + Math.cos(angle) * r, luca.y + Math.sin(angle) * r, 1.2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.font = 'bold 11px system-ui';
        ctx.textAlign = 'center';
        const titleY = luca.y - luca.radius - 16;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        const titleMetrics = ctx.measureText('LUCA');
        ctx.fillRect(luca.x - titleMetrics.width / 2 - 3, titleY - 9, titleMetrics.width + 6, 14);
        ctx.fillStyle = 'rgba(215, 195, 155, 0.95)';
        ctx.fillText('LUCA', luca.x, titleY);
        ctx.font = '7px system-ui';
        ctx.fillStyle = 'rgba(185, 185, 195, 0.8)';
        ctx.fillText('Last Universal Common Ancestor', luca.x, titleY + 12);
    }

    engine.organisms.forEach((o) => {
        if (!o.isAlive) {
            ctx.fillStyle = 'rgba(70, 68, 72, 0.28)';
            ctx.beginPath();
            ctx.arc(o.x, o.y, o.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
            return;
        }
        const energy = Math.min(100, o.energy);
        const vitalityAlpha = 0.2 + (energy / 100) * 0.25;
        ctx.fillStyle = o.traits.color.replace(')', `, ${vitalityAlpha})`).replace('hsl', 'hsla');
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
        ctx.fill();
        const cellLipids = Math.floor(o.radius * 1.5);
        const membraneAlpha = 0.35 + (energy / 150) * 0.25;
        for (let i = 0; i < cellLipids; i++) {
            const angle = (i / cellLipids) * Math.PI * 2;
            const x = o.x + Math.cos(angle) * o.radius;
            const y = o.y + Math.sin(angle) * o.radius;
            ctx.strokeStyle = o.traits.color.replace(')', `, ${membraneAlpha * 0.9})`).replace('hsl', 'hsla');
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - Math.cos(angle) * 2, y - Math.sin(angle) * 2);
            ctx.stroke();
            ctx.fillStyle = o.traits.color.replace(')', `, ${membraneAlpha})`).replace('hsl', 'hsla');
            ctx.beginPath();
            ctx.arc(x, y, 1.0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = o.traits.color.replace(')', `, ${vitalityAlpha * 1.4})`).replace('hsl', 'hsla');
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
        if (o.radius > 10) {
            ctx.font = `${Math.max(7, o.radius * 0.4)}px system-ui`;
            ctx.textAlign = 'center';
            const labelY = o.y - o.radius - 5;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            const metrics = ctx.measureText(o.name);
            ctx.fillRect(o.x - metrics.width / 2 - 2, labelY - 6, metrics.width + 4, 9);
            ctx.fillStyle = `rgba(220, 220, 230, ${0.6 + vitalityAlpha * 1.4})`;
            ctx.fillText(o.name, o.x, labelY);
        }
    });

    // Scientific UI - brighter
    ctx.fillStyle = 'rgba(15, 22, 30, 0.85)';
    ctx.fillRect(10, 10, 270, 120);
    ctx.strokeStyle = 'rgba(80, 90, 105, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 270, 120);
    ctx.font = '10px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(185, 195, 210, 0.9)';
    const phaseLabel = world.phase.replace(/_/g, ' ');
    ctx.fillText(`Phase: ${phaseLabel}`, 18, 26);
    ctx.fillText(`t = ${Math.floor(world.time / 60)}s`, 18, 42);
    ctx.fillText(`T = ${world.temperature.toFixed(1)}°C`, 18, 58);
    ctx.fillStyle = 'rgba(165, 175, 190, 0.85)';
    ctx.fillText(`Molecules: ${engine.molecules.length}`, 18, 74);
    ctx.fillText(`Bonds: ${engine.bonds.length}`, 150, 74);
    ctx.fillText(`Protocells: ${engine.protoCells.length}`, 18, 90);
    if (engine.lucaBorn) {
        ctx.fillStyle = 'rgba(215, 195, 155, 0.95)';
        ctx.fillText(`✓ LUCA emerged`, 18, 106);
    }
    if (engine.organisms.length > 0) {
        ctx.fillStyle = 'rgba(165, 175, 190, 0.85)';
        ctx.fillText(`Organisms: ${engine.organisms.length}`, 150, 90);
        ctx.fillText(`Max Gen: ${engine.maxGeneration}`, 150, 106);
    }
}

export default function LUCASimulation({ isRunning, speed }: PhylogenySimProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<SimulationEngine | null>(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        if (!engineRef.current) {
            engineRef.current = new SimulationEngine();
        }
        const engine = engineRef.current;
        const animate = () => {
            if (isRunning) {
                for (let i = 0; i < speed; i++) {
                    engine.update();
                }
                renderSimulation(ctx, engine);
            } else {
                renderSimulation(ctx, engine);
            }
            animationRef.current = requestAnimationFrame(animate);
        };
        animate();
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isRunning, speed]);

    return (
        <div style={{ 
            width: '100%', 
            height: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            padding: '20px'
        }}>
            <canvas 
                ref={canvasRef} 
                width={1200} 
                height={720}
                style={{ 
                    display: 'block', 
                    maxWidth: '100%', 
                    height: 'auto',
                    border: '1px solid #1a1f28',
                    borderRadius: '2px',
                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.8)'
                }}
            />
            <div style={{
                marginTop: '16px',
                color: '#8b92a0',
                fontSize: '11px',
                fontFamily: 'system-ui',
                textAlign: 'center',
                maxWidth: '750px',
                lineHeight: '1.7'
            }}>
                Top-down view of deep-sea hydrothermal vent ecosystem (~3000m depth)
                <br/>
                Cesium-style atmospheric rendering · Animated caustics · Depth cueing fog · Volumetric molecules
                <br/>
                RNA hairpin loops · Peptide chains · Lipid membranes · Black smoker chimneys
            </div>
        </div>
    );
}