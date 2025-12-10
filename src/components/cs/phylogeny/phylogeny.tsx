import React, { useEffect, useRef } from 'react';
import { SimulationEngine, wrapDelta } from './phylogeny.logic';
import { MOLECULE_INFO, PHASE_LABELS, MoleculeType } from './phylogeny.config';

interface PhylogenySimProps {
    isRunning: boolean;
    speed: number;
}

// Clean color palette
const PALETTE = {
    bgDeep: '#0a0e14',
    bgMid: '#0f1419',
    gridLine: 'rgba(40, 60, 80, 0.25)',
    
    ventCore: '#ff6b35',
    ventGlow: '#ff9f1c',
    ventPlume: '#ffbe0b',
    
    aminoAcid: '#ec4899',
    nucleotide: '#8b5cf6',
    lipid: '#facc15',
    sugar: '#6bcb77',
    peptide: '#db2777',
    rnaFragment: '#7c3aed',
    simple: '#64748b',
    
    membrane: '#facc15',
    luca: '#f72585',
    lucaGlow: 'rgba(247, 37, 133, 0.3)',
    
    uiBg: 'rgba(10, 14, 20, 0.95)',
    uiBorder: 'rgba(64, 100, 140, 0.4)',
    uiText: '#94a3b8',
    uiTextBright: '#e2e8f0',
    uiHighlight: '#00d4ff',
    uiWarn: '#ff6b35',
    uiSuccess: '#22c55e',
};

const MOLECULE_COLORS: Record<string, string> = {
    water: '#60a5fa',
    carbon: '#78716c',
    nitrogen: '#93c5fd',
    oxygen: '#ef4444',
    amino_acid: '#ec4899',
    nucleotide: '#8b5cf6',
    lipid: '#facc15',
    sugar: '#86efac',
    peptide: '#db2777',
    rna_fragment: '#7c3aed',
    membrane_vesicle: '#f59e0b',
};

