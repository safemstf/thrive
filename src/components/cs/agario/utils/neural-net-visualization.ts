// src/components/cs/agario/neural-net-visualization.ts

import { Genome, NodeType } from '../neat';
import { NeuralLayout, NeuralNode, NeuralConnection } from '../config/agario.types';
import { NEURAL_NET_CONFIG } from '../config/agario.constants';

export const createNeuralLayout = (genome: Genome, width: number, height: number): NeuralLayout => {
  const nodes = new Map<number, NeuralNode>();
  const connections: NeuralConnection[] = [];

  // Categorize nodes
  const inputNodes: number[] = [];
  const hiddenNodes: number[] = [];
  const outputNodes: number[] = [];

  for (const [id, node] of genome.nodes) {
    if (node.type === NodeType.INPUT) inputNodes.push(id);
    else if (node.type === NodeType.HIDDEN) hiddenNodes.push(id);
    else if (node.type === NodeType.OUTPUT) outputNodes.push(id);
  }

  inputNodes.sort((a, b) => a - b);
  hiddenNodes.sort((a, b) => a - b);
  outputNodes.sort((a, b) => a - b);

  const nodeRadius = Math.min(16, width * 0.015);

  // Position input nodes
  const inputX = width * 0.15;
  const inputSpacing = Math.min(60, height / Math.max(inputNodes.length, 8));
  const inputHeight = (inputNodes.length - 1) * inputSpacing;
  const inputYStart = (height - inputHeight) / 2;

  inputNodes.forEach((id, i) => {
    const node = genome.nodes.get(id)!;
    nodes.set(id, {
      id,
      x: inputX,
      y: inputYStart + i * inputSpacing,
      radius: nodeRadius,
      type: 'input',
      label: i < 14 ? [
        'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW',
        'M', 'Vx', 'Vy', 'Wall',
        'Idle', 'RepReady'
      ][i] : `I${i}`,
      activation: node.activation,
      isLocked: true,
      vx: 0,
      vy: 0
    });
  });

  // Position hidden nodes
  const hiddenColumnCount = Math.min(4, Math.max(1, Math.floor(hiddenNodes.length / 3)));
  const columnWidth = (width * 0.7) / (hiddenColumnCount + 2);
  const hiddenColumns: number[][] = Array(hiddenColumnCount).fill(null).map(() => []);

  hiddenNodes.forEach((id, index) => {
    const col = index % hiddenColumnCount;
    hiddenColumns[col].push(id);
  });

  hiddenColumns.forEach((column, colIndex) => {
    const colX = width * 0.25 + (colIndex + 1) * columnWidth;
    const colSpacing = Math.min(70, height / Math.max(column.length, 6));
    const colHeight = (column.length - 1) * colSpacing;
    const colYStart = (height - colHeight) / 2;

    column.forEach((id, rowIndex) => {
      const node = genome.nodes.get(id)!;
      const activationMap: Record<string, string> = {
        'tanh': 'T', 'sigmoid': 'S', 'relu': 'R', 'leaky_relu': 'L'
      };
      const label = activationMap[node.activation] || 'H';

      nodes.set(id, {
        id,
        x: colX + (Math.random() * 30 - 15),
        y: colYStart + rowIndex * colSpacing + (Math.random() * 20 - 10),
        radius: nodeRadius * 1.3,
        type: 'hidden',
        label,
        activation: node.activation,
        isLocked: false,
        vx: 0,
        vy: 0
      });
    });
  });

  // Position output nodes
  const outputX = width * 0.85;
  const outputSpacing = Math.min(60, height / Math.max(outputNodes.length, 8));
  const outputHeight = (outputNodes.length - 1) * outputSpacing;
  const outputYStart = (height - outputHeight) / 2;

  outputNodes.forEach((id, i) => {
    const node = genome.nodes.get(id)!;
    nodes.set(id, {
      id,
      x: outputX,
      y: outputYStart + i * outputSpacing,
      radius: nodeRadius,
      type: 'output',
      label: ['Acc', 'Rot', 'Reproduce'][i] || `O${i}`,
      activation: node.activation,
      isLocked: true,
      vx: 0,
      vy: 0
    });
  });

  // Create connections
  for (const conn of genome.connections.values()) {
    if (conn.enabled) {
      connections.push({
        from: conn.from,
        to: conn.to,
        weight: conn.weight,
        enabled: conn.enabled
      });
    }
  }

  return { nodes, connections };
};

export const applyPhysics = (
  layout: NeuralLayout, 
  deltaTime: number = 1,
  mode: 'physics' | 'fixed' = 'physics'
): NeuralLayout => {
  if (mode === 'fixed') return layout;

  const newNodes = new Map(layout.nodes);
  const nodesArray = Array.from(newNodes.values());

  // Spring forces for connections
  for (const conn of layout.connections) {
    const fromNode = newNodes.get(conn.from);
    const toNode = newNodes.get(conn.to);

    if (!fromNode || !toNode || fromNode.isLocked || toNode.isLocked) continue;

    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const targetDistance = NEURAL_NET_CONFIG.minSpacing * 1.5;
      const force = (distance - targetDistance) * NEURAL_NET_CONFIG.springStrength;

      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;

      fromNode.vx = (fromNode.vx || 0) + fx * deltaTime;
      fromNode.vy = (fromNode.vy || 0) + fy * deltaTime;
      toNode.vx = (toNode.vx || 0) - fx * deltaTime;
      toNode.vy = (toNode.vy || 0) - fy * deltaTime;
    }
  }

  // Repulsion between nodes
  for (let i = 0; i < nodesArray.length; i++) {
    const nodeA = nodesArray[i];
    if (nodeA.isLocked) continue;

    for (let j = i + 1; j < nodesArray.length; j++) {
      const nodeB = nodesArray[j];
      if (nodeB.isLocked) continue;

      const dx = nodeB.x - nodeA.x;
      const dy = nodeB.y - nodeA.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = nodeA.radius + nodeB.radius + 20;

      if (distance < minDistance && distance > 0) {
        const force = NEURAL_NET_CONFIG.repulsionStrength / (distance * distance);
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        nodeA.vx = (nodeA.vx || 0) - fx * deltaTime;
        nodeA.vy = (nodeA.vy || 0) - fy * deltaTime;
        nodeB.vx = (nodeB.vx || 0) + fx * deltaTime;
        nodeB.vy = (nodeB.vy || 0) + fy * deltaTime;
      }
    }
  }

  // Update positions
  for (const node of nodesArray) {
    if (node.isLocked || node.isDragging) {
      node.vx = 0;
      node.vy = 0;
      continue;
    }

    node.vx = (node.vx || 0) * NEURAL_NET_CONFIG.damping;
    node.vy = (node.vy || 0) * NEURAL_NET_CONFIG.damping;

    const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
    if (speed > NEURAL_NET_CONFIG.maxForce) {
      node.vx = (node.vx / speed) * NEURAL_NET_CONFIG.maxForce;
      node.vy = (node.vy / speed) * NEURAL_NET_CONFIG.maxForce;
    }

    node.x += node.vx * deltaTime;
    node.y += node.vy * deltaTime;

    const padding = 50;
    node.x = Math.max(padding, Math.min(750, node.x));
    node.y = Math.max(padding, Math.min(550, node.y));
  }

  return { ...layout, nodes: newNodes };
};