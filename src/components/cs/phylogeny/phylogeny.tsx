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

    // OCEAN FLOOR BASE (top-down view) - dark basalt texture
    const baseColor = 'rgba(22, 20, 18, 0.95)';
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, world.width, world.height);
    
    // Sediment patches scattered across floor
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * world.width;
        const y = Math.random() * world.height;
        const size = 2 + Math.random() * 6;
        const alpha = 0.12 + Math.random() * 0.18;
        ctx.fillStyle = `rgba(${addNoise(28, 6)}, ${addNoise(25, 5)}, ${addNoise(22, 4)}, ${alpha})`;
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
        rockGrad.addColorStop(0, `rgba(${addNoise(38, 6)}, ${addNoise(34, 5)}, ${addNoise(30, 4)}, 0.4)`);
        rockGrad.addColorStop(0.6, `rgba(${addNoise(26, 4)}, ${addNoise(23, 3)}, ${addNoise(20, 3)}, 0.3)`);
        rockGrad.addColorStop(1, `rgba(${addNoise(18, 3)}, ${addNoise(16, 2)}, ${addNoise(14, 2)}, 0.2)`);
        
        ctx.fillStyle = rockGrad;
        ctx.beginPath();
        ctx.ellipse(x, y, w, h, Math.random() * Math.PI * 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Crack patterns in seafloor
    ctx.strokeStyle = 'rgba(8, 7, 6, 0.3)';
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
    
    // Distant suspended particles (view from above looking down through water)
    for (let i = 0; i < 180; i++) {
        const x = (Math.random() * world.width + world.time * 0.05) % world.width;
        const y = (Math.random() * world.height + world.time * 0.08) % world.height;
        const alpha = 0.01 + Math.random() * 0.01;
        const size = Math.random() < 0.95 ? 0.6 : 1.2;
        ctx.fillStyle = `rgba(200, 205, 210, ${alpha})`;
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
                const alpha = (1 - t) * 0.20 * pulse * (0.6 + Math.random() * 0.4);
                const size = (1 - t * 0.65) * (0.8 + Math.random() * 1.8);
                
                const brightness = 130 + Math.random() * 50;
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
        aoGradient.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
        aoGradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.15)');
        aoGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = aoGradient;
        ctx.beginPath();
        ctx.arc(vent.x, vent.y, ventRadius * 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Vent crater
        ctx.fillStyle = 'rgba(12, 10, 8, 0.8)';
        ctx.beginPath();
        ctx.arc(vent.x, vent.y, ventRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Hot fluid core
        const coreGradient = ctx.createRadialGradient(vent.x, vent.y, 0, vent.x, vent.y, ventRadius * 0.6);
        coreGradient.addColorStop(0, `rgba(255, 160, 70, ${0.55 * pulse})`);
        coreGradient.addColorStop(0.7, `rgba(230, 120, 45, ${0.35 * pulse})`);
        coreGradient.addColorStop(1, 'rgba(200, 90, 25, 0)');
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(vent.x, vent.y, ventRadius * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Heat shimmer rings
        for (let ring = 0; ring < 3; ring++) {
            const ringRadius = 20 + ring * 10 + pulse * 5;
            const ringAlpha = (0.08 - ring * 0.02) * pulse;
            ctx.strokeStyle = `rgba(210, 105, 35, ${ringAlpha})`;
            ctx.lineWidth = 1.5 - ring * 0.3;
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
            aoGradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
            aoGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.15)');
            aoGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = aoGradient;
            ctx.beginPath();
            ctx.arc(rock.x, rock.y, radius * 1.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Main chimney body
            const mainGrad = ctx.createRadialGradient(rock.x - radius * 0.2, rock.y - radius * 0.2, 0, rock.x, rock.y, radius);
            mainGrad.addColorStop(0, `rgba(${addNoise(42, 5)}, ${addNoise(38, 4)}, ${addNoise(34, 3)}, 0.45)`);
            mainGrad.addColorStop(0.5, `rgba(${addNoise(32, 4)}, ${addNoise(29, 3)}, ${addNoise(26, 3)}, 0.38)`);
            mainGrad.addColorStop(1, `rgba(${addNoise(22, 3)}, ${addNoise(20, 2)}, ${addNoise(18, 2)}, 0.32)`);
            ctx.fillStyle = mainGrad;
            ctx.beginPath();
            ctx.arc(rock.x, rock.y, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Radial mineral deposits
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + rock.roughness;
                const length = radius * (0.7 + Math.random() * 0.3);
                ctx.strokeStyle = `rgba(${addNoise(55, 8)}, ${addNoise(48, 6)}, ${addNoise(42, 5)}, ${0.25 + Math.random() * 0.1})`;
                ctx.lineWidth = 1 + Math.random() * 0.5;
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
            shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.32)');
            shadowGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.14)');
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
            lightGrad.addColorStop(0, `rgba(${addNoise(48, 6)}, ${addNoise(44, 5)}, ${addNoise(40, 4)}, 0.42)`);
            lightGrad.addColorStop(0.5, `rgba(${addNoise(38, 5)}, ${addNoise(34, 4)}, ${addNoise(30, 3)}, 0.36)`);
            lightGrad.addColorStop(1, `rgba(${addNoise(28, 4)}, ${addNoise(25, 3)}, ${addNoise(22, 3)}, 0.30)`);
            ctx.fillStyle = lightGrad;
            ctx.beginPath();
            vertices.forEach((v, i) => {
                if (i === 0) ctx.moveTo(v.x, v.y);
                else ctx.lineTo(v.x, v.y);
            });
            ctx.closePath();
            ctx.fill();
            
            // Edge definition
            ctx.strokeStyle = `rgba(${addNoise(14, 3)}, ${addNoise(12, 2)}, ${addNoise(10, 2)}, 0.38)`;
            ctx.lineWidth = 1.2;
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
            shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
            shadowGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.15)');
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
            mainGrad.addColorStop(0, `rgba(${addNoise(52, 7)}, ${addNoise(46, 6)}, ${addNoise(42, 5)}, 0.4)`);
            mainGrad.addColorStop(0.6, `rgba(${addNoise(38, 5)}, ${addNoise(34, 4)}, ${addNoise(30, 3)}, 0.35)`);
            mainGrad.addColorStop(1, `rgba(${addNoise(26, 4)}, ${addNoise(23, 3)}, ${addNoise(20, 2)}, 0.28)`);
            ctx.fillStyle = mainGrad;
            ctx.beginPath();
            vertices.forEach((v, i) => {
                if (i === 0) ctx.moveTo(v.x, v.y);
                else ctx.lineTo(v.x, v.y);
            });
            ctx.closePath();
            ctx.fill();
            
            // Edge
            ctx.strokeStyle = `rgba(${addNoise(15, 3)}, ${addNoise(13, 2)}, ${addNoise(11, 2)}, 0.4)`;
            ctx.lineWidth = 1.4;
            ctx.stroke();
        }
    }

    // Chemical bonds - very subtle
    for (const bond of engine.bonds) {
        const mol1 = engine.moleculeMap.get(bond.mol1);
        const mol2 = engine.moleculeMap.get(bond.mol2);
        if (mol1 && mol2) {
            const dx = wrapDelta(mol2.x - mol1.x, world.width);
            const dy = wrapDelta(mol2.y - mol1.y, world.height);
            
            let alpha = 0.04;
            if (bond.type === 'covalent') alpha = 0.08;
            else if (bond.type === 'hydrogen') alpha = 0.03;
            
            ctx.strokeStyle = `rgba(${addNoise(160, 15)}, ${addNoise(170, 15)}, ${addNoise(185, 15)}, ${alpha})`;
            ctx.lineWidth = bond.type === 'covalent' ? 0.8 : 0.5;
            ctx.beginPath();
            ctx.moveTo(mol1.x, mol1.y);
            ctx.lineTo(mol1.x + dx, mol1.y + dy);
            ctx.stroke();
        }
    }

    // VOLUMETRIC MOLECULES
    if (!engine.lucaBorn) {
        engine.molecules.forEach((m) => {
            const baseOpacity = m.complexity === 1 ? 0.008 : m.complexity === 2 ? 0.045 : 0.10;
            const bondBonus = Math.min(m.bondedTo.size * 0.025, 0.08);
            const finalOpacity = baseOpacity + bondBonus;
            
            let r = 155, g = 160, b = 165;
            if (m.type === 'amino_acid') { r = 175; g = 145; b = 155; }
            else if (m.type === 'nucleotide') { r = 125; g = 135; b = 170; }
            else if (m.type === 'lipid') { r = 185; g = 165; b = 130; }
            else if (m.type === 'sugar') { r = 150; g = 165; b = 150; }
            
            if (m.type === 'peptide') {
                r = 155; g = 105; b = 130;
                const segments = 4;
                const segmentLen = m.radius * 0.7;
                const zigzagHeight = m.radius * 0.32;
                
                ctx.strokeStyle = `rgba(${addNoise(r, 10)}, ${addNoise(g, 8)}, ${addNoise(b, 8)}, ${finalOpacity * 0.9})`;
                ctx.lineWidth = 1.4;
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
                    
                    const nodeGrad = ctx.createRadialGradient(x, y, 0, x, y, 2.5);
                    nodeGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${finalOpacity * 1.0})`);
                    nodeGrad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${finalOpacity * 0.4})`);
                    nodeGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
                    ctx.fillStyle = nodeGrad;
                    ctx.beginPath();
                    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            else if (m.type === 'rna_fragment') {
                r = 100; g = 95; b = 155;
                const fragmentLength = m.radius * 2.5;
                
                ctx.strokeStyle = `rgba(${addNoise(r, 8)}, ${addNoise(g, 8)}, ${addNoise(b, 10)}, ${finalOpacity * 1.0})`;
                ctx.lineWidth = 1.2;
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
                
                ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${finalOpacity * 0.35})`;
                ctx.lineWidth = 0.5;
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
                    const layerOpacity = finalOpacity * (0.9 - layer * 0.2);
                    const layerSize = 1 + layer * 0.4;
                    
                    const grad = ctx.createRadialGradient(
                        m.x, m.y - m.radius * 0.5, 0,
                        m.x, m.y, m.radius * layerSize * 1.1
                    );
                    grad.addColorStop(0, `rgba(${addNoise(r, 10)}, ${addNoise(g, 8)}, ${addNoise(b, 8)}, ${layerOpacity})`);
                    grad.addColorStop(0.5, `rgba(${addNoise(r, 10)}, ${addNoise(g, 8)}, ${addNoise(b, 8)}, ${layerOpacity * 0.6})`);
                    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
                    
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.ellipse(m.x, m.y, m.radius * 0.6 * layerSize, m.radius * 1.3 * layerSize, m.vx * 0.08, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                const headGrad = ctx.createRadialGradient(m.x, m.y - m.radius * 0.9, 0, m.x, m.y - m.radius * 0.9, m.radius * 0.6);
                headGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${finalOpacity * 1.1})`);
                headGrad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${finalOpacity * 0.6})`);
                headGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
                ctx.fillStyle = headGrad;
                ctx.beginPath();
                ctx.arc(m.x, m.y - m.radius * 0.9, m.radius * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
            else {
                const layers = m.complexity === 1 ? 4 : 3;
                for (let layer = 0; layer < layers; layer++) {
                    const layerOpacity = finalOpacity * (1.0 - layer * 0.2);
                    const layerRadius = m.radius * (1.8 - layer * 0.35);
                    
                    const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, layerRadius);
                    grad.addColorStop(0, `rgba(${addNoise(r, 12)}, ${addNoise(g, 12)}, ${addNoise(b, 12)}, ${layerOpacity})`);
                    grad.addColorStop(0.5, `rgba(${addNoise(r, 10)}, ${addNoise(g, 10)}, ${addNoise(b, 10)}, ${layerOpacity * 0.5})`);
                    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(m.x, m.y, layerRadius, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });
    }

    // Protocells
    engine.protoCells.forEach((p) => {
        const stability = p.stability / 100;
        ctx.fillStyle = `rgba(85, 90, 100, ${0.06 * stability})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius - 4, 0, Math.PI * 2);
        ctx.fill();

        if (p.hasMembrane) {
            const lipids = 24;
            for (let i = 0; i < lipids; i++) {
                const angle = (i / lipids) * Math.PI * 2 + world.time * 0.01;
                const x = p.x + Math.cos(angle) * p.radius;
                const y = p.y + Math.sin(angle) * p.radius;
                ctx.strokeStyle = `rgba(180, 150, 110, ${0.25 * stability})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x - Math.cos(angle) * 3, y - Math.sin(angle) * 3);
                ctx.stroke();
                ctx.fillStyle = `rgba(200, 160, 100, ${0.35 * stability})`;
                ctx.beginPath();
                ctx.arc(x, y, 1.2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            ctx.strokeStyle = `rgba(180, 150, 110, ${0.15 * stability})`;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        if (p.canReplicate) {
            ctx.strokeStyle = `rgba(110, 100, 160, ${0.2 * stability})`;
            ctx.lineWidth = 1;
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
            ctx.strokeStyle = `rgba(160, 100, 130, ${0.18 * stability})`;
            ctx.lineWidth = 1;
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
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        const metrics = ctx.measureText(label);
        ctx.fillRect(p.x - metrics.width / 2 - 2, labelY - 7, metrics.width + 4, 11);
        ctx.fillStyle = `rgba(190, 195, 205, ${0.5 + stability * 0.4})`;
        ctx.fillText(label, p.x, labelY);
    });

    if (engine.luca && engine.luca.isAlive) {
        const luca = engine.luca;
        const auraGradient = ctx.createRadialGradient(luca.x, luca.y, 0, luca.x, luca.y, luca.radius * 1.8);
        auraGradient.addColorStop(0, 'rgba(200, 180, 140, 0.08)');
        auraGradient.addColorStop(1, 'rgba(200, 180, 140, 0)');
        ctx.fillStyle = auraGradient;
        ctx.beginPath();
        ctx.arc(luca.x, luca.y, luca.radius * 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(100, 95, 105, 0.3)';
        ctx.beginPath();
        ctx.arc(luca.x, luca.y, luca.radius, 0, Math.PI * 2);
        ctx.fill();
        const lipidCount = 32;
        for (let i = 0; i < lipidCount; i++) {
            const angle = (i / lipidCount) * Math.PI * 2 + world.time * 0.005;
            const x = luca.x + Math.cos(angle) * luca.radius;
            const y = luca.y + Math.sin(angle) * luca.radius;
            ctx.strokeStyle = 'rgba(180, 150, 110, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - Math.cos(angle) * 3.5, y - Math.sin(angle) * 3.5);
            ctx.stroke();
            ctx.fillStyle = 'rgba(190, 160, 120, 0.5)';
            ctx.beginPath();
            ctx.arc(x, y, 1.3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.strokeStyle = 'rgba(110, 100, 150, 0.25)';
        ctx.lineWidth = 1.5;
        for (let r = 0; r < 3; r++) {
            ctx.beginPath();
            ctx.arc(luca.x, luca.y, 10 + r * 3, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.fillStyle = 'rgba(130, 120, 150, 0.3)';
        for (let i = 0; i < 16; i++) {
            const angle = (world.time * 0.003 + i * Math.PI / 8);
            const r = luca.radius * (0.3 + (i % 4) * 0.12);
            ctx.beginPath();
            ctx.arc(luca.x + Math.cos(angle) * r, luca.y + Math.sin(angle) * r, 1, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.font = 'bold 11px system-ui';
        ctx.textAlign = 'center';
        const titleY = luca.y - luca.radius - 16;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        const titleMetrics = ctx.measureText('LUCA');
        ctx.fillRect(luca.x - titleMetrics.width / 2 - 3, titleY - 9, titleMetrics.width + 6, 14);
        ctx.fillStyle = 'rgba(200, 180, 140, 0.9)';
        ctx.fillText('LUCA', luca.x, titleY);
        ctx.font = '7px system-ui';
        ctx.fillStyle = 'rgba(170, 170, 180, 0.7)';
        ctx.fillText('Last Universal Common Ancestor', luca.x, titleY + 12);
    }

    engine.organisms.forEach((o) => {
        if (!o.isAlive) {
            ctx.fillStyle = 'rgba(60, 58, 62, 0.2)';
            ctx.beginPath();
            ctx.arc(o.x, o.y, o.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
            return;
        }
        const energy = Math.min(100, o.energy);
        const vitalityAlpha = 0.15 + (energy / 100) * 0.2;
        ctx.fillStyle = o.traits.color.replace(')', `, ${vitalityAlpha})`).replace('hsl', 'hsla');
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
        ctx.fill();
        const cellLipids = Math.floor(o.radius * 1.5);
        const membraneAlpha = 0.3 + (energy / 150) * 0.2;
        for (let i = 0; i < cellLipids; i++) {
            const angle = (i / cellLipids) * Math.PI * 2;
            const x = o.x + Math.cos(angle) * o.radius;
            const y = o.y + Math.sin(angle) * o.radius;
            ctx.strokeStyle = o.traits.color.replace(')', `, ${membraneAlpha * 0.8})`).replace('hsl', 'hsla');
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - Math.cos(angle) * 2, y - Math.sin(angle) * 2);
            ctx.stroke();
            ctx.fillStyle = o.traits.color.replace(')', `, ${membraneAlpha})`).replace('hsl', 'hsla');
            ctx.beginPath();
            ctx.arc(x, y, 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = o.traits.color.replace(')', `, ${vitalityAlpha * 1.3})`).replace('hsl', 'hsla');
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
        if (o.radius > 10) {
            ctx.font = `${Math.max(7, o.radius * 0.4)}px system-ui`;
            ctx.textAlign = 'center';
            const labelY = o.y - o.radius - 5;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            const metrics = ctx.measureText(o.name);
            ctx.fillRect(o.x - metrics.width / 2 - 2, labelY - 6, metrics.width + 4, 9);
            ctx.fillStyle = `rgba(210, 210, 220, ${0.5 + vitalityAlpha * 1.5})`;
            ctx.fillText(o.name, o.x, labelY);
        }
    });

    // Scientific UI
    ctx.fillStyle = 'rgba(10, 15, 20, 0.8)';
    ctx.fillRect(10, 10, 270, 120);
    ctx.strokeStyle = 'rgba(70, 75, 85, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 270, 120);
    ctx.font = '10px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(170, 180, 190, 0.85)';
    const phaseLabel = world.phase.replace(/_/g, ' ');
    ctx.fillText(`Phase: ${phaseLabel}`, 18, 26);
    ctx.fillText(`t = ${Math.floor(world.time / 60)}s`, 18, 42);
    ctx.fillText(`T = ${world.temperature.toFixed(1)}°C`, 18, 58);
    ctx.fillStyle = 'rgba(150, 160, 170, 0.8)';
    ctx.fillText(`Molecules: ${engine.molecules.length}`, 18, 74);
    ctx.fillText(`Bonds: ${engine.bonds.length}`, 150, 74);
    ctx.fillText(`Protocells: ${engine.protoCells.length}`, 18, 90);
    if (engine.lucaBorn) {
        ctx.fillStyle = 'rgba(200, 180, 140, 0.9)';
        ctx.fillText(`✓ LUCA emerged`, 18, 106);
    }
    if (engine.organisms.length > 0) {
        ctx.fillStyle = 'rgba(150, 160, 170, 0.8)';
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
                color: '#6b7280',
                fontSize: '11px',
                fontFamily: 'system-ui',
                textAlign: 'center',
                maxWidth: '750px',
                lineHeight: '1.7'
            }}>
                Top-down view of deep-sea hydrothermal vent ecosystem (~3000m depth)
                <br/>
                Textured basalt seafloor · Subtle volumetric molecular rendering · Ambient occlusion lighting
                <br/>
                RNA hairpin loops · Peptide chains · Lipid membranes · Black smoker chimneys
            </div>
        </div>
    );
}