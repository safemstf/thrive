import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SimulationEngine, wrapDelta, toroidalDistance } from './phylogeny.logic';
import { 
    COLORS, PHASE_LABELS, PHASE_DESCRIPTIONS, MOLECULE_INFO, CELL_ROLE_INFO,
    CATASTROPHE_CONFIG, WORLD_WIDTH, WORLD_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT,
    RENDER, MoleculeType, ViewMode, CellRole, Species,
} from './phylogeny.config';

interface EvolutionSimProps {
    isRunning: boolean;
    speed: number;
}

// ==================== PALETTE ====================

const PALETTE = {
    bgDeep: '#030508',
    bgMid: '#080c14',
    bgLight: '#0f1520',
    gridLine: 'rgba(25, 45, 65, 0.15)',
    
    ventCore: '#ff6b35',
    ventGlow: '#ff9f1c',
    
    luca: '#fbbf24',
    prokaryote: '#3b82f6',
    eukaryote: '#a855f7',
    colony: '#06b6d4',
    multicellular: '#14b8a6',
    
    catastrophe: 'rgba(239, 68, 68, 0.3)',
    
    uiBg: 'rgba(3, 5, 8, 0.95)',
    uiBgLight: 'rgba(15, 21, 32, 0.95)',
    uiBorder: 'rgba(40, 70, 110, 0.35)',
    uiText: '#8b9cb8',
    uiTextBright: '#d4e0f0',
    uiHighlight: '#00d4ff',
    uiSuccess: '#22c55e',
    uiWarn: '#f59e0b',
    uiDanger: '#ef4444',
};

// Flow particles for Coriolis effect visualization
interface FlowParticle {
    x: number;
    y: number;
    age: number;
    maxAge: number;
    opacity: number;
}

let flowParticles: FlowParticle[] = [];

function initFlowParticles() {
    flowParticles = [];
    for (let i = 0; i < RENDER.FLOW_PARTICLE_COUNT; i++) {
        flowParticles.push({
            x: Math.random() * WORLD_WIDTH,
            y: Math.random() * WORLD_HEIGHT,
            age: Math.random() * 200,
            maxAge: 150 + Math.random() * 100,
            opacity: 0.15 + Math.random() * 0.15,
        });
    }
}

// ==================== RENDER HELPERS ====================

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// ==================== RENDER FUNCTIONS ====================

