import React, { useEffect, useRef, useState } from 'react';

// Import all the logic and config
import {
    PrimordialWorld,
    Molecule,
    ProtoCell,
    LUCAEntity,
    OrganismEntity,
    SimulationEngine,
    wrapDelta,
} from './phylogeny.logic';

import { COLORS } from './phylogeny.config';

interface PhylogenySimProps {
    isRunning: boolean;
    speed: number;
}

function renderSimulation(ctx: CanvasRenderingContext2D, engine: SimulationEngine) {
    const world = engine.world;

    // Realistic dark ocean background with subtle gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, world.height);
    bgGradient.addColorStop(0, '#0d1117');
    bgGradient.addColorStop(1, '#161b22');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, world.width, world.height);

    // Subtle energy/heat field - more realistic thermal gradient
    const gridRows = Math.ceil(world.height / 30);
    const gridCols = Math.ceil(world.width / 30);
    for (let y = 0; y < Math.min(gridRows, world.energyField.length); y++) {
        for (let x = 0; x < Math.min(gridCols, world.energyField[y]?.length || 0); x++) {
            const energy = world.energyField[y][x];
            const alpha = (energy / 100) * 0.05; // Much more subtle
            const heat = Math.floor(energy * 1.5); // Warmer = more red/orange
            ctx.fillStyle = `rgba(${heat}, ${heat * 0.4}, ${heat * 0.1}, ${alpha})`;
            ctx.fillRect(x * 30, y * 30, 30, 30);
        }
    }

    // Realistic hydrothermal vents - thermal plumes
    for (const vent of world.vents) {
        const pulse = Math.sin(world.time * 0.05 + vent.phase) * 0.15 + 0.85;

        // Heat shimmer effect - subtle
        for (let ring = 0; ring < 4; ring++) {
            const radius = 25 + ring * 20;
            const alpha = (0.08 - ring * 0.015) * pulse;
            const gradient = ctx.createRadialGradient(vent.x, vent.y, 0, vent.x, vent.y, radius);
            gradient.addColorStop(0, `rgba(255, 80, 20, ${alpha})`);
            gradient.addColorStop(0.6, `rgba(180, 60, 10, ${alpha * 0.5})`);
            gradient.addColorStop(1, 'rgba(100, 40, 5, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(vent.x, vent.y, radius * pulse, 0, Math.PI * 2);
            ctx.fill();
        }

        // Vent opening - dark with hot center
        ctx.fillStyle = 'rgba(20, 15, 10, 0.9)';
        ctx.beginPath();
        ctx.arc(vent.x, vent.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = `rgba(255, 100, 30, ${0.6 * pulse})`;
        ctx.beginPath();
        ctx.arc(vent.x, vent.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Realistic mineral deposits and rock formations
    for (const rock of world.rocks) {
        const baseAlpha = rock.type === 'chimney' ? 0.35 : rock.type === 'ridge' ? 0.28 : 0.22;
        
        // Rock body - mineral gray-brown
        ctx.fillStyle = `rgba(65, 60, 55, ${baseAlpha})`;
        ctx.beginPath();
        ctx.arc(rock.x, rock.y, rock.radius, 0, Math.PI * 2);
        ctx.fill();

        // Mineral deposits on surface
        if (rock.roughness > 0.5) {
            ctx.fillStyle = `rgba(85, 75, 65, ${baseAlpha * 0.6})`;
            for (let i = 0; i < 3; i++) {
                const angle = (rock.x + rock.y + i) * 0.7;
                const offset = rock.radius * 0.4;
                ctx.beginPath();
                ctx.arc(
                    rock.x + Math.cos(angle) * offset,
                    rock.y + Math.sin(angle) * offset,
                    rock.radius * (0.2 + i * 0.1),
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }

        // Subtle edge highlight for depth
        ctx.strokeStyle = `rgba(90, 85, 75, ${baseAlpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(rock.x, rock.y, rock.radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Chemical bonds - subtle realistic connections
    for (const bond of engine.bonds) {
        const mol1 = engine.moleculeMap.get(bond.mol1);
        const mol2 = engine.moleculeMap.get(bond.mol2);
        if (mol1 && mol2) {
            const dx = wrapDelta(mol2.x - mol1.x, world.width);
            const dy = wrapDelta(mol2.y - mol1.y, world.height);
            
            // Bond opacity based on complexity and type
            let alpha = 0.15;
            if (bond.type === 'covalent') alpha = 0.25;
            else if (bond.type === 'hydrogen') alpha = 0.12;
            
            ctx.strokeStyle = `rgba(180, 180, 200, ${alpha})`;
            ctx.lineWidth = bond.type === 'covalent' ? 1.5 : 1;
            ctx.beginPath();
            ctx.moveTo(mol1.x, mol1.y);
            ctx.lineTo(mol1.x + dx, mol1.y + dy);
            ctx.stroke();
        }
    }

    // Realistic molecules - opacity increases with complexity
    if (!engine.lucaBorn) {
        engine.molecules.forEach((m) => {
            // Calculate opacity based on complexity and bonding
            const baseOpacity = m.complexity === 1 ? 0.08 : m.complexity === 2 ? 0.25 : 0.45;
            const bondBonus = Math.min(m.bondedTo.size * 0.08, 0.3);
            const finalOpacity = baseOpacity + bondBonus;
            
            // Realistic molecular colors - muted scientific palette
            let color = 'rgba(180, 180, 190, '; // Default gray
            if (m.type === 'amino_acid') color = 'rgba(200, 140, 160, ';
            else if (m.type === 'nucleotide') color = 'rgba(140, 150, 200, ';
            else if (m.type === 'lipid') color = 'rgba(220, 180, 120, ';
            else if (m.type === 'peptide') color = 'rgba(180, 100, 140, ';
            else if (m.type === 'rna_fragment') color = 'rgba(120, 110, 180, ';
            else if (m.type === 'membrane_vesicle') color = 'rgba(200, 160, 100, ';
            
            // Main molecule body
            ctx.fillStyle = color + finalOpacity + ')';
            ctx.beginPath();
            ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
            ctx.fill();

            // Very subtle edge for complex molecules
            if (m.complexity >= 2) {
                ctx.strokeStyle = color + (finalOpacity * 0.6) + ')';
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }

            // Tiny label for complex polymers only
            if (m.complexity === 3 && m.radius > 4) {
                ctx.fillStyle = `rgba(230, 230, 240, ${finalOpacity * 1.5})`;
                ctx.font = 'bold 6px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(m.symbol, m.x, m.y);
            }
        });
    }

    // Protocells - realistic lipid vesicles
    engine.protoCells.forEach((p) => {
        const stability = p.stability / 100;
        
        // Inner cytoplasm - subtle
        ctx.fillStyle = `rgba(100, 95, 110, ${0.08 * stability})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius - 3, 0, Math.PI * 2);
        ctx.fill();

        // Lipid bilayer membrane
        if (p.hasMembrane) {
            // Outer leaflet
            ctx.strokeStyle = `rgba(200, 160, 100, ${0.4 + stability * 0.3})`;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Inner leaflet
            ctx.strokeStyle = `rgba(180, 140, 85, ${0.3 + stability * 0.2})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius - 2, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            // Forming membrane - dashed and faint
            ctx.strokeStyle = `rgba(200, 160, 100, ${0.2 + stability * 0.15})`;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Internal structures indicators - very subtle
        if (p.hasMetabolism) {
            ctx.fillStyle = `rgba(180, 100, 140, ${0.15 * stability})`;
            for (let i = 0; i < 4; i++) {
                const angle = (p.age * 0.02 + i * Math.PI / 2);
                const r = p.radius * 0.4;
                ctx.beginPath();
                ctx.arc(p.x + Math.cos(angle) * r, p.y + Math.sin(angle) * r, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        if (p.canReplicate) {
            // RNA strands - thin lines
            ctx.strokeStyle = `rgba(120, 110, 180, ${0.25 * stability})`;
            ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                const y = p.y - 6 + i * 6;
                ctx.beginPath();
                ctx.moveTo(p.x - 8, y);
                ctx.lineTo(p.x + 8, y);
                ctx.stroke();
            }
        }

        // Minimal labels - scientific notation
        ctx.font = '9px system-ui';
        ctx.textAlign = 'center';
        const labelY = p.y - p.radius - 8;
        
        let label = 'Vesicle';
        if (p.hasMembrane && p.hasMetabolism && p.canReplicate) label = 'Protocell';
        else if (p.hasMembrane) label = 'Liposome';
        
        // Subtle text background
        const metrics = ctx.measureText(label);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(p.x - metrics.width / 2 - 3, labelY - 8, metrics.width + 6, 12);
        
        ctx.fillStyle = `rgba(200, 200, 210, ${0.6 + stability * 0.4})`;
        ctx.fillText(label, p.x, labelY);
    });

    // LUCA - realistic primitive cell
    if (engine.luca && engine.luca.isAlive) {
        const luca = engine.luca;

        // Subtle aura - very minimal
        const auraGradient = ctx.createRadialGradient(luca.x, luca.y, 0, luca.x, luca.y, luca.radius * 2);
        auraGradient.addColorStop(0, 'rgba(220, 200, 140, 0.12)');
        auraGradient.addColorStop(1, 'rgba(220, 200, 140, 0)');
        ctx.fillStyle = auraGradient;
        ctx.beginPath();
        ctx.arc(luca.x, luca.y, luca.radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Cell cytoplasm
        ctx.fillStyle = 'rgba(130, 120, 110, 0.4)';
        ctx.beginPath();
        ctx.arc(luca.x, luca.y, luca.radius, 0, Math.PI * 2);
        ctx.fill();

        // Cell membrane - double layer
        ctx.strokeStyle = 'rgba(200, 170, 120, 0.7)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(luca.x, luca.y, luca.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.strokeStyle = 'rgba(180, 150, 100, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(luca.x, luca.y, luca.radius - 2, 0, Math.PI * 2);
        ctx.stroke();

        // Internal structures - nucleoid region
        ctx.fillStyle = 'rgba(120, 110, 150, 0.3)';
        ctx.beginPath();
        ctx.arc(luca.x, luca.y, luca.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Ribosomes - tiny dots scattered
        ctx.fillStyle = 'rgba(140, 130, 160, 0.4)';
        for (let i = 0; i < 12; i++) {
            const angle = (world.time * 0.005 + i * Math.PI / 6);
            const r = luca.radius * (0.4 + (i % 3) * 0.15);
            ctx.beginPath();
            ctx.arc(luca.x + Math.cos(angle) * r, luca.y + Math.sin(angle) * r, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Label - scientific
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'center';
        const titleY = luca.y - luca.radius - 20;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        const titleMetrics = ctx.measureText('LUCA');
        ctx.fillRect(luca.x - titleMetrics.width / 2 - 4, titleY - 10, titleMetrics.width + 8, 16);
        
        ctx.fillStyle = 'rgba(220, 200, 140, 0.95)';
        ctx.fillText('LUCA', luca.x, titleY);

        ctx.font = '8px system-ui';
        ctx.fillStyle = 'rgba(180, 180, 190, 0.8)';
        ctx.fillText('Last Universal Common Ancestor', luca.x, titleY + 14);
    }

    // Organisms - realistic cellular life
    engine.organisms.forEach((o) => {
        if (!o.isAlive) {
            // Dead cell debris
            ctx.fillStyle = 'rgba(80, 75, 70, 0.2)';
            ctx.beginPath();
            ctx.arc(o.x, o.y, o.radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        // Extract HSL values from trait color for realistic rendering
        const energy = Math.min(100, o.energy);
        const vitalityAlpha = 0.2 + (energy / 100) * 0.25;

        // Cell body - semi-transparent
        ctx.fillStyle = o.traits.color.replace(')', `, ${vitalityAlpha})`).replace('hsl', 'hsla');
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
        ctx.fill();

        // Cell membrane
        const membraneAlpha = 0.4 + (energy / 150) * 0.3;
        ctx.strokeStyle = o.traits.color.replace(')', `, ${membraneAlpha})`).replace('hsl', 'hsla');
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner membrane
        ctx.strokeStyle = o.traits.color.replace(')', `, ${membraneAlpha * 0.6})`).replace('hsl', 'hsla');
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.radius - 1.5, 0, Math.PI * 2);
        ctx.stroke();

        // Genetic material - nucleoid
        ctx.fillStyle = o.traits.color.replace(')', `, ${vitalityAlpha * 1.2})`).replace('hsl', 'hsla');
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Minimal ID label
        if (o.radius > 10) {
            ctx.font = `${Math.max(7, o.radius * 0.45)}px system-ui`;
            ctx.textAlign = 'center';
            const labelY = o.y - o.radius - 6;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            const metrics = ctx.measureText(o.name);
            ctx.fillRect(o.x - metrics.width / 2 - 2, labelY - 7, metrics.width + 4, 10);
            
            ctx.fillStyle = `rgba(220, 220, 230, ${0.6 + vitalityAlpha})`;
            ctx.fillText(o.name, o.x, labelY);
        }
    });

    // Scientific UI overlay - minimal and realistic
    ctx.fillStyle = 'rgba(15, 20, 25, 0.85)';
    ctx.fillRect(10, 10, 280, 130);
    
    ctx.strokeStyle = 'rgba(80, 90, 100, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 280, 130);

    ctx.font = '11px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(180, 190, 200, 0.9)';
    
    const phaseLabel = world.phase.replace(/_/g, ' ');
    ctx.fillText(`Phase: ${phaseLabel}`, 20, 28);
    ctx.fillText(`t = ${Math.floor(world.time / 60)}s`, 20, 46);
    ctx.fillText(`T = ${world.temperature.toFixed(1)}°C`, 20, 64);
    
    ctx.fillStyle = 'rgba(160, 170, 180, 0.85)';
    ctx.fillText(`Molecules: ${engine.molecules.length}`, 20, 82);
    ctx.fillText(`Bonds: ${engine.bonds.length}`, 160, 82);
    ctx.fillText(`Protocells: ${engine.protoCells.length}`, 20, 100);
    
    if (engine.lucaBorn) {
        ctx.fillStyle = 'rgba(220, 200, 140, 0.95)';
        ctx.fillText(`✓ LUCA emerged`, 20, 118);
    }
    
    if (engine.organisms.length > 0) {
        ctx.fillStyle = 'rgba(160, 170, 180, 0.85)';
        ctx.fillText(`Organisms: ${engine.organisms.length}`, 160, 100);
        ctx.fillText(`Max Gen: ${engine.maxGeneration}`, 160, 118);
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

        // Initialize engine if not already created
        if (!engineRef.current) {
            engineRef.current = new SimulationEngine();
        }

        const engine = engineRef.current;

        // Animation loop
        const animate = () => {
            if (isRunning) {
                // Update simulation with speed multiplier
                for (let i = 0; i < speed; i++) {
                    engine.update();
                }
                
                // Render the simulation
                renderSimulation(ctx, engine);
            } else {
                // Still render when paused, just don't update
                renderSimulation(ctx, engine);
            }
            
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        // Cleanup
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
            backgroundColor: '#0d1117',
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
                    border: '1px solid #30363d',
                    borderRadius: '4px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)'
                }}
            />
            <div style={{
                marginTop: '20px',
                color: '#94a3b8',
                fontSize: '13px',
                fontFamily: 'system-ui',
                textAlign: 'center',
                maxWidth: '800px'
            }}>
                Scientific visualization of abiogenesis and LUCA emergence in a primordial hydrothermal vent environment.
                <br/>
                Molecular opacity increases with complexity and bonding density.
            </div>
        </div>
    );
}