function renderSimulation(ctx: CanvasRenderingContext2D, engine: SimulationEngine) {
    const world = engine.world;
    const W = world.width;
    const H = world.height;

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, PALETTE.bgDeep);
    bgGrad.addColorStop(1, PALETTE.bgMid);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle grid
    ctx.strokeStyle = PALETTE.gridLine;
    ctx.lineWidth = 0.5;
    const gridSize = 80;
    for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
    }
    for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
    }

    // Floating particles
    ctx.fillStyle = 'rgba(100, 140, 180, 0.12)';
    for (let i = 0; i < 30; i++) {
        const x = (i * 137.5 + world.time * 0.02) % W;
        const y = (i * 89.3 + world.time * 0.015) % H;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
    }

    // Rocks (simplified)
    for (const rock of world.rocks) {
        ctx.fillStyle = 'rgba(30, 40, 50, 0.5)';
        ctx.strokeStyle = 'rgba(50, 65, 80, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(rock.x, rock.y, rock.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    // Hydrothermal vents
    for (const vent of world.vents) {
        const pulse = 0.85 + Math.sin(world.time * 0.08 + vent.phase) * 0.15;

        // Glow
        const glowGrad = ctx.createRadialGradient(vent.x, vent.y, 0, vent.x, vent.y, 90);
        glowGrad.addColorStop(0, `rgba(255, 159, 28, ${0.18 * pulse})`);
        glowGrad.addColorStop(0.5, `rgba(255, 107, 53, ${0.08 * pulse})`);
        glowGrad.addColorStop(1, 'rgba(255, 107, 53, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(vent.x, vent.y, 90, 0, Math.PI * 2);
        ctx.fill();

        // Plume particles
        for (let i = 0; i < 15; i++) {
            const age = ((world.time * 0.05 + i * 0.15) % 1);
            const spread = age * 35;
            const angle = (i / 15) * Math.PI * 2 + world.time * 0.02;
            const px = vent.x + Math.cos(angle) * spread;
            const py = vent.y + Math.sin(angle) * spread;
            const alpha = (1 - age) * 0.5 * pulse;
            const size = (1 - age * 0.5) * 2.5;
            
            ctx.fillStyle = `rgba(255, 190, 11, ${alpha})`;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Core
        const coreGrad = ctx.createRadialGradient(vent.x, vent.y, 0, vent.x, vent.y, 16);
        coreGrad.addColorStop(0, `rgba(255, 255, 200, ${0.9 * pulse})`);
        coreGrad.addColorStop(0.4, `rgba(255, 159, 28, ${0.7 * pulse})`);
        coreGrad.addColorStop(1, 'rgba(255, 107, 53, 0)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(vent.x, vent.y, 16, 0, Math.PI * 2);
        ctx.fill();
    }

    // Chemical bonds
    for (const bond of engine.bonds) {
        const mol1 = engine.moleculeMap.get(bond.mol1);
        const mol2 = engine.moleculeMap.get(bond.mol2);
        if (mol1 && mol2) {
            const dx = wrapDelta(mol2.x - mol1.x, W);
            const dy = wrapDelta(mol2.y - mol1.y, H);
            
            const isCovalent = bond.type === 'covalent';
            ctx.strokeStyle = isCovalent 
                ? 'rgba(150, 200, 255, 0.45)' 
                : 'rgba(150, 200, 255, 0.2)';
            ctx.lineWidth = isCovalent ? 1.5 : 1;
            ctx.beginPath();
            ctx.moveTo(mol1.x, mol1.y);
            ctx.lineTo(mol1.x + dx, mol1.y + dy);
            ctx.stroke();
        }
    }

    // Molecules
    if (!engine.lucaBorn) {
        for (const m of engine.molecules) {
            const color = MOLECULE_COLORS[m.type] || PALETTE.simple;
            const baseSize = m.radius * (m.complexity === 1 ? 1 : m.complexity === 2 ? 1.3 : 1.8);
            const bonded = m.bondedTo.size > 0;

            // Glow for complex/bonded
            if (m.complexity > 1 || bonded) {
                const glowGrad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, baseSize * 1.8);
                glowGrad.addColorStop(0, `${color}50`);
                glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = glowGrad;
                ctx.beginPath();
                ctx.arc(m.x, m.y, baseSize * 1.8, 0, Math.PI * 2);
                ctx.fill();
            }

            // Molecule shape based on type
            if (m.type === 'peptide') {
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.beginPath();
                for (let i = 0; i <= 3; i++) {
                    const px = m.x - 8 + i * 5;
                    const py = m.y + (i % 2 === 0 ? -3 : 3);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.stroke();
                
                for (let i = 0; i <= 3; i++) {
                    const px = m.x - 8 + i * 5;
                    const py = m.y + (i % 2 === 0 ? -3 : 3);
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (m.type === 'rna_fragment') {
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.8;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(m.x - 6, m.y + 8);
                ctx.lineTo(m.x - 6, m.y - 3);
                ctx.arc(m.x, m.y - 3, 6, Math.PI, 0, false);
                ctx.lineTo(m.x + 6, m.y + 8);
                ctx.stroke();
            } else if (m.type === 'lipid') {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(m.x, m.y - 4, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(m.x - 1.5, m.y);
                ctx.lineTo(m.x - 1.5, m.y + 8);
                ctx.moveTo(m.x + 1.5, m.y);
                ctx.lineTo(m.x + 1.5, m.y + 8);
                ctx.stroke();
            } else {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(m.x, m.y, baseSize * 0.55, 0, Math.PI * 2);
                ctx.fill();
                
                // Highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
                ctx.beginPath();
                ctx.arc(m.x - baseSize * 0.15, m.y - baseSize * 0.15, baseSize * 0.2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Protocells
    for (const p of engine.protoCells) {
        const stability = p.stability / 100;
        
        // Interior
        ctx.fillStyle = `rgba(255, 217, 61, ${0.06 * stability})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius - 2, 0, Math.PI * 2);
        ctx.fill();

        // Membrane
        if (p.hasMembrane) {
            ctx.strokeStyle = `rgba(255, 217, 61, ${0.65 * stability})`;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Lipid markers
            const lipidCount = 14;
            for (let i = 0; i < lipidCount; i++) {
                const angle = (i / lipidCount) * Math.PI * 2;
                const lx = p.x + Math.cos(angle) * p.radius;
                const ly = p.y + Math.sin(angle) * p.radius;
                ctx.fillStyle = `rgba(255, 217, 61, ${0.85 * stability})`;
                ctx.beginPath();
                ctx.arc(lx, ly, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            ctx.strokeStyle = `rgba(255, 217, 61, ${0.25 * stability})`;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([5, 4]);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Capability indicators
        const indicators: string[] = [];
        if (p.hasMembrane) indicators.push('🧫');
        if (p.hasMetabolism) indicators.push('⚡');
        if (p.canReplicate) indicators.push('🧬');
        
        if (indicators.length > 0) {
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * stability})`;
            ctx.fillText(indicators.join(' '), p.x, p.y - p.radius - 8);
        }

        // Label
        let label = 'Vesicle';
        let labelColor = PALETTE.uiText;
        if (p.hasMembrane && p.hasMetabolism && p.canReplicate) {
            label = '★ Protocell';
            labelColor = PALETTE.uiSuccess;
        } else if (p.hasMembrane) {
            label = 'Liposome';
        }
        
        ctx.font = 'bold 9px system-ui';
        ctx.textAlign = 'center';
        ctx.fillStyle = labelColor;
        ctx.fillText(label, p.x, p.y + p.radius + 12);
        
        // Size indicator
        ctx.font = '8px system-ui';
        ctx.fillStyle = PALETTE.uiText;
        ctx.fillText(`${p.molecules.size} mols`, p.x, p.y + p.radius + 22);
    }

    // LUCA
    if (engine.luca && engine.luca.isAlive) {
        const luca = engine.luca;
        
        // Aura
        const auraGrad = ctx.createRadialGradient(luca.x, luca.y, 0, luca.x, luca.y, luca.radius * 2.5);
        auraGrad.addColorStop(0, 'rgba(247, 37, 133, 0.25)');
        auraGrad.addColorStop(0.5, 'rgba(247, 37, 133, 0.1)');
        auraGrad.addColorStop(1, 'rgba(247, 37, 133, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(luca.x, luca.y, luca.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Pulse ring
        const pulseR = luca.radius * (1.25 + Math.sin(world.time * 0.1) * 0.1);
        ctx.strokeStyle = 'rgba(247, 37, 133, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(luca.x, luca.y, pulseR, 0, Math.PI * 2);
        ctx.stroke();

        // Interior
        const interiorGrad = ctx.createRadialGradient(luca.x, luca.y, 0, luca.x, luca.y, luca.radius);
        interiorGrad.addColorStop(0, 'rgba(247, 37, 133, 0.35)');
        interiorGrad.addColorStop(1, 'rgba(247, 37, 133, 0.15)');
        ctx.fillStyle = interiorGrad;
        ctx.beginPath();
        ctx.arc(luca.x, luca.y, luca.radius, 0, Math.PI * 2);
        ctx.fill();

        // Membrane
        ctx.strokeStyle = PALETTE.luca;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(luca.x, luca.y, luca.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Internal ribosomes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + world.time * 0.02;
            const r = luca.radius * 0.5;
            const rx = luca.x + Math.cos(angle) * r;
            const ry = luca.y + Math.sin(angle) * r;
            ctx.beginPath();
            ctx.arc(rx, ry, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Label
        ctx.font = 'bold 13px system-ui';
        ctx.textAlign = 'center';
        ctx.fillStyle = PALETTE.luca;
        ctx.fillText('★ LUCA ★', luca.x, luca.y - luca.radius - 16);
        ctx.font = '9px system-ui';
        ctx.fillStyle = PALETTE.uiText;
        ctx.fillText('Last Universal Common Ancestor', luca.x, luca.y - luca.radius - 4);
    }

    // Organisms
    for (const o of engine.organisms) {
        if (!o.isAlive) {
            ctx.fillStyle = 'rgba(80, 80, 90, 0.25)';
            ctx.beginPath();
            ctx.arc(o.x, o.y, o.radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
            continue;
        }

        const energy = Math.min(100, o.energy) / 100;
        
        // Glow
        if (energy > 0.5) {
            const glowGrad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.radius * 1.6);
            glowGrad.addColorStop(0, o.traits.color.replace('hsl', 'hsla').replace(')', ', 0.2)'));
            glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(o.x, o.y, o.radius * 1.6, 0, Math.PI * 2);
            ctx.fill();
        }

        // Body
        ctx.fillStyle = o.traits.color.replace('hsl', 'hsla').replace(')', `, ${0.35 + energy * 0.4})`);
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
        ctx.fill();

        // Membrane
        ctx.strokeStyle = o.traits.color.replace('hsl', 'hsla').replace(')', `, ${0.6 + energy * 0.3})`);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Nucleus
        ctx.fillStyle = o.traits.color.replace('hsl', 'hsla').replace(')', `, ${0.55 + energy * 0.35})`);
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.radius * 0.28, 0, Math.PI * 2);
        ctx.fill();

        // Label
        if (o.radius > 8) {
            ctx.font = `bold ${Math.max(8, o.radius * 0.45)}px system-ui`;
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillText(o.name, o.x, o.y - o.radius - 5);
            ctx.font = '7px system-ui';
            ctx.fillStyle = PALETTE.uiText;
            ctx.fillText(`Gen ${o.generation}`, o.x, o.y + o.radius + 9);
        }
    }

    // === UI PANEL ===
    const panelW = 220;
    const panelH = 150;
    const panelX = 12;
    const panelY = 12;
    
    ctx.fillStyle = PALETTE.uiBg;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 6);
    ctx.fill();
    
    ctx.strokeStyle = PALETTE.uiBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Phase label
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'left';
    const phaseColor = world.phase === 'luca_emergence' ? PALETTE.uiSuccess : PALETTE.uiHighlight;
    ctx.fillStyle = phaseColor;
    ctx.fillText(PHASE_LABELS[world.phase] || world.phase, panelX + 12, panelY + 20);

    ctx.font = '10px system-ui';
    ctx.fillStyle = PALETTE.uiText;
    
    let rowY = panelY + 38;
    const rowH = 16;
    const col1X = panelX + 12;
    const col2X = panelX + 115;

    ctx.fillText(`Time: ${Math.floor(world.time / 60)}s`, col1X, rowY);
    ctx.fillText(`Temp: ${world.temperature.toFixed(0)}°C`, col2X, rowY);
    rowY += rowH;

    ctx.fillText(`Molecules: ${engine.molecules.length}`, col1X, rowY);
    ctx.fillText(`Bonds: ${engine.bonds.length}`, col2X, rowY);
    rowY += rowH;

    ctx.fillText(`Protocells: ${engine.protoCells.length}`, col1X, rowY);
    if (engine.organisms.length > 0) {
        ctx.fillText(`Organisms: ${engine.organisms.length}`, col2X, rowY);
    }
    rowY += rowH;

    if (engine.lucaBorn) {
        ctx.fillStyle = PALETTE.uiSuccess;
        ctx.fillText('✓ LUCA Emerged', col1X, rowY);
        if (engine.maxGeneration > 0) {
            ctx.fillStyle = PALETTE.uiText;
            ctx.fillText(`Gen: ${engine.maxGeneration}`, col2X, rowY);
        }
    }
    rowY += rowH + 4;

    // Mini molecule counts
    ctx.font = '8px system-ui';
    ctx.fillStyle = PALETTE.uiText;
    const counts = engine.moleculeCounts;
    const complex = (counts.get('peptide' as MoleculeType) || 0) + 
                   (counts.get('rna_fragment' as MoleculeType) || 0);
    const building = (counts.get('amino_acid' as MoleculeType) || 0) + 
                    (counts.get('nucleotide' as MoleculeType) || 0) +
                    (counts.get('lipid' as MoleculeType) || 0);
    ctx.fillText(`Complex: ${complex}  Building: ${building}`, col1X, rowY);

    // === LEGEND with counts ===
    const legendH = 55;
    const legendY = H - legendH - 10;
    
    ctx.fillStyle = PALETTE.uiBg;
    ctx.beginPath();
    ctx.roundRect(12, legendY, W - 24, legendH, 6);
    ctx.fill();
    ctx.strokeStyle = PALETTE.uiBorder;
    ctx.stroke();

    // Building blocks row
    ctx.font = 'bold 9px system-ui';
    ctx.fillStyle = PALETTE.uiTextBright;
    ctx.textAlign = 'left';
    ctx.fillText('Building Blocks:', 20, legendY + 14);

    const buildingBlocks = [
        { type: 'amino_acid', label: 'Amino', color: MOLECULE_COLORS.amino_acid },
        { type: 'nucleotide', label: 'Nucleo', color: MOLECULE_COLORS.nucleotide },
        { type: 'lipid', label: 'Lipid', color: MOLECULE_COLORS.lipid },
        { type: 'sugar', label: 'Sugar', color: MOLECULE_COLORS.sugar },
    ];

    let bx = 120;
    ctx.font = '9px system-ui';
    for (const item of buildingBlocks) {
        const count = counts.get(item.type as MoleculeType) || 0;
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(bx, legendY + 11, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = PALETTE.uiText;
        ctx.fillText(`${item.label}: ${count}`, bx + 8, legendY + 14);
        bx += 85;
    }

    // Complex molecules row
    ctx.font = 'bold 9px system-ui';
    ctx.fillStyle = PALETTE.uiTextBright;
    ctx.fillText('Complex:', 20, legendY + 32);

    const complexMols = [
        { type: 'peptide', label: 'Peptide', color: MOLECULE_COLORS.peptide },
        { type: 'rna_fragment', label: 'RNA', color: MOLECULE_COLORS.rna_fragment },
    ];

    bx = 120;
    ctx.font = '9px system-ui';
    for (const item of complexMols) {
        const count = counts.get(item.type as MoleculeType) || 0;
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(bx, legendY + 29, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = PALETTE.uiText;
        ctx.fillText(`${item.label}: ${count}`, bx + 8, legendY + 32);
        bx += 85;
    }

    // Requirements hint
    ctx.font = '8px system-ui';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
    ctx.textAlign = 'right';
    ctx.fillText('LUCA needs: 4+ Lipids, 2+ Peptides, 3+ RNA', W - 20, legendY + 48);
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
            }
            renderSimulation(ctx, engine);
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
            backgroundColor: '#050508',
            padding: '16px',
            boxSizing: 'border-box'
        }}>
            <canvas 
                ref={canvasRef} 
                width={1200} 
                height={720}
                style={{ 
                    display: 'block', 
                    maxWidth: '100%', 
                    height: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)'
                }}
            />
            <div style={{
                marginTop: '12px',
                color: '#64748b',
                fontSize: '11px',
                fontFamily: 'system-ui',
                textAlign: 'center',
            }}>
                Abiogenesis: The Emergence of Life from Chemistry
            </div>
        </div>
    );
}