function renderBackground(ctx: CanvasRenderingContext2D, engine: SimulationEngine, camera: { x: number; y: number; zoom: number }) {
    const { world } = engine;
    const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
    const { zoom } = camera;
    
    const offsetX = camera.x - (W / 2) / zoom;
    const offsetY = camera.y - (H / 2) / zoom;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, PALETTE.bgDeep);
    bgGrad.addColorStop(0.5, PALETTE.bgMid);
    bgGrad.addColorStop(1, PALETTE.bgDeep);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Active catastrophe overlay
    if (world.activeCatastrophe) {
        const progress = (world.time - world.activeCatastrophe.startTime) / world.activeCatastrophe.duration;
        const intensity = Math.sin(progress * Math.PI) * world.activeCatastrophe.intensity;
        
        let overlayColor = 'rgba(239, 68, 68, 0.15)';
        if (world.activeCatastrophe.type === 'ice_age') overlayColor = `rgba(147, 197, 253, ${0.2 * intensity})`;
        else if (world.activeCatastrophe.type === 'volcanic_winter') overlayColor = `rgba(75, 85, 99, ${0.25 * intensity})`;
        else if (world.activeCatastrophe.type === 'oxygen_spike') overlayColor = `rgba(96, 165, 250, ${0.15 * intensity})`;
        else if (world.activeCatastrophe.type === 'solar_flare') overlayColor = `rgba(251, 191, 36, ${0.2 * intensity})`;
        else overlayColor = `rgba(239, 68, 68, ${0.15 * intensity})`;
        
        ctx.fillStyle = overlayColor;
        ctx.fillRect(0, 0, W, H);
    }

    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(-offsetX, -offsetY);

    // Grid (only at certain zoom levels)
    if (zoom > 0.5 && engine.viewMode !== 'ecosystem') {
        ctx.strokeStyle = PALETTE.gridLine;
        ctx.lineWidth = 0.5 / zoom;
        const gridSize = 80;
        const startX = Math.floor(offsetX / gridSize) * gridSize;
        const startY = Math.floor(offsetY / gridSize) * gridSize;
        const endX = offsetX + W / zoom;
        const endY = offsetY + H / zoom;
        
        for (let x = startX; x < endX; x += gridSize) {
            ctx.beginPath(); ctx.moveTo(x, offsetY); ctx.lineTo(x, endY); ctx.stroke();
        }
        for (let y = startY; y < endY; y += gridSize) {
            ctx.beginPath(); ctx.moveTo(offsetX, y); ctx.lineTo(endX, y); ctx.stroke();
        }
    }

    // Energy field visualization
    if (RENDER.SHOW_ENERGY_FIELD && engine.viewMode === 'molecular') {
        const cellSize = 40;
        for (let y = 0; y < world.energyField.length; y++) {
            for (let x = 0; x < world.energyField[y].length; x++) {
                const energy = world.energyField[y][x];
                if (energy > 20) {
                    const alpha = Math.min(0.25, (energy / 65) * RENDER.ENERGY_FIELD_OPACITY);
                    ctx.fillStyle = `rgba(20, 184, 166, ${alpha})`;
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }
        }
    }

    // Oxygen/light zones
    for (const zone of world.zones) {
        if (zone.oxygenLevel > 0.5) {
            const grad = ctx.createRadialGradient(zone.x, zone.y, 0, zone.x, zone.y, zone.radius);
            grad.addColorStop(0, `rgba(96, 165, 250, ${zone.oxygenLevel * 0.05})`);
            grad.addColorStop(1, 'rgba(96, 165, 250, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2); ctx.fill();
        }
        if (zone.lightLevel > 0.3) {
            const grad = ctx.createRadialGradient(zone.x, zone.y, 0, zone.x, zone.y, zone.radius);
            grad.addColorStop(0, `rgba(250, 204, 21, ${zone.lightLevel * 0.035})`);
            grad.addColorStop(1, 'rgba(250, 204, 21, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2); ctx.fill();
        }
    }

    // Flow particles (Coriolis effect visualization)
    if (RENDER.SHOW_FLOW_PARTICLES) {
        for (const particle of flowParticles) {
            // Update particle position based on flow
            const flow = world.getFlowAt(particle.x, particle.y);
            particle.x += flow.fx * RENDER.FLOW_PARTICLE_SPEED * 8;
            particle.y += flow.fy * RENDER.FLOW_PARTICLE_SPEED * 8;
            particle.age++;
            
            // Wrap around world
            particle.x = ((particle.x % WORLD_WIDTH) + WORLD_WIDTH) % WORLD_WIDTH;
            particle.y = ((particle.y % WORLD_HEIGHT) + WORLD_HEIGHT) % WORLD_HEIGHT;
            
            // Reset old particles
            if (particle.age > particle.maxAge) {
                particle.x = Math.random() * WORLD_WIDTH;
                particle.y = Math.random() * WORLD_HEIGHT;
                particle.age = 0;
                particle.maxAge = 150 + Math.random() * 100;
            }
            
            // Draw particle with fade based on age
            const lifeFade = 1 - (particle.age / particle.maxAge);
            const alpha = particle.opacity * lifeFade * 0.6;
            ctx.fillStyle = `rgba(100, 180, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Rocks
    for (const rock of world.rocks) {
        const rockGrad = ctx.createRadialGradient(rock.x, rock.y, 0, rock.x, rock.y, rock.radius);
        rockGrad.addColorStop(0, 'rgba(45, 55, 72, 0.9)');
        rockGrad.addColorStop(0.7, 'rgba(30, 40, 55, 0.8)');
        rockGrad.addColorStop(1, 'rgba(20, 30, 40, 0.6)');
        ctx.fillStyle = rockGrad;
        ctx.beginPath(); ctx.arc(rock.x, rock.y, rock.radius, 0, Math.PI * 2); ctx.fill();
        
        // Rock highlight
        ctx.strokeStyle = 'rgba(80, 100, 120, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(rock.x, rock.y, rock.radius, 0, Math.PI * 2); ctx.stroke();
    }

    // Hydrothermal vents
    for (const vent of world.vents) {
        const pulse = 0.75 + Math.sin(world.time * 0.07 + vent.phase) * 0.25;

        // Outer glow
        const glowGrad = ctx.createRadialGradient(vent.x, vent.y, 0, vent.x, vent.y, 110);
        glowGrad.addColorStop(0, `rgba(255, 159, 28, ${0.15 * pulse})`);
        glowGrad.addColorStop(0.4, `rgba(255, 107, 53, ${0.08 * pulse})`);
        glowGrad.addColorStop(0.7, `rgba(255, 80, 30, ${0.03 * pulse})`);
        glowGrad.addColorStop(1, 'rgba(255, 107, 53, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath(); ctx.arc(vent.x, vent.y, 110, 0, Math.PI * 2); ctx.fill();

        // Rising plume particles
        for (let i = 0; i < 15; i++) {
            const age = ((world.time * 0.05 + i * 0.12) % 1);
            const spread = age * 45;
            const angle = (i / 15) * Math.PI * 2 + world.time * 0.015;
            const rise = age * 30; // Particles rise up
            const px = vent.x + Math.cos(angle) * spread;
            const py = vent.y + Math.sin(angle) * spread - rise;
            const size = (1 - age * 0.5) * 3;
            ctx.fillStyle = `rgba(255, 200, 50, ${(1 - age) * 0.5 * pulse})`;
            ctx.beginPath(); ctx.arc(px, py, size, 0, Math.PI * 2); ctx.fill();
        }

        // Core glow
        const coreGrad = ctx.createRadialGradient(vent.x, vent.y, 0, vent.x, vent.y, 20);
        coreGrad.addColorStop(0, `rgba(255, 255, 220, ${0.9 * pulse})`);
        coreGrad.addColorStop(0.3, `rgba(255, 200, 100, ${0.7 * pulse})`);
        coreGrad.addColorStop(0.6, `rgba(255, 140, 50, ${0.4 * pulse})`);
        coreGrad.addColorStop(1, 'rgba(255, 107, 53, 0)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath(); ctx.arc(vent.x, vent.y, 20, 0, Math.PI * 2); ctx.fill();
    }

    ctx.restore();
}

function renderMolecules(ctx: CanvasRenderingContext2D, engine: SimulationEngine, camera: { x: number; y: number; zoom: number }) {
    const { world, molecules, bonds } = engine;
    const { zoom } = camera;
    const offsetX = camera.x - (CANVAS_WIDTH / 2) / zoom;
    const offsetY = camera.y - (CANVAS_HEIGHT / 2) / zoom;

    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(-offsetX, -offsetY);

    // Draw bonds first (behind molecules)
    for (const bond of bonds) {
        const m1 = engine.moleculeMap.get(bond.mol1);
        const m2 = engine.moleculeMap.get(bond.mol2);
        if (!m1 || !m2) continue;
        
        const dx = wrapDelta(m2.x - m1.x, world.width);
        const dy = wrapDelta(m2.y - m1.y, world.height);
        
        if (bond.type === 'covalent') {
            ctx.strokeStyle = 'rgba(180, 140, 255, 0.5)';
            ctx.lineWidth = RENDER.BOND_COVALENT_WIDTH;
        } else if (bond.type === 'hydrophobic') {
            ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)';
            ctx.lineWidth = RENDER.BOND_HYDROPHOBIC_WIDTH;
            ctx.setLineDash([3, 2]);
        } else {
            ctx.strokeStyle = 'rgba(140, 180, 230, 0.25)';
            ctx.lineWidth = RENDER.BOND_HYDROGEN_WIDTH;
            ctx.setLineDash([2, 2]);
        }
        
        ctx.beginPath(); 
        ctx.moveTo(m1.x, m1.y); 
        ctx.lineTo(m1.x + dx, m1.y + dy); 
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Draw molecules
    for (const m of molecules) {
        const info = MOLECULE_INFO[m.type];
        const color = info?.color || '#64748b';
        const glowColor = info?.glowColor || 'rgba(100, 116, 139, 0.3)';
        
        // Size based on complexity
        const baseSize = m.radius;
        const size = baseSize * (m.complexity === 1 ? 1 : m.complexity === 2 ? 1.4 : 1.8);

        // Glow effect for complex molecules
        if (m.complexity > 1 || m.bondedTo.size > 0) {
            const glow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, size * 2);
            glow.addColorStop(0, glowColor);
            glow.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = glow;
            ctx.beginPath(); 
            ctx.arc(m.x, m.y, size * 2, 0, Math.PI * 2); 
            ctx.fill();
        }

        // Main body
        const bodyGrad = ctx.createRadialGradient(m.x - size * 0.2, m.y - size * 0.2, 0, m.x, m.y, size);
        bodyGrad.addColorStop(0, color);
        bodyGrad.addColorStop(0.7, color);
        bodyGrad.addColorStop(1, `${color}88`);
        ctx.fillStyle = bodyGrad;
        ctx.beginPath(); 
        ctx.arc(m.x, m.y, size * 0.65, 0, Math.PI * 2); 
        ctx.fill();

        // Draw symbol on complex molecules when zoomed in
        if (RENDER.SHOW_MOLECULE_SYMBOLS && zoom >= RENDER.MOLECULE_SYMBOL_MIN_ZOOM && m.complexity >= 2) {
            ctx.font = `bold ${Math.max(6, size * 0.5)}px system-ui`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            
            // Use the nucleotide base for nucleotides, symbol for others
            const symbol = m.type === 'nucleotide' ? m.symbol : info?.symbol || '';
            ctx.fillText(symbol, m.x, m.y);
        }
    }

    ctx.restore();
}

function renderProtoCells(ctx: CanvasRenderingContext2D, engine: SimulationEngine, camera: { x: number; y: number; zoom: number }) {
    const { zoom } = camera;
    const offsetX = camera.x - (CANVAS_WIDTH / 2) / zoom;
    const offsetY = camera.y - (CANVAS_HEIGHT / 2) / zoom;

    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(-offsetX, -offsetY);

    for (const p of engine.protoCells) {
        const stability = p.stability / 100;

        // Inner glow
        const innerGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        innerGrad.addColorStop(0, `rgba(255, 220, 100, ${0.08 * stability})`);
        innerGrad.addColorStop(0.7, `rgba(255, 200, 50, ${0.04 * stability})`);
        innerGrad.addColorStop(1, 'rgba(255, 180, 30, 0)');
        ctx.fillStyle = innerGrad;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();

        // Membrane
        if (p.hasMembrane) {
            ctx.strokeStyle = `rgba(255, 217, 61, ${0.6 * stability})`;
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.stroke();
        } else {
            ctx.strokeStyle = `rgba(255, 217, 61, ${0.25 * stability})`;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([5, 4]);
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);
        }

        // Feature indicators with actual icons
        const icons: string[] = [];
        if (p.hasMembrane) icons.push('🟡'); // Lipid membrane
        if (p.hasMetabolism) icons.push('⛓️'); // Peptide metabolism
        if (p.canReplicate) icons.push('🧬'); // RNA replication
        
        if (icons.length > 0 && zoom > 0.6) {
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = `rgba(255,255,255,${0.85 * stability})`;
            ctx.fillText(icons.join(' '), p.x, p.y - p.radius - 10);
        }

        // Status label
        let label = 'Vesicle';
        let labelColor = PALETTE.uiText;
        if (p.canBecomeLUCA()) {
            label = '★ Ready!';
            labelColor = PALETTE.uiSuccess;
        } else if (p.hasMembrane && p.hasMetabolism && p.canReplicate) {
            label = '★ Protocell';
            labelColor = PALETTE.uiHighlight;
        } else if (p.hasMembrane) {
            label = 'Liposome';
        }
        
        if (zoom > 0.5) {
            ctx.font = 'bold 9px system-ui';
            ctx.fillStyle = labelColor;
            ctx.fillText(label, p.x, p.y + p.radius + 13);
            
            // Stability bar
            const barWidth = 30;
            const barHeight = 3;
            ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
            ctx.fillRect(p.x - barWidth / 2, p.y + p.radius + 17, barWidth, barHeight);
            ctx.fillStyle = `rgba(251, 191, 36, ${0.7 + stability * 0.3})`;
            ctx.fillRect(p.x - barWidth / 2, p.y + p.radius + 17, barWidth * stability, barHeight);
        }
    }

    ctx.restore();
}

function renderLUCA(ctx: CanvasRenderingContext2D, engine: SimulationEngine, camera: { x: number; y: number; zoom: number }) {
    const luca = engine.luca;
    if (!luca || !luca.isAlive) return;

    const { world } = engine;
    const { zoom } = camera;
    const offsetX = camera.x - (CANVAS_WIDTH / 2) / zoom;
    const offsetY = camera.y - (CANVAS_HEIGHT / 2) / zoom;

    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(-offsetX, -offsetY);

    // Outer aura
    const aura = ctx.createRadialGradient(luca.x, luca.y, 0, luca.x, luca.y, luca.radius * 3);
    aura.addColorStop(0, 'rgba(251, 191, 36, 0.25)');
    aura.addColorStop(0.4, 'rgba(251, 191, 36, 0.1)');
    aura.addColorStop(0.7, 'rgba(251, 191, 36, 0.03)');
    aura.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath(); ctx.arc(luca.x, luca.y, luca.radius * 3, 0, Math.PI * 2); ctx.fill();

    // Pulsing ring
    const pulsePhase = (Math.sin(world.time * 0.08) + 1) / 2;
    const pulseR = luca.radius * (1.1 + pulsePhase * 0.15);
    ctx.strokeStyle = `rgba(251, 191, 36, ${0.3 + pulsePhase * 0.25})`;
    ctx.lineWidth = 2 + pulsePhase;
    ctx.beginPath(); ctx.arc(luca.x, luca.y, pulseR, 0, Math.PI * 2); ctx.stroke();

    // Body gradient
    const bodyGrad = ctx.createRadialGradient(
        luca.x - luca.radius * 0.2, luca.y - luca.radius * 0.2, 0, 
        luca.x, luca.y, luca.radius
    );
    bodyGrad.addColorStop(0, 'rgba(255, 230, 150, 0.4)');
    bodyGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.25)');
    bodyGrad.addColorStop(1, 'rgba(245, 158, 11, 0.15)');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath(); ctx.arc(luca.x, luca.y, luca.radius, 0, Math.PI * 2); ctx.fill();

    // Main membrane
    ctx.strokeStyle = PALETTE.luca;
    ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.arc(luca.x, luca.y, luca.radius, 0, Math.PI * 2); ctx.stroke();

    // Internal structures
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + world.time * 0.012;
        const r = luca.radius * 0.55;
        const x = luca.x + Math.cos(angle) * r;
        const y = luca.y + Math.sin(angle) * r;
        
        ctx.fillStyle = 'rgba(255, 255, 200, 0.35)';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Central nucleus
    ctx.fillStyle = 'rgba(255, 220, 100, 0.5)';
    ctx.beginPath(); ctx.arc(luca.x, luca.y, luca.radius * 0.25, 0, Math.PI * 2); ctx.fill();

    // Labels
    ctx.font = 'bold 13px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.luca;
    ctx.fillText('★ LUCA ★', luca.x, luca.y - luca.radius - 18);
    ctx.font = '9px system-ui';
    ctx.fillStyle = PALETTE.uiText;
    ctx.fillText('Last Universal Common Ancestor', luca.x, luca.y - luca.radius - 6);

    // Energy bar
    const energyPct = Math.min(1, luca.energy / 160);
    const barW = 40;
    ctx.fillStyle = 'rgba(30, 30, 30, 0.6)';
    ctx.fillRect(luca.x - barW / 2, luca.y + luca.radius + 8, barW, 4);
    ctx.fillStyle = `rgba(251, 191, 36, ${0.7 + energyPct * 0.3})`;
    ctx.fillRect(luca.x - barW / 2, luca.y + luca.radius + 8, barW * energyPct, 4);

    ctx.restore();
}

function renderOrganisms(ctx: CanvasRenderingContext2D, engine: SimulationEngine, camera: { x: number; y: number; zoom: number }) {
    const { zoom } = camera;
    const offsetX = camera.x - (CANVAS_WIDTH / 2) / zoom;
    const offsetY = camera.y - (CANVAS_HEIGHT / 2) / zoom;
    const { world } = engine;

    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(-offsetX, -offsetY);

    // Prokaryotes
    for (const o of engine.prokaryotes) {
        if (!o.isAlive && o.age > 100) continue;
        
        const alpha = o.isAlive ? 1 : Math.max(0, 1 - o.age / 120);
        const energy = Math.min(100, o.energy) / 100;
        
        const species = engine.species.get(o.speciesId);
        const speciesColor = species?.color || o.traits.color;

        // Glow for healthy organisms
        if (o.isAlive && energy > 0.4) {
            const glow = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.radius * 1.6);
            glow.addColorStop(0, `${speciesColor}40`);
            glow.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = glow;
            ctx.beginPath(); ctx.arc(o.x, o.y, o.radius * 1.6, 0, Math.PI * 2); ctx.fill();
        }

        // Mating indicator
        if (o.isMating) {
            const matingPulse = Math.sin(world.time * 0.2) * 0.3 + 0.7;
            ctx.strokeStyle = `rgba(236, 72, 153, ${0.7 * matingPulse})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 3]);
            ctx.beginPath(); ctx.arc(o.x, o.y, o.radius + 6, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);
        }

        // Body
        const bodyGrad = ctx.createRadialGradient(
            o.x - o.radius * 0.2, o.y - o.radius * 0.2, 0,
            o.x, o.y, o.radius
        );
        bodyGrad.addColorStop(0, speciesColor);
        bodyGrad.addColorStop(0.6, `${speciesColor}cc`);
        bodyGrad.addColorStop(1, `${speciesColor}66`);
        ctx.fillStyle = bodyGrad;
        ctx.globalAlpha = (0.4 + energy * 0.6) * alpha;
        ctx.beginPath(); ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;

        // Membrane
        ctx.strokeStyle = `${speciesColor}${Math.floor((0.6 + energy * 0.4) * alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2); ctx.stroke();

        // Trait indicators (small icons)
        const indicators: { icon: string; x: number; y: number; color: string }[] = [];
        
        if (o.traits.predatory > 0.5) {
            indicators.push({ icon: '🔴', x: o.radius * 0.7, y: -o.radius * 0.7, color: '#ef4444' });
        }
        if (o.traits.photosynthetic > 0.4) {
            indicators.push({ icon: '☀️', x: -o.radius * 0.7, y: -o.radius * 0.7, color: '#22c55e' });
        }
        if (o.traits.cooperation > 0.6) {
            indicators.push({ icon: '🔗', x: 0, y: -o.radius * 0.9, color: '#06b6d4' });
        }

        if (zoom > 0.7) {
            ctx.font = '8px sans-serif';
            for (const ind of indicators) {
                ctx.fillText(ind.icon, o.x + ind.x, o.y + ind.y);
            }
        }

        // Name label
        if (o.isAlive && o.radius > 7 && zoom > 0.6) {
            ctx.font = `bold ${Math.max(7, o.radius * 0.45)}px system-ui`;
            ctx.textAlign = 'center';
            ctx.fillStyle = `rgba(255,255,255,${0.85 * alpha})`;
            ctx.fillText(o.name, o.x, o.y - o.radius - 5);
        }
    }

    // Eukaryotes
    for (const e of engine.eukaryotes) {
        if (!e.isAlive && e.age > 140) continue;
        
        const alpha = e.isAlive ? 1 : Math.max(0, 1 - e.age / 180);
        const energy = Math.min(100, e.energy) / 100;
        const species = engine.species.get(e.speciesId);
        const speciesColor = species?.color || PALETTE.eukaryote;

        // Glow
        if (e.isAlive) {
            const glow = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.radius * 2.2);
            glow.addColorStop(0, `${speciesColor}30`);
            glow.addColorStop(1, `${speciesColor}00`);
            ctx.fillStyle = glow;
            ctx.beginPath(); ctx.arc(e.x, e.y, e.radius * 2.2, 0, Math.PI * 2); ctx.fill();
        }

        // Body
        const bodyGrad = ctx.createRadialGradient(
            e.x - e.radius * 0.15, e.y - e.radius * 0.15, 0,
            e.x, e.y, e.radius
        );
        bodyGrad.addColorStop(0, `${speciesColor}55`);
        bodyGrad.addColorStop(0.7, `${speciesColor}35`);
        bodyGrad.addColorStop(1, `${speciesColor}15`);
        ctx.fillStyle = bodyGrad;
        ctx.globalAlpha = alpha;
        ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;

        // Membrane (double for eukaryotes)
        ctx.strokeStyle = `${speciesColor}${Math.floor((0.6 + energy * 0.35) * alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(e.x, e.y, e.radius - 4, 0, Math.PI * 2); ctx.stroke();

        // Nucleus
        const nucGrad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.radius * 0.38);
        nucGrad.addColorStop(0, `rgba(129, 140, 248, ${0.6 * alpha})`);
        nucGrad.addColorStop(1, `rgba(99, 102, 241, ${0.3 * alpha})`);
        ctx.fillStyle = nucGrad;
        ctx.beginPath(); ctx.arc(e.x, e.y, e.radius * 0.35, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = `rgba(129, 140, 248, ${0.8 * alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Mitochondria
        if (e.hasMitochondria) {
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2 + world.time * 0.006;
                const r = e.radius * 0.6;
                const mx = e.x + Math.cos(angle) * r;
                const my = e.y + Math.sin(angle) * r;
                
                ctx.fillStyle = `rgba(249, 115, 22, ${0.7 * alpha})`;
                ctx.beginPath();
                ctx.ellipse(mx, my, 5, 2.5, angle, 0, Math.PI * 2);
                ctx.fill();
                
                // Inner membrane folds
                ctx.strokeStyle = `rgba(251, 146, 60, ${0.5 * alpha})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(mx - 2, my);
                ctx.lineTo(mx + 2, my);
                ctx.stroke();
            }
        }

        // Chloroplasts
        if (e.hasChloroplast) {
            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI + Math.PI / 6 + world.time * 0.004;
                const r = e.radius * 0.55;
                const cx = e.x + Math.cos(angle) * r;
                const cy = e.y + Math.sin(angle) * r;
                
                ctx.fillStyle = `rgba(34, 197, 94, ${0.6 * alpha})`;
                ctx.beginPath();
                ctx.ellipse(cx, cy, 6, 3.5, angle, 0, Math.PI * 2);
                ctx.fill();
                
                // Thylakoid stacks
                ctx.strokeStyle = `rgba(74, 222, 128, ${0.4 * alpha})`;
                ctx.lineWidth = 0.5;
                for (let j = -1; j <= 1; j++) {
                    ctx.beginPath();
                    ctx.moveTo(cx - 3 + j, cy - 1);
                    ctx.lineTo(cx + 3 + j, cy - 1);
                    ctx.stroke();
                }
            }
        }

        // Label
        if (e.isAlive && zoom > 0.5) {
            ctx.font = 'bold 10px system-ui';
            ctx.textAlign = 'center';
            ctx.fillStyle = `${speciesColor}`;
            ctx.fillText(e.name, e.x, e.y - e.radius - 8);
            
            const icons: string[] = [];
            if (e.hasMitochondria) icons.push('⚡');
            if (e.hasChloroplast) icons.push('☀️');
            if (icons.length > 0) {
                ctx.font = '9px sans-serif';
                ctx.fillText(icons.join(''), e.x, e.y - e.radius - 20);
            }
        }
    }

    ctx.restore();
}

