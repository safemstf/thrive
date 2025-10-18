import { COLORS } from './phylogeny.config';
import { SimulationEngine, wrapDelta } from './phylogeny.logic';

export function renderSimulation(engine: SimulationEngine, ctx: CanvasRenderingContext2D) {
    const world = engine.world;

    // Clear and render background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, world.width, world.height);

    // Render energy field
    for (let y = 0; y < world.energyField.length; y++) {
        for (let x = 0; x < world.energyField[y].length; x++) {
            const energy = world.energyField[y][x];
            const alpha = (energy / 100) * 0.12;
            ctx.fillStyle = `rgba(20, 184, 166, ${alpha})`;
            ctx.fillRect(x * 30, y * 30, 30, 30);
        }
    }

    // Render hydrothermal vents
    for (const vent of world.vents) {
        const pulse = Math.sin(world.time * 0.05 + vent.phase) * 0.3 + 0.7;

        const gradient = ctx.createRadialGradient(vent.x, vent.y, 0, vent.x, vent.y, 80);
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
        gradient.addColorStop(0.5, 'rgba(251, 146, 60, 0.2)');
        gradient.addColorStop(1, 'rgba(251, 146, 60, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(vent.x, vent.y, 80 * pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 100, 50, 0.9)';
        ctx.beginPath();
        ctx.arc(vent.x, vent.y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(255, 150, 80, ${0.5 * pulse})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(vent.x, vent.y, 15 + pulse * 8, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Render rocks
    for (const rock of world.rocks) {
        const alpha = rock.type === 'chimney' ? 0.25 : rock.type === 'ridge' ? 0.2 : 0.15;
        ctx.fillStyle = `rgba(70, 70, 80, ${alpha})`;
        ctx.beginPath();
        ctx.arc(rock.x, rock.y, rock.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(100, 100, 110, ${alpha + 0.1})`;
        ctx.lineWidth = rock.type === 'chimney' ? 2 : 1.5;
        ctx.stroke();

        if (rock.roughness > 0.6) {
            ctx.fillStyle = `rgba(90, 90, 100, ${alpha * 0.5})`;
            ctx.beginPath();
            ctx.arc(rock.x - rock.radius * 0.3, rock.y - rock.radius * 0.3, rock.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Render bonds
    for (const bond of engine.bonds) {
        const mol1 = engine.moleculeMap.get(bond.mol1);
        const mol2 = engine.moleculeMap.get(bond.mol2);
        if (mol1 && mol2) {
            ctx.strokeStyle = (COLORS as any)[`bond_${bond.type}`] || COLORS.bond_covalent;
            ctx.lineWidth = 1.5;

            const dx = wrapDelta(mol2.x - mol1.x, world.width);
            const dy = wrapDelta(mol2.y - mol1.y, world.height);

            ctx.beginPath();
            ctx.moveTo(mol1.x, mol1.y);
            ctx.lineTo(mol1.x + dx, mol1.y + dy);
            ctx.stroke();
        }
    }

    // Render molecules (only before LUCA emerges)
    if (!engine.lucaBorn) {
        engine.molecules.forEach((m) => m.draw(ctx, world.time));
    }

    // Render protocells
    engine.protoCells.forEach((p) => p.draw(ctx));

    // Render LUCA
    if (engine.luca) {
        engine.luca.draw(ctx, world.time);
    }

    // Render organisms
    engine.organisms.forEach((o) => o.draw(ctx));
}