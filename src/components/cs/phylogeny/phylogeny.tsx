import React, { useEffect, useRef, useState } from 'react';
import { COLORS } from './phylogeny.config';
import { SimulationEngine, wrapDelta } from './phylogeny.logic';

interface PhylogenySimProps {
    isRunning: boolean;
    speed: number;
}

function renderSimulation(ctx: CanvasRenderingContext2D, engine: SimulationEngine) {
    const world = engine.world;

    // Deep ocean - nearly black with depth gradient
    const depthGradient = ctx.createLinearGradient(0, 0, 0, world.height);
    depthGradient.addColorStop(0, '#030608');
    depthGradient.addColorStop(0.7, '#040810');
    depthGradient.addColorStop(1, '#050912');
    ctx.fillStyle = depthGradient;
    ctx.fillRect(0, 0, world.width, world.height);

    // Marine snow - organic particles drifting down
    ctx.fillStyle = 'rgba(190, 200, 210, 0.012)';
    for (let i = 0; i < 200; i++) {
        const x = (Math.random() * world.width + world.time * 0.1) % world.width;
        const y = (Math.random() * world.height + world.time * 0.15) % world.height;
        const size = Math.random() < 0.95 ? 0.5 : 1;
        ctx.fillRect(x, y, size, size);
    }

    // Volcanic seafloor - basalt and sediment layers
    const seafloorHeight = 60;
    const seafloorStart = world.height - seafloorHeight;
    
    // Sediment layer
    const sedimentGradient = ctx.createLinearGradient(0, seafloorStart, 0, world.height);
    sedimentGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    sedimentGradient.addColorStop(0.3, 'rgba(25, 22, 20, 0.3)');
    sedimentGradient.addColorStop(0.7, 'rgba(30, 26, 24, 0.5)');
    sedimentGradient.addColorStop(1, 'rgba(32, 28, 25, 0.65)');
    ctx.fillStyle = sedimentGradient;
    ctx.fillRect(0, seafloorStart, world.width, seafloorHeight);
    
    // Basalt texture - rough surface
    ctx.fillStyle = 'rgba(22, 20, 18, 0.2)';
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * world.width;
        const y = seafloorStart + 20 + Math.random() * 30;
        const size = 3 + Math.random() * 6;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    // Realistic hydrothermal vents - black/white smokers
    for (const vent of world.vents) {
        const pulse = Math.sin(world.time * 0.05 + vent.phase) * 0.1 + 0.9;

        // Mineral plume - turbulent rising particles
        const plumeHeight = 200;
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const t = i / particleCount;
            const height = t * plumeHeight;
            
            // Turbulent motion
            const turbulence = Math.sin(world.time * 0.08 + i * 0.4) * 15 * t;
            const spread = Math.sqrt(t) * 25;
            const wobble = Math.sin(world.time * 0.12 + i * 0.7) * spread * 0.4;
            
            const x = vent.x + turbulence + wobble + (Math.random() - 0.5) * spread;
            const y = vent.y - height;
            
            if (y > 0 && y < world.height) {
                // Particle size and opacity decrease with height
                const alpha = (1 - t) * 0.22 * pulse * (0.7 + Math.random() * 0.3);
                const size = (1 - t * 0.6) * (1.2 + Math.random() * 1.3);
                
                // Black smoker minerals (sulfides)
                const mineralBrightness = 140 + Math.random() * 40;
                ctx.fillStyle = `rgba(${mineralBrightness}, ${mineralBrightness * 0.85}, ${mineralBrightness * 0.75}, ${alpha})`;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Vent structure at base
        const ventRadius = 12;
        
        // Vent opening - dark crater
        ctx.fillStyle = 'rgba(20, 18, 16, 0.7)';
        ctx.beginPath();
        ctx.ellipse(vent.x, vent.y, ventRadius, ventRadius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Hot fluid exit - glowing core
        ctx.fillStyle = `rgba(240, 130, 50, ${0.4 * pulse})`;
        ctx.beginPath();
        ctx.ellipse(vent.x, vent.y, ventRadius * 0.4, ventRadius * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Heat shimmer rings - multiple layers
        for (let ring = 0; ring < 3; ring++) {
            const ringRadius = 18 + ring * 8 + pulse * 4;
            const ringAlpha = (0.12 - ring * 0.03) * pulse;
            ctx.strokeStyle = `rgba(200, 110, 40, ${ringAlpha})`;
            ctx.lineWidth = 1 + ring * 0.3;
            ctx.beginPath();
            ctx.arc(vent.x, vent.y, ringRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Mineral crust around vent
        ctx.strokeStyle = 'rgba(60, 55, 50, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(vent.x, vent.y, ventRadius * 1.3, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Realistic mineral chimney structures with directional lighting
    for (const rock of world.rocks) {
        // Light source from top-left (standard rendering convention)
        const lightAngle = Math.PI * 1.25; // Top-left direction
        
        if (rock.type === 'chimney') {
            // Tall irregular chimney spires
            const height = rock.radius * 3.8;
            const segments = 10;
            
            // Cast shadow on seafloor
            ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.beginPath();
            ctx.ellipse(rock.x + 15, rock.y + height * 0.5 + 5, rock.radius * 1.2, rock.radius * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Build chimney from bottom to top with irregular profile
            const profile = [];
            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const baseWidth = rock.radius * 0.65;
                const topWidth = rock.radius * 0.35;
                const width = baseWidth + (topWidth - baseWidth) * t;
                const wobble = Math.sin(t * Math.PI * 4 + rock.roughness * 7) * width * 0.25;
                const y = rock.y + height * 0.48 - t * height;
                profile.push({ y, leftX: rock.x - width + wobble, rightX: rock.x + width + wobble });
            }
            
            // Draw chimney body with shading
            for (let i = 0; i < segments; i++) {
                const curr = profile[i];
                const next = profile[i + 1];
                const t = i / segments;
                
                // Left side (shadow - away from light)
                const shadowGradient = ctx.createLinearGradient(curr.leftX, curr.y, curr.leftX + rock.radius * 0.3, curr.y);
                shadowGradient.addColorStop(0, 'rgba(30, 28, 26, 0.5)');
                shadowGradient.addColorStop(1, 'rgba(42, 38, 36, 0.4)');
                ctx.fillStyle = shadowGradient;
                ctx.beginPath();
                ctx.moveTo(curr.leftX, curr.y);
                ctx.lineTo(next.leftX, next.y);
                ctx.lineTo(next.leftX + rock.radius * 0.15, next.y);
                ctx.lineTo(curr.leftX + rock.radius * 0.15, curr.y);
                ctx.closePath();
                ctx.fill();
                
                // Right side (highlight - toward light)
                const highlightGradient = ctx.createLinearGradient(curr.rightX - rock.radius * 0.3, curr.y, curr.rightX, curr.y);
                highlightGradient.addColorStop(0, 'rgba(55, 50, 48, 0.42)');
                highlightGradient.addColorStop(1, 'rgba(48, 44, 42, 0.48)');
                ctx.fillStyle = highlightGradient;
                ctx.beginPath();
                ctx.moveTo(curr.rightX, curr.y);
                ctx.lineTo(next.rightX, next.y);
                ctx.lineTo(next.rightX - rock.radius * 0.15, next.y);
                ctx.lineTo(curr.rightX - rock.radius * 0.15, curr.y);
                ctx.closePath();
                ctx.fill();
                
                // Mineral layer lines
                if (i % 2 === 0) {
                    ctx.strokeStyle = 'rgba(60, 54, 50, 0.3)';
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(curr.leftX, curr.y);
                    ctx.lineTo(curr.rightX, curr.y);
                    ctx.stroke();
                }
            }
            
            // Porous texture spots
            for (let i = 0; i < 8; i++) {
                const t = Math.random();
                const segment = Math.floor(t * segments);
                const y = profile[segment].y;
                const side = Math.random() < 0.5 ? -1 : 1;
                const x = rock.x + side * rock.radius * 0.5 * (1 - t);
                ctx.fillStyle = 'rgba(25, 23, 21, 0.4)';
                ctx.beginPath();
                ctx.arc(x, y, 1.5 + Math.random(), 0, Math.PI * 2);
                ctx.fill();
            }
            
        } else if (rock.type === 'ridge') {
            // Irregular elongated ridge - pillow lava
            const points = 8;
            const vertices = [];
            
            for (let i = 0; i < points; i++) {
                const angle = (i / points) * Math.PI * 2;
                const radiusVar = rock.radius * (0.8 + Math.sin(i * 2.3 + rock.roughness * 5) * 0.35);
                const stretch = i % 2 === 0 ? 1.6 : 1.0;
                vertices.push({
                    x: rock.x + Math.cos(angle) * radiusVar * stretch,
                    y: rock.y + Math.sin(angle) * radiusVar * 0.6
                });
            }
            
            // Cast shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            vertices.forEach((v, i) => {
                if (i === 0) ctx.moveTo(v.x + 12, v.y + 8);
                else ctx.lineTo(v.x + 12, v.y + 8);
            });
            ctx.closePath();
            ctx.fill();
            
            // Main body with gradient
            const centerX = rock.x;
            const centerY = rock.y;
            const gradient = ctx.createRadialGradient(
                centerX - rock.radius * 0.3, centerY - rock.radius * 0.2, 0,
                centerX, centerY, rock.radius * 1.5
            );
            gradient.addColorStop(0, 'rgba(52, 48, 46, 0.4)');
            gradient.addColorStop(0.6, 'rgba(38, 35, 33, 0.36)');
            gradient.addColorStop(1, 'rgba(28, 26, 24, 0.32)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            vertices.forEach((v, i) => {
                if (i === 0) ctx.moveTo(v.x, v.y);
                else ctx.lineTo(v.x, v.y);
            });
            ctx.closePath();
            ctx.fill();
            
            // Edge definition
            ctx.strokeStyle = 'rgba(22, 20, 18, 0.35)';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Surface cracks
            ctx.strokeStyle = 'rgba(18, 16, 14, 0.4)';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(vertices[0].x, vertices[0].y);
            ctx.lineTo(vertices[4].x, vertices[4].y);
            ctx.stroke();
            
        } else {
            // Boulder - irregular angular basalt with lighting
            const sides = 7;
            const vertices = [];
            
            for (let i = 0; i < sides; i++) {
                const angle = (i / sides) * Math.PI * 2 + rock.roughness * 0.8;
                const r = rock.radius * (0.7 + Math.sin(i * 2.7 + rock.roughness * 6) * 0.4);
                vertices.push({
                    x: rock.x + Math.cos(angle) * r,
                    y: rock.y + Math.sin(angle) * r
                });
            }
            
            // Cast shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
            ctx.beginPath();
            vertices.forEach((v, i) => {
                if (i === 0) ctx.moveTo(v.x + 10, v.y + 6);
                else ctx.lineTo(v.x + 10, v.y + 6);
            });
            ctx.closePath();
            ctx.fill();
            
            // Main body with lighting
            const gradient = ctx.createRadialGradient(
                rock.x - rock.radius * 0.35, rock.y - rock.radius * 0.3, 0,
                rock.x, rock.y, rock.radius * 1.3
            );
            gradient.addColorStop(0, 'rgba(50, 45, 43, 0.38)');
            gradient.addColorStop(0.7, 'rgba(36, 33, 31, 0.34)');
            gradient.addColorStop(1, 'rgba(26, 24, 22, 0.30)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            vertices.forEach((v, i) => {
                if (i === 0) ctx.moveTo(v.x, v.y);
                else ctx.lineTo(v.x, v.y);
            });
            ctx.closePath();
            ctx.fill();
            
            // Angular edges
            ctx.strokeStyle = 'rgba(20, 18, 16, 0.35)';
            ctx.lineWidth = 1.2;
            ctx.stroke();
        }
    }

    // Chemical bonds
    for (const bond of engine.bonds) {
        const mol1 = engine.moleculeMap.get(bond.mol1);
        const mol2 = engine.moleculeMap.get(bond.mol2);
        if (mol1 && mol2) {
            const dx = wrapDelta(mol2.x - mol1.x, world.width);
            const dy = wrapDelta(mol2.y - mol1.y, world.height);
            
            let alpha = 0.10;
            if (bond.type === 'covalent') alpha = 0.18;
            else if (bond.type === 'hydrogen') alpha = 0.08;
            
            ctx.strokeStyle = `rgba(160, 170, 185, ${alpha})`;
            ctx.lineWidth = bond.type === 'covalent' ? 1.2 : 0.8;
            ctx.beginPath();
            ctx.moveTo(mol1.x, mol1.y);
            ctx.lineTo(mol1.x + dx, mol1.y + dy);
            ctx.stroke();
        }
    }

    // Realistic molecules - particle-based with density opacity
    if (!engine.lucaBorn) {
        engine.molecules.forEach((m) => {
            // Density-based opacity system
            const baseOpacity = m.complexity === 1 ? 0.025 : m.complexity === 2 ? 0.12 : 0.28;
            const bondBonus = Math.min(m.bondedTo.size * 0.06, 0.22);
            const finalOpacity = baseOpacity + bondBonus;
            
            // Scientific color palette - very muted
            let color = 'rgba(155, 160, 165, ';
            if (m.type === 'amino_acid') color = 'rgba(175, 145, 155, ';
            else if (m.type === 'nucleotide') color = 'rgba(125, 135, 170, ';
            else if (m.type === 'lipid') color = 'rgba(185, 165, 130, ';
            else if (m.type === 'sugar') color = 'rgba(150, 165, 150, ';
            
            // Peptides - zigzag backbone
            if (m.type === 'peptide') {
                color = 'rgba(155, 105, 130, ';
                const segments = 4;
                const segmentLen = m.radius * 0.75;
                const zigzagHeight = m.radius * 0.35;
                
                ctx.strokeStyle = color + (finalOpacity * 1.1) + ')';
                ctx.lineWidth = 1.5;
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
                
                // Amino acid residues as subtle nodes
                ctx.fillStyle = color + (finalOpacity * 1.2) + ')';
                for (let i = 0; i < segments; i++) {
                    const x = m.x - segmentLen + (i * segmentLen / (segments - 1)) * 2;
                    const y = m.y + (i % 2 === 0 ? -zigzagHeight : zigzagHeight);
                    ctx.beginPath();
                    ctx.arc(x, y, 1.2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            // RNA - single strand with hairpin loops (stem-loop structures)
            else if (m.type === 'rna_fragment') {
                color = 'rgba(100, 95, 155, ';
                const fragmentLength = m.radius * 2.5;
                
                // Single-stranded RNA with hairpin loop structure
                ctx.strokeStyle = color + (finalOpacity * 1.3) + ')';
                ctx.lineWidth = 1.3;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();
                
                // Start of strand
                const startX = m.x - fragmentLength * 0.5;
                const startY = m.y;
                ctx.moveTo(startX, startY);
                
                // First part - single strand going up
                const points = 15;
                for (let i = 1; i <= 5; i++) {
                    const t = i / points;
                    const x = startX + fragmentLength * t * 0.3;
                    const y = startY - fragmentLength * t * 0.6 + Math.sin(t * Math.PI * 3) * 2;
                    ctx.lineTo(x, y);
                }
                
                // Hairpin loop at top
                const loopCenterX = m.x - fragmentLength * 0.2;
                const loopCenterY = m.y - fragmentLength * 0.4;
                const loopRadius = fragmentLength * 0.15;
                for (let i = 0; i <= 8; i++) {
                    const angle = Math.PI + (i / 8) * Math.PI;
                    const x = loopCenterX + Math.cos(angle) * loopRadius;
                    const y = loopCenterY + Math.sin(angle) * loopRadius;
                    ctx.lineTo(x, y);
                }
                
                // Second part - paired stem going down (parallel to first part)
                for (let i = 5; i >= 1; i--) {
                    const t = i / points;
                    const x = startX + fragmentLength * t * 0.3 + fragmentLength * 0.08;
                    const y = startY - fragmentLength * t * 0.6 + Math.sin(t * Math.PI * 3) * 2;
                    ctx.lineTo(x, y);
                }
                
                // End tail
                ctx.lineTo(m.x + fragmentLength * 0.3, startY);
                
                ctx.stroke();
                
                // Draw base pairing indicators in stem (hydrogen bonds)
                ctx.strokeStyle = color + (finalOpacity * 0.6) + ')';
                ctx.lineWidth = 0.6;
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
            // Lipids - elongated phospholipid shape
            else if (m.type === 'lipid' || m.type === 'membrane_vesicle') {
                const gradient = ctx.createRadialGradient(m.x, m.y - m.radius * 0.6, 0, m.x, m.y, m.radius * 1.2);
                gradient.addColorStop(0, color + (finalOpacity * 1.3) + ')');
                gradient.addColorStop(0.5, color + (finalOpacity * 0.9) + ')');
                gradient.addColorStop(1, color + (finalOpacity * 0.4) + ')');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.ellipse(m.x, m.y, m.radius * 0.6, m.radius * 1.3, m.vx * 0.1, 0, Math.PI * 2);
                ctx.fill();
                
                // Hydrophilic head
                ctx.fillStyle = color + (finalOpacity * 1.4) + ')';
                ctx.beginPath();
                ctx.arc(m.x, m.y - m.radius * 0.9, m.radius * 0.45, 0, Math.PI * 2);
                ctx.fill();
            }
            // Simple molecules and building blocks - subtle particles
            else {
                if (m.complexity === 1) {
                    // Simplest molecules - tiny diffuse particles
                    const gradient = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.radius * 1.5);
                    gradient.addColorStop(0, color + (finalOpacity * 1.8) + ')');
                    gradient.addColorStop(0.6, color + (finalOpacity * 0.6) + ')');
                    gradient.addColorStop(1, color + '0)');
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(m.x, m.y, m.radius * 1.5, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // Building blocks - slightly more visible
                    const gradient = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.radius);
                    gradient.addColorStop(0, color + (finalOpacity * 1.5) + ')');
                    gradient.addColorStop(0.7, color + (finalOpacity * 0.8) + ')');
                    gradient.addColorStop(1, color + (finalOpacity * 0.2) + ')');
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });
    }

    // Protocells - realistic lipid vesicles
    engine.protoCells.forEach((p) => {
        const stability = p.stability / 100;
        
        // Inner aqueous compartment
        ctx.fillStyle = `rgba(85, 90, 100, ${0.06 * stability})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius - 4, 0, Math.PI * 2);
        ctx.fill();

        // Lipid bilayer - outer leaflet
        if (p.hasMembrane) {
            const lipids = 24;
            for (let i = 0; i < lipids; i++) {
                const angle = (i / lipids) * Math.PI * 2 + world.time * 0.01;
                const x = p.x + Math.cos(angle) * p.radius;
                const y = p.y + Math.sin(angle) * p.radius;
                const headAngle = angle + Math.PI / 2;
                
                // Hydrophobic tail
                ctx.strokeStyle = `rgba(180, 150, 110, ${0.25 * stability})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x - Math.cos(angle) * 3, y - Math.sin(angle) * 3);
                ctx.stroke();
                
                // Hydrophilic head
                ctx.fillStyle = `rgba(200, 160, 100, ${0.35 * stability})`;
                ctx.beginPath();
                ctx.arc(x, y, 1.2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            // Forming - incomplete membrane
            ctx.strokeStyle = `rgba(180, 150, 110, ${0.15 * stability})`;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Internal RNA/peptides
        if (p.canReplicate) {
            // RNA strands as small helices
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
            // Peptide zigzags
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

        // Minimal label
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

    // LUCA - primitive prokaryotic cell
    if (engine.luca && engine.luca.isAlive) {
        const luca = engine.luca;

        // Minimal aura
        const auraGradient = ctx.createRadialGradient(luca.x, luca.y, 0, luca.x, luca.y, luca.radius * 1.8);
        auraGradient.addColorStop(0, 'rgba(200, 180, 140, 0.08)');
        auraGradient.addColorStop(1, 'rgba(200, 180, 140, 0)');
        ctx.fillStyle = auraGradient;
        ctx.beginPath();
        ctx.arc(luca.x, luca.y, luca.radius * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Cytoplasm
        ctx.fillStyle = 'rgba(100, 95, 105, 0.3)';
        ctx.beginPath();
        ctx.arc(luca.x, luca.y, luca.radius, 0, Math.PI * 2);
        ctx.fill();

        // Lipid membrane bilayer
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

        // Nucleoid region - circular DNA/RNA
        ctx.strokeStyle = 'rgba(110, 100, 150, 0.25)';
        ctx.lineWidth = 1.5;
        for (let r = 0; r < 3; r++) {
            ctx.beginPath();
            ctx.arc(luca.x, luca.y, 10 + r * 3, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Ribosomes - small dots
        ctx.fillStyle = 'rgba(130, 120, 150, 0.3)';
        for (let i = 0; i < 16; i++) {
            const angle = (world.time * 0.003 + i * Math.PI / 8);
            const r = luca.radius * (0.3 + (i % 4) * 0.12);
            ctx.beginPath();
            ctx.arc(luca.x + Math.cos(angle) * r, luca.y + Math.sin(angle) * r, 1, 0, Math.PI * 2);
            ctx.fill();
        }

        // Label
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

    // Organisms - realistic cells
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

        // Cytoplasm
        ctx.fillStyle = o.traits.color.replace(')', `, ${vitalityAlpha})`).replace('hsl', 'hsla');
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
        ctx.fill();

        // Membrane lipid bilayer
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

        // Nucleoid
        ctx.fillStyle = o.traits.color.replace(')', `, ${vitalityAlpha * 1.3})`).replace('hsl', 'hsla');
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Label
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
                Scientific visualization of primordial chemistry at deep-sea hydrothermal vents (~3000m depth)
                <br/>
                Black smoker chimneys with directional lighting · RNA: single-stranded hairpin loops · Peptides: zigzag backbone
                <br/>
                Molecular opacity increases with structural complexity and bonding density
            </div>
        </div>
    );
}