function renderColonies(ctx: CanvasRenderingContext2D, engine: SimulationEngine, camera: { x: number; y: number; zoom: number }) {
    const { zoom } = camera;
    const offsetX = camera.x - (CANVAS_WIDTH / 2) / zoom;
    const offsetY = camera.y - (CANVAS_HEIGHT / 2) / zoom;

    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(-offsetX, -offsetY);

    for (const colony of engine.colonies) {
        const borderColor = colony.isMulticellular ? PALETTE.multicellular : PALETTE.colony;
        
        // Colony boundary glow
        const boundGrad = ctx.createRadialGradient(colony.x, colony.y, colony.radius * 0.5, colony.x, colony.y, colony.radius * 1.3);
        boundGrad.addColorStop(0, 'rgba(0,0,0,0)');
        boundGrad.addColorStop(0.7, `${borderColor}15`);
        boundGrad.addColorStop(1, `${borderColor}08`);
        ctx.fillStyle = boundGrad;
        ctx.beginPath(); ctx.arc(colony.x, colony.y, colony.radius * 1.3, 0, Math.PI * 2); ctx.fill();

        // Boundary line
        ctx.strokeStyle = borderColor + '60';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 5]);
        ctx.beginPath(); ctx.arc(colony.x, colony.y, colony.radius, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);

        // Inter-cell connections
        const memberArray = Array.from(colony.members.values());
        ctx.strokeStyle = borderColor + '35';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < memberArray.length; i++) {
            const m1 = engine.organismMap.get(memberArray[i].organismId);
            if (!m1 || !m1.isAlive) continue;
            
            for (let j = i + 1; j < memberArray.length; j++) {
                const m2 = engine.organismMap.get(memberArray[j].organismId);
                if (!m2 || !m2.isAlive) continue;
                
                const dist = toroidalDistance(m1.x, m1.y, m2.x, m2.y, engine.world.width, engine.world.height);
                if (dist < colony.radius * 1.2) {
                    ctx.beginPath();
                    ctx.moveTo(m1.x, m1.y);
                    const dx = wrapDelta(m2.x - m1.x, engine.world.width);
                    const dy = wrapDelta(m2.y - m1.y, engine.world.height);
                    ctx.lineTo(m1.x + dx, m1.y + dy);
                    ctx.stroke();
                }
            }
        }

        // Role indicators on cells
        if (zoom > 0.5) {
            for (const [id, member] of colony.members) {
                const org = engine.organismMap.get(id);
                if (!org || !org.isAlive) continue;
                
                if (member.role !== 'stem') {
                    const roleInfo = CELL_ROLE_INFO[member.role];
                    ctx.fillStyle = roleInfo.color + 'dd';
                    ctx.font = 'bold 10px system-ui';
                    ctx.textAlign = 'center';
                    ctx.fillText(roleInfo.symbol, org.x, org.y + org.radius + 12);
                }
            }
        }

        // Colony label
        if (zoom > 0.4) {
            ctx.font = 'bold 11px system-ui';
            ctx.textAlign = 'center';
            ctx.fillStyle = borderColor;
            
            const label = colony.isMulticellular 
                ? `🌿 Multicellular (${colony.cellCount})`
                : `🔗 Colony (${colony.cellCount})`;
            ctx.fillText(label, colony.x, colony.y - colony.radius - 12);
            
            if (colony.differentiationLevel > 0) {
                ctx.font = '9px system-ui';
                ctx.fillStyle = PALETTE.uiText;
                ctx.fillText(`${Math.round(colony.differentiationLevel * 100)}% specialized`, colony.x, colony.y - colony.radius);
            }
            
            if (colony.hasNervousSystem) {
                ctx.font = '9px system-ui';
                ctx.fillStyle = PALETTE.uiHighlight;
                ctx.fillText('⚡ Neural Network', colony.x, colony.y - colony.radius + 12);
            }
        }
    }

    ctx.restore();
}

function renderUI(ctx: CanvasRenderingContext2D, engine: SimulationEngine) {
    const { world, stats, milestones, species, eventHistory, viewMode } = engine;
    const W = CANVAS_WIDTH, H = CANVAS_HEIGHT;

    // Main info panel
    const panelW = 265, panelH = 230;
    drawRoundedRect(ctx, 10, 10, panelW, panelH, 8);
    ctx.fillStyle = PALETTE.uiBg;
    ctx.fill();
    ctx.strokeStyle = PALETTE.uiBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Phase header
    ctx.font = 'bold 13px system-ui';
    ctx.textAlign = 'left';
    const phaseColor = ['luca_emergence', 'multicellular', 'eukaryotes', 'cambrian_explosion'].includes(world.phase) 
        ? PALETTE.uiSuccess : PALETTE.uiHighlight;
    ctx.fillStyle = phaseColor;
    ctx.fillText(PHASE_LABELS[world.phase] || world.phase, 20, 32);
    
    ctx.font = '9px system-ui';
    ctx.fillStyle = PALETTE.uiText;
    ctx.fillText(PHASE_DESCRIPTIONS[world.phase] || '', 20, 46);

    // Catastrophe warning
    let yOffset = 0;
    if (world.activeCatastrophe) {
        const catConfig = CATASTROPHE_CONFIG[world.activeCatastrophe.type];
        const progress = (world.time - world.activeCatastrophe.startTime) / world.activeCatastrophe.duration;
        
        ctx.fillStyle = PALETTE.uiDanger;
        ctx.font = 'bold 10px system-ui';
        ctx.fillText(`${catConfig.icon} ${catConfig.name}`, 20, 62);
        
        // Progress bar
        const barW = 80;
        ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
        ctx.fillRect(120, 56, barW, 6);
        ctx.fillStyle = PALETTE.uiDanger;
        ctx.fillRect(120, 56, barW * progress, 6);
        
        yOffset = 18;
    }

    // Stats
    ctx.font = '10px system-ui';
    let y = 62 + yOffset;
    const col1 = 20, col2 = 145;

    ctx.fillStyle = PALETTE.uiText;
    ctx.fillText(`Time: ${Math.floor(world.time / 60)}s`, col1, y);
    ctx.fillText(`View: ${viewMode}`, col2, y);
    y += 16;

    ctx.fillText(`Molecules: ${engine.molecules.length}`, col1, y);
    ctx.fillText(`Bonds: ${engine.bonds.length}`, col2, y);
    y += 16;

    ctx.fillStyle = PALETTE.prokaryote;
    ctx.fillText(`Prokaryotes: ${stats.prokaryoteCount}`, col1, y);
    ctx.fillStyle = PALETTE.eukaryote;
    ctx.fillText(`Eukaryotes: ${stats.eukaryoteCount}`, col2, y);
    y += 16;

    ctx.fillStyle = PALETTE.colony;
    ctx.fillText(`Colonies: ${stats.colonyCount}`, col1, y);
    ctx.fillStyle = PALETTE.uiSuccess;
    ctx.fillText(`Species: ${stats.livingSpeciesCount}/${stats.speciesCount}`, col2, y);
    y += 16;

    ctx.fillStyle = PALETTE.uiText;
    ctx.fillText(`Generation: ${stats.maxGeneration}`, col1, y);
    ctx.fillText(`Born: ${stats.totalBorn}`, col2, y);
    y += 16;

    ctx.fillText(`Deaths: ${stats.totalDeaths}`, col1, y);
    if (stats.predationEvents > 0) {
        ctx.fillStyle = PALETTE.uiDanger;
        ctx.fillText(`Predation: ${stats.predationEvents}`, col2, y);
    }
    y += 16;

    if (stats.sexualReproductionEvents > 0) {
        ctx.fillStyle = '#ec4899';
        ctx.fillText(`Sexual: ${stats.sexualReproductionEvents}`, col1, y);
    }
    if (stats.endosymbiosisEvents > 0) {
        ctx.fillStyle = PALETTE.uiSuccess;
        ctx.fillText(`Endosymb: ${stats.endosymbiosisEvents}`, col2, y);
    }

    // Milestones panel
    const achievedMilestones = milestones.filter(m => m.achieved);
    if (achievedMilestones.length > 0) {
        const mPanelW = 210, mPanelH = Math.min(190, 28 + achievedMilestones.length * 16);
        const mPanelX = W - mPanelW - 10;
        
        drawRoundedRect(ctx, mPanelX, 10, mPanelW, mPanelH, 8);
        ctx.fillStyle = PALETTE.uiBg;
        ctx.fill();
        ctx.strokeStyle = PALETTE.uiBorder;
        ctx.stroke();

        ctx.font = 'bold 10px system-ui';
        ctx.fillStyle = PALETTE.uiTextBright;
        ctx.textAlign = 'left';
        ctx.fillText('🏆 Milestones', mPanelX + 12, 30);

        ctx.font = '9px system-ui';
        let my = 48;
        for (const m of achievedMilestones.slice(-10)) {
            ctx.fillStyle = PALETTE.uiSuccess;
            ctx.fillText(`${m.icon} ${m.name}`, mPanelX + 12, my);
            my += 16;
        }
    }

    // Species panel
    if (stats.speciesCount > 0) {
        const sPanelW = 190, sPanelH = Math.min(160, 30 + stats.livingSpeciesCount * 20);
        const sPanelX = W - sPanelW - 10;
        const sPanelY = achievedMilestones.length > 0 ? Math.min(220, 28 + achievedMilestones.length * 16) + 20 : 10;
        
        drawRoundedRect(ctx, sPanelX, sPanelY, sPanelW, sPanelH, 8);
        ctx.fillStyle = PALETTE.uiBg;
        ctx.fill();
        ctx.strokeStyle = PALETTE.uiBorder;
        ctx.stroke();

        ctx.font = 'bold 10px system-ui';
        ctx.fillStyle = PALETTE.uiTextBright;
        ctx.textAlign = 'left';
        ctx.fillText('🌿 Species', sPanelX + 12, sPanelY + 20);

        ctx.font = '9px system-ui';
        let sy = sPanelY + 40;
        const livingSpecies = Array.from(species.values()).filter(s => !s.extinctAt).slice(0, 6);
        for (const s of livingSpecies) {
            ctx.fillStyle = s.color;
            ctx.beginPath(); ctx.arc(sPanelX + 20, sy - 4, 6, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = PALETTE.uiText;
            ctx.fillText(`${s.name} (${s.memberCount})`, sPanelX + 32, sy);
            sy += 20;
        }
    }

    // Event timeline (bottom left)
    if (eventHistory.length > 0) {
        const tPanelW = 300, tPanelH = 90;
        const tPanelX = 10, tPanelY = H - tPanelH - 10;
        
        drawRoundedRect(ctx, tPanelX, tPanelY, tPanelW, tPanelH, 8);
        ctx.fillStyle = PALETTE.uiBg;
        ctx.fill();
        ctx.strokeStyle = PALETTE.uiBorder;
        ctx.stroke();

        ctx.font = 'bold 10px system-ui';
        ctx.fillStyle = PALETTE.uiTextBright;
        ctx.textAlign = 'left';
        ctx.fillText('📜 Recent Events', tPanelX + 12, tPanelY + 18);

        ctx.font = '9px system-ui';
        let ty = tPanelY + 36;
        const recentEvents = eventHistory.slice(-4);
        for (const event of recentEvents) {
            ctx.fillStyle = event.type === 'catastrophe' ? PALETTE.uiDanger : 
                           event.type === 'speciation' ? PALETTE.uiSuccess :
                           event.type === 'extinction' ? '#6b7280' : PALETTE.uiHighlight;
            ctx.fillText(`${event.icon} ${event.title}`, tPanelX + 12, ty);
            ty += 14;
        }
    }

    // Legend (bottom center)
    if (viewMode === 'molecular' || !engine.lucaBorn) {
        const legendW = 520, legendH = 40;
        const legendX = (W - legendW) / 2, legendY = H - legendH - 10;
        
        drawRoundedRect(ctx, legendX, legendY, legendW, legendH, 8);
        ctx.fillStyle = PALETTE.uiBg;
        ctx.fill();
        ctx.strokeStyle = PALETTE.uiBorder;
        ctx.stroke();

        ctx.font = '9px system-ui';
        ctx.textAlign = 'left';
        let lx = legendX + 18;

        // Key molecule counts with icons
        const counts = engine.moleculeCounts;
        const showTypes: MoleculeType[] = ['amino_acid', 'nucleotide', 'lipid', 'peptide', 'rna_fragment'];
        
        for (const type of showTypes) {
            const info = MOLECULE_INFO[type];
            if (!info) continue;
            const count = counts.get(type) || 0;
            
            // Color dot
            ctx.fillStyle = info.color;
            ctx.beginPath(); ctx.arc(lx, legendY + 20, 5, 0, Math.PI * 2); ctx.fill();
            
            // Label and count
            ctx.fillStyle = PALETTE.uiText;
            ctx.fillText(`${info.label}: ${count}`, lx + 10, legendY + 23);
            lx += 100;
        }
    }
}

function renderSimulation(ctx: CanvasRenderingContext2D, engine: SimulationEngine) {
    const camera = engine.camera;
    
    renderBackground(ctx, engine, camera);
    
    if (engine.viewMode === 'molecular' || !engine.lucaBorn) {
        renderMolecules(ctx, engine, camera);
    }
    
    renderProtoCells(ctx, engine, camera);
    renderLUCA(ctx, engine, camera);
    renderOrganisms(ctx, engine, camera);
    renderColonies(ctx, engine, camera);
    renderUI(ctx, engine);
}

// ==================== MAIN COMPONENT ====================

export default function EvolutionSimulation({ isRunning, speed }: EvolutionSimProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<SimulationEngine | null>(null);
    const animationRef = useRef<number | null>(null);
    const [, forceUpdate] = useState(0);

    // Handle mouse wheel for zoom
    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        if (!engineRef.current) return;
        const engine = engineRef.current;
        const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
        engine.camera.targetZoom = Math.max(0.25, Math.min(3.5, engine.camera.zoom * zoomDelta));
    }, []);

    // Handle mouse drag for pan
    const isDragging = useRef(false);
    const lastMouse = useRef({ x: 0, y: 0 });

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        isDragging.current = true;
        lastMouse.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging.current || !engineRef.current) return;
        const engine = engineRef.current;
        const dx = e.clientX - lastMouse.current.x;
        const dy = e.clientY - lastMouse.current.y;
        engine.camera.targetX -= dx / engine.camera.zoom;
        engine.camera.targetY -= dy / engine.camera.zoom;
        lastMouse.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        if (!engineRef.current) {
            engineRef.current = new SimulationEngine();
            initFlowParticles();
        }
        const engine = engineRef.current;
        
        canvas.addEventListener('wheel', handleWheel, { passive: false });
        
        const animate = () => {
            if (isRunning) {
                for (let i = 0; i < speed; i++) {
                    engine.update();
                }
            }
            
            // Smooth camera interpolation
            engine.camera.x += (engine.camera.targetX - engine.camera.x) * 0.08;
            engine.camera.y += (engine.camera.targetY - engine.camera.y) * 0.08;
            engine.camera.zoom += (engine.camera.targetZoom - engine.camera.zoom) * 0.1;
            
            // Clamp camera to world bounds
            engine.camera.targetX = Math.max(0, Math.min(WORLD_WIDTH, engine.camera.targetX));
            engine.camera.targetY = Math.max(0, Math.min(WORLD_HEIGHT, engine.camera.targetY));
            
            renderSimulation(ctx, engine);
            animationRef.current = requestAnimationFrame(animate);
        };
        animate();
        
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            canvas.removeEventListener('wheel', handleWheel);
        };
    }, [isRunning, speed, handleWheel]);

    return (
        <div style={{ 
            width: '100%', 
            height: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#020306',
            padding: '10px',
            boxSizing: 'border-box',
            userSelect: 'none',
        }}>
            <canvas 
                ref={canvasRef} 
                width={CANVAS_WIDTH} 
                height={CANVAS_HEIGHT}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ 
                    display: 'block', 
                    maxWidth: '100%', 
                    height: 'auto',
                    borderRadius: '12px',
                    boxShadow: '0 12px 50px rgba(0, 0, 0, 0.9)',
                    cursor: isDragging.current ? 'grabbing' : 'grab',
                }}
            />
            <div style={{
                marginTop: '14px',
                color: '#64748b',
                fontSize: '11px',
                fontFamily: 'system-ui',
                textAlign: 'center',
                display: 'flex',
                gap: '24px',
                alignItems: 'center',
            }}>
                <span>🧬 Abiogenesis → LUCA → Speciation → Multicellular Life</span>
                <span style={{ color: '#374151' }}>|</span>
                <span>🖱️ Scroll to zoom • Drag to pan</span>
            </div>
        </div>
    );
}