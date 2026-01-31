// src/components/cs/agario/utils/neural-net-visualization.ts

import { Genome, NodeType } from '../neat';
import { NeuralLayout, NeuralConnection, ActivationFunction } from '../config/agario.types';
import { NEURAL_NET_CONFIG } from '../config/agario.constants';

/**
 * Extended NeuralNode type with color support
 */
export interface NeuralNodeEnhanced {
  id: number;
  x: number;
  y: number;
  radius: number;
  type: 'input' | 'hidden' | 'output';
  label: string;
  activation?: string;
  isLocked?: boolean;
  vx: number;
  vy: number;
  isDragging?: boolean;
  dragOffsetX?: number;
  dragOffsetY?: number;
  color?: string;
}

/**
 * Vision system configurations for automatic label generation
 */
export type VisionSystem = 'gradient' | 'original' | 'minimal' | 'compact' | 'enhanced';

interface VisionConfig {
  inputCount: number;
  outputCount: number;
  visionRays: number;
  signalsPerRay: number;
  stateInputs: number;
  getInputLabel: (index: number) => string;
  getOutputLabel: (index: number) => string;
}

/**
 * Configuration for each vision system
 */
const VISION_CONFIGS: Record<VisionSystem, VisionConfig> = {
  // NEW: Gradient-based vision (8 inputs) - DEFAULT
  gradient: {
    inputCount: 8,
    outputCount: 3,
    visionRays: 0, // Engineered features aren't ray-based
    signalsPerRay: 1,
    stateInputs: 8, // All 8 are state-like features
    getInputLabel: (i: number) => {
      // Engineered feature labels from FeaturePreprocessor.getFeatureLabels()
      return ['NetMotX', 'NetMotY', 'ThreatOpp', 'Urgency', 'Openness', 'Metabolism', 'ReproPot', 'Confidence'][i] || `I${i}`;
    },
    getOutputLabel: (i: number) => ['Acc', 'Rot', 'Rep'][i] || `O${i}`
  },

  original: {
    inputCount: 14,
    outputCount: 2,
    visionRays: 8,
    signalsPerRay: 1,
    stateInputs: 6,
    getInputLabel: (i: number) => {
      if (i < 8) return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][i];
      return ['Mass', 'Vx', 'Vy', 'Wall', 'Idle', 'Rep'][i - 8];
    },
    getOutputLabel: (i: number) => ['Acc', 'Rot'][i] || `Rep`
  },

  minimal: {
    inputCount: 12,
    outputCount: 2,
    visionRays: 8,
    signalsPerRay: 1,
    stateInputs: 4,
    getInputLabel: (i: number) => {
      if (i < 8) {
        const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        return dirs[i];
      }
      return ['Mass', 'Rep', 'Wall', 'Idle'][i - 8] || `S${i}`;
    },
    getOutputLabel: (i: number) => ['Acc', 'Rot'][i] || `Rep`
  },

  compact: {
    inputCount: 20,
    outputCount: 2,
    visionRays: 8,
    signalsPerRay: 2,
    stateInputs: 4,
    getInputLabel: (i: number) => {
      if (i < 16) {
        const rayIndex = Math.floor(i / 2);
        const signalType = i % 2;
        const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const signals = ['+', '−']; // Attractive, Repulsive
        return `${dirs[rayIndex]}${signals[signalType]}`;
      }
      return ['Mass', 'Spd', 'Rep', 'Wall'][i - 16] || `S${i}`;
    },
    getOutputLabel: (i: number) => ['Acc', 'Rot'][i] || `Rep`
  },

  enhanced: {
    inputCount: 40,
    outputCount: 2,
    visionRays: 8,
    signalsPerRay: 4,
    stateInputs: 8,
    getInputLabel: (i: number) => {
      if (i < 32) {
        const rayIndex = Math.floor(i / 4);
        const signalType = i % 4;
        const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const signals = ['F', 'T', 'P', 'O']; // Food, Threat, Prey, Obstacle
        return `${dirs[rayIndex]}:${signals[signalType]}`;
      }
      return ['Mass', 'Spd', 'Eff', 'Rep', 'WN', 'WE', 'WS', 'WW'][i - 32] || `S${i}`;
    },
    getOutputLabel: (i: number) => ['Acc', 'Rot'][i] || `Rep`
  }
};

/**
 * Auto-detect vision system based on input count
 */
export const detectVisionSystem = (inputCount: number): VisionSystem => {
  switch (inputCount) {
    case 8: return 'gradient';  // NEW: Gradient vision (default)
    case 12: return 'minimal';
    case 14: return 'original';
    case 20: return 'compact';
    case 40: return 'enhanced';
    default: {
      console.warn(`Unknown input count ${inputCount}, defaulting to gradient`);
      return 'gradient';
    }
  }
};

/**
 * Enhanced layout type with color support
 */
export interface NeuralLayoutEnhanced {
  nodes: Map<number, NeuralNodeEnhanced>;
  connections: NeuralConnection[];
  viewport?: {
    x: number;
    y: number;
    scale: number;
  };
}

// Activation function to color mapping
const ACTIVATION_MAP: Record<ActivationFunction, { label: string; color: string }> = {
  'tanh': { label: 'T', color: '#10b981' },
  'sigmoid': { label: 'S', color: '#f59e0b' },
  'relu': { label: 'R', color: '#ef4444' },
  'leaky_relu': { label: 'L', color: '#8b5cf6' }
};

/**
 * Enhanced neural layout creator with automatic vision system detection
 */
export const createNeuralLayoutEnhanced = (
  genome: Genome,
  width: number,
  height: number,
  visionSystem?: VisionSystem
): NeuralLayoutEnhanced => {
  const nodes = new Map<number, NeuralNodeEnhanced>();
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

  // Auto-detect vision system if not provided
  if (!visionSystem) {
    visionSystem = detectVisionSystem(inputNodes.length);
  }

  const config = VISION_CONFIGS[visionSystem];
  const nodeRadius = Math.min(16, width * 0.015);

  // === POSITION INPUT NODES ===
  // All inputs vertically centered as a single column
  const inputX = width * 0.12;
  const totalInputs = inputNodes.length;
  const inputSpacing = Math.min(50, (height * 0.8) / Math.max(totalInputs, 4));
  const inputTotalHeight = (totalInputs - 1) * inputSpacing;
  const inputYStart = (height - inputTotalHeight) / 2;

  // For gradient vision, first 6 are sensory, last 2 are state
  const sensoryCutoff = visionSystem === 'gradient' ? 6 : config.visionRays * config.signalsPerRay;

  inputNodes.forEach((id, i) => {
    const node = genome.nodes.get(id)!;
    const x = inputX;
    const y = inputYStart + i * inputSpacing;
    const label = config.getInputLabel(i);
    let color = '#4a9eff'; // Default blue

    // Color-code by signal type
    if (visionSystem === 'gradient') {
      if (i < 3) {
        color = '#4ade80'; // Green for attraction (AttrX, AttrY, AttrStr)
      } else if (i < 6) {
        color = '#f87171'; // Red for danger (DangX, DangY, DangStr)
      } else {
        color = '#8b5cf6'; // Purple for state (Mass, Repro)
      }
    } else if (visionSystem === 'compact') {
      color = i < sensoryCutoff ? (i % 2 === 0 ? '#4ade80' : '#f87171') : '#8b5cf6';
    } else if (visionSystem === 'enhanced') {
      if (i < sensoryCutoff) {
        const signalType = i % 4;
        const colors = ['#4ade80', '#f87171', '#fbbf24', '#a78bfa'];
        color = colors[signalType];
      } else {
        color = '#8b5cf6';
      }
    } else {
      color = i < sensoryCutoff ? '#4a9eff' : '#8b5cf6';
    }

    nodes.set(id, {
      id,
      x,
      y,
      radius: nodeRadius,
      type: 'input',
      label,
      activation: node.activation,
      isLocked: true,
      vx: 0,
      vy: 0,
      color
    });
  });

  // === POSITION HIDDEN NODES ===
  const hiddenColumnCount = Math.min(4, Math.max(1, Math.ceil(hiddenNodes.length / 5)));
  const columnWidth = (width * 0.65) / (hiddenColumnCount + 1.5);
  const hiddenColumns: number[][] = Array(hiddenColumnCount).fill(null).map(() => []);

  // Distribute hidden nodes across columns
  hiddenNodes.forEach((id, index) => {
    const col = index % hiddenColumnCount;
    hiddenColumns[col].push(id);
  });

  hiddenColumns.forEach((column, colIndex) => {
    const colX = width * 0.28 + (colIndex + 0.5) * columnWidth;
    const colSpacing = Math.min(60, height / Math.max(column.length + 1, 6));
    const colHeight = (column.length - 1) * colSpacing;
    const colYStart = (height - colHeight) / 2;

    column.forEach((id, rowIndex) => {
      const node = genome.nodes.get(id)!;

      // Map activation functions to labels and colors
      const activation: ActivationFunction =
        node.activation && node.activation in ACTIVATION_MAP
          ? node.activation as ActivationFunction
          : 'tanh';

      const { label, color } = ACTIVATION_MAP[activation];

      nodes.set(id, {
        id,
        x: colX,
        y: colYStart + rowIndex * colSpacing,
        radius: nodeRadius * 1.2,
        type: 'hidden',
        label,
        activation,
        isLocked: false,
        vx: 0,
        vy: 0,
        color
      });
    });
  });

  // === POSITION OUTPUT NODES ===
  const outputX = width * 0.88;
  const outputSpacing = Math.min(80, height / Math.max(outputNodes.length + 1, 3));
  const outputHeight = (outputNodes.length - 1) * outputSpacing;
  const outputYStart = (height - outputHeight) / 2;

  outputNodes.forEach((id, i) => {
    const node = genome.nodes.get(id)!;
    nodes.set(id, {
      id,
      x: outputX,
      y: outputYStart + i * outputSpacing,
      radius: nodeRadius * 1.1,
      type: 'output',
      label: config.getOutputLabel(i),
      activation: node.activation,
      isLocked: true,
      vx: 0,
      vy: 0,
      color: '#ec4899' // Pink for outputs
    });
  });

  // === CREATE CONNECTIONS ===
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

  return {
    nodes,
    connections,
    viewport: {
      x: 0,
      y: 0,
      scale: 1
    }
  };
};

/**
 * DRAGGING FUNCTIONS
 */

/**
 * Find a node at the given coordinates
 */
export const findNodeAtPosition = (
  layout: NeuralLayoutEnhanced,
  x: number,
  y: number,
  viewportX: number = 0,
  viewportY: number = 0,
  viewportScale: number = 1
): NeuralNodeEnhanced | null => {
  // Adjust coordinates for viewport transform
  const adjustedX = (x - viewportX) / viewportScale;
  const adjustedY = (y - viewportY) / viewportScale;

  let closestNode: NeuralNodeEnhanced | null = null;
  let closestDistance = Infinity;

  for (const node of layout.nodes.values()) {
    if (node.isLocked) continue; // Skip locked nodes (inputs/outputs)

    const distance = Math.sqrt(
      Math.pow(node.x - adjustedX, 2) +
      Math.pow(node.y - adjustedY, 2)
    );

    // Check if within node radius plus a small tolerance
    if (distance < node.radius + 5 && distance < closestDistance) {
      closestNode = node;
      closestDistance = distance;
    }
  }

  return closestNode;
};

/**
 * Start dragging a node
 */
export const startDraggingNode = (
  layout: NeuralLayoutEnhanced,
  nodeId: number,
  clientX: number,
  clientY: number,
  viewportX: number = 0,
  viewportY: number = 0,
  viewportScale: number = 1
): NeuralLayoutEnhanced => {
  const node = layout.nodes.get(nodeId);
  if (!node || node.isLocked) return layout;

  const adjustedX = (clientX - viewportX) / viewportScale;
  const adjustedY = (clientY - viewportY) / viewportScale;

  // Calculate drag offset from node center
  const dragOffsetX = adjustedX - node.x;
  const dragOffsetY = adjustedY - node.y;

  const updatedNodes = new Map(layout.nodes);
  updatedNodes.set(nodeId, {
    ...node,
    isDragging: true,
    dragOffsetX,
    dragOffsetY,
    vx: 0,
    vy: 0
  });

  return {
    ...layout,
    nodes: updatedNodes
  };
};

/**
 * Update node position while dragging
 */
export const updateDraggingNode = (
  layout: NeuralLayoutEnhanced,
  nodeId: number,
  clientX: number,
  clientY: number,
  viewportX: number = 0,
  viewportY: number = 0,
  viewportScale: number = 1
): NeuralLayoutEnhanced => {
  const node = layout.nodes.get(nodeId);
  if (!node || !node.isDragging) return layout;

  const adjustedX = (clientX - viewportX) / viewportScale;
  const adjustedY = (clientY - viewportY) / viewportScale;

  // Calculate new position based on drag offset
  const newX = adjustedX - (node.dragOffsetX || 0);
  const newY = adjustedY - (node.dragOffsetY || 0);

  const updatedNodes = new Map(layout.nodes);
  updatedNodes.set(nodeId, {
    ...node,
    x: newX,
    y: newY,
    vx: 0,
    vy: 0
  });

  return {
    ...layout,
    nodes: updatedNodes
  };
};

/**
 * Stop dragging a node
 */
export const stopDraggingNode = (
  layout: NeuralLayoutEnhanced,
  nodeId: number
): NeuralLayoutEnhanced => {
  const node = layout.nodes.get(nodeId);
  if (!node) return layout;

  const updatedNodes = new Map(layout.nodes);
  updatedNodes.set(nodeId, {
    ...node,
    isDragging: false,
    dragOffsetX: undefined,
    dragOffsetY: undefined
  });

  return {
    ...layout,
    nodes: updatedNodes
  };
};

/**
 * Enhanced physics with better organization and clustering
 */
export const applyPhysicsEnhanced = (
  layout: NeuralLayoutEnhanced,
  width: number,
  height: number,
  deltaTime: number = 1,
  mode: 'physics' | 'fixed' = 'physics',
  clusterByLayer: boolean = true
): NeuralLayoutEnhanced => {
  if (mode === 'fixed') return layout;

  const newNodes = new Map(layout.nodes);
  const nodesArray = Array.from(newNodes.values());
  const hiddenNodes = nodesArray.filter(n => n.type === 'hidden');

  // === SPRING FORCES (Connections) ===
  for (const conn of layout.connections) {
    const fromNode = newNodes.get(conn.from);
    const toNode = newNodes.get(conn.to);

    if (!fromNode || !toNode) continue;
    if (fromNode.isLocked && toNode.isLocked) continue;
    if (fromNode.isDragging || toNode.isDragging) continue;

    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      // Stronger springs for direct input->output connections
      const isDirectConnection = fromNode.type === 'input' && toNode.type === 'output';
      const targetDistance = isDirectConnection
        ? NEURAL_NET_CONFIG.minSpacing * 3
        : NEURAL_NET_CONFIG.minSpacing * 1.8;

      const force = (distance - targetDistance) * NEURAL_NET_CONFIG.springStrength;
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;

      if (!fromNode.isLocked) {
        fromNode.vx = (fromNode.vx || 0) + fx * deltaTime;
        fromNode.vy = (fromNode.vy || 0) + fy * deltaTime;
      }
      if (!toNode.isLocked) {
        toNode.vx = (toNode.vx || 0) - fx * deltaTime;
        toNode.vy = (toNode.vy || 0) - fy * deltaTime;
      }
    }
  }

  // === REPULSION FORCES (Anti-overlap) ===
  for (let i = 0; i < nodesArray.length; i++) {
    const nodeA = nodesArray[i];
    if (nodeA.isLocked || nodeA.isDragging) continue;

    for (let j = i + 1; j < nodesArray.length; j++) {
      const nodeB = nodesArray[j];
      if (nodeB.isLocked || nodeB.isDragging) continue;

      const dx = nodeB.x - nodeA.x;
      const dy = nodeB.y - nodeA.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = nodeA.radius + nodeB.radius + 25;

      if (distance < minDistance && distance > 0.1) {
        const force = NEURAL_NET_CONFIG.repulsionStrength / (distance * distance + 1);
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        nodeA.vx = (nodeA.vx || 0) - fx * deltaTime;
        nodeA.vy = (nodeA.vy || 0) - fy * deltaTime;
        nodeB.vx = (nodeB.vx || 0) + fx * deltaTime;
        nodeB.vy = (nodeB.vy || 0) + fy * deltaTime;
      }
    }
  }

  // === LAYER CLUSTERING (Keep nodes organized by depth) ===
  if (clusterByLayer && hiddenNodes.length > 0) {
    // Calculate average X position for each layer
    const layers = new Map<number, number[]>();

    for (const node of hiddenNodes) {
      // Simple layer detection: count connections from inputs
      let inputConnections = 0;
      for (const conn of layout.connections) {
        if (conn.to === node.id) {
          const fromNode = newNodes.get(conn.from);
          if (fromNode?.type === 'input') inputConnections++;
        }
      }

      const layer = inputConnections > 0 ? 0 : 1; // Simple 2-layer system
      if (!layers.has(layer)) layers.set(layer, []);
      layers.get(layer)!.push(node.id);
    }

    // Apply gentle centering force to each layer
    for (const [layer, nodeIds] of layers) {
      const targetX = 250 + layer * 150; // Approximate layer positions

      for (const nodeId of nodeIds) {
        const node = newNodes.get(nodeId)!;
        if (node.isDragging) continue;

        const dx = targetX - node.x;
        const force = dx * 0.02; // Gentle centering
        node.vx = (node.vx || 0) + force * deltaTime;
      }
    }
  }

  // === UPDATE POSITIONS ===
  for (const node of nodesArray) {
    if (node.isLocked || node.isDragging) {
      node.vx = 0;
      node.vy = 0;
      continue;
    }

    // Apply damping
    node.vx = (node.vx || 0) * NEURAL_NET_CONFIG.damping;
    node.vy = (node.vy || 0) * NEURAL_NET_CONFIG.damping;

    // Limit max speed
    const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
    if (speed > NEURAL_NET_CONFIG.maxForce) {
      node.vx = (node.vx / speed) * NEURAL_NET_CONFIG.maxForce;
      node.vy = (node.vy / speed) * NEURAL_NET_CONFIG.maxForce;
    }

    // Update position
    node.x += node.vx * deltaTime;
    node.y += node.vy * deltaTime;

    // Constrain to bounds (with padding)
    const padding = 40;
    node.x = Math.max(padding, Math.min(width - padding, node.x));
    node.y = Math.max(padding, Math.min(height - padding, node.y));
  }

  return { ...layout, nodes: newNodes };
};

/**
 * VIEWPORT FUNCTIONS
 */

/**
 * Update viewport (panning and zooming)
 */
export const updateViewport = (
  layout: NeuralLayoutEnhanced,
  viewportX: number,
  viewportY: number,
  viewportScale: number
): NeuralLayoutEnhanced => {
  return {
    ...layout,
    viewport: {
      x: viewportX,
      y: viewportY,
      scale: viewportScale
    }
  };
};

/**
 * Fit layout to viewport
 */
export const fitLayoutToViewport = (
  layout: NeuralLayoutEnhanced,
  viewportWidth: number,
  viewportHeight: number
): NeuralLayoutEnhanced => {
  // Calculate bounds of all nodes
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const node of layout.nodes.values()) {
    minX = Math.min(minX, node.x - node.radius);
    maxX = Math.max(maxX, node.x + node.radius);
    minY = Math.min(minY, node.y - node.radius);
    maxY = Math.max(maxY, node.y + node.radius);
  }

  const layoutWidth = maxX - minX;
  const layoutHeight = maxY - minY;

  // Calculate scale to fit
  const padding = 80;
  const scaleX = (viewportWidth - padding * 2) / layoutWidth;
  const scaleY = (viewportHeight - padding * 2) / layoutHeight;
  const scale = Math.min(scaleX, scaleY, 1.5); // Don't zoom in too much

  // Calculate offset to center
  const offsetX = (viewportWidth - layoutWidth * scale) / 2 - minX * scale;
  const offsetY = (viewportHeight - layoutHeight * scale) / 2 - minY * scale;

  return updateViewport(layout, offsetX, offsetY, scale);
};

/**
 * Reset viewport to default
 */
export const resetViewport = (
  layout: NeuralLayoutEnhanced
): NeuralLayoutEnhanced => {
  return {
    ...layout,
    viewport: {
      x: 0,
      y: 0,
      scale: 1
    }
  };
};

/**
 * Get statistics about the neural network layout
 */
export const getLayoutStats = (layout: NeuralLayoutEnhanced, visionSystem: VisionSystem) => {
  const config = VISION_CONFIGS[visionSystem];
  const nodeCount = layout.nodes.size;
  const hiddenCount = Array.from(layout.nodes.values()).filter(n => n.type === 'hidden').length;
  const connectionCount = layout.connections.length;

  // Calculate complexity
  const complexity = {
    nodes: nodeCount,
    hidden: hiddenCount,
    connections: connectionCount,
    connectionsPerNode: connectionCount / nodeCount,
    hiddenLayerDensity: hiddenCount / (config.inputCount + config.outputCount)
  };

  // Activation function distribution
  const activations = new Map<string, number>();
  for (const node of layout.nodes.values()) {
    if (node.type === 'hidden') {
      const activation = node.activation || 'unknown';
      const count = activations.get(activation) || 0;
      activations.set(activation, count + 1);
    }
  }

  return {
    visionSystem,
    config,
    complexity,
    activations: Object.fromEntries(activations)
  };
};

/**
 * Convert enhanced layout to standard layout (for backward compatibility)
 */
export const convertToStandardLayout = (enhancedLayout: NeuralLayoutEnhanced): NeuralLayout => {
  const standardNodes = new Map<number, any>();

  for (const [id, node] of enhancedLayout.nodes) {
    // Omit the 'color' property for standard layout
    const { color, ...standardNode } = node;
    standardNodes.set(id, standardNode);
  }

  return {
    nodes: standardNodes,
    connections: enhancedLayout.connections
  };
};

// Helper function for node colors with activation support
const getNodeColor = (type: 'input' | 'hidden' | 'output', activation?: string): string => {
  if (type === 'hidden' && activation && activation in ACTIVATION_MAP) {
    return ACTIVATION_MAP[activation as ActivationFunction]?.color ?? '#6b7280';
  }

  switch (type) {
    case 'input': return '#4a9eff';
    case 'output': return '#ec4899';
    default: return '#6b7280';
  }
};

/**
 * Apply physics for backward compatibility - accepts NeuralLayout and returns NeuralLayout
 */
export const applyPhysics = (
  layout: NeuralLayout | NeuralLayoutEnhanced,
  deltaTime: number = 1
): NeuralLayout => {
  // Default width and height for backward compatibility
  const width = 800;
  const height = 600;

  // Check if it's already an enhanced layout
  let enhancedLayout: NeuralLayoutEnhanced;

  if (layout.nodes instanceof Map) {
    // It's already enhanced
    enhancedLayout = layout as NeuralLayoutEnhanced;
  } else {
    // It's a standard layout - convert to enhanced first
    const standardLayout = layout as NeuralLayout;
    enhancedLayout = {
      nodes: new Map(),
      connections: standardLayout.connections,
      viewport: { x: 0, y: 0, scale: 1 }
    };

    // Convert standard nodes to enhanced
    for (const [id, node] of standardLayout.nodes) {
      // Provide default activation if missing
      let activation = node.activation || 'tanh';

      // For input/output nodes, use more appropriate defaults
      if (node.type === 'input') activation = 'linear';
      if (node.type === 'output') activation = 'sigmoid';

      enhancedLayout.nodes.set(id, {
        ...node,
        vx: node.vx || 0,
        vy: node.vy || 0,
        isDragging: node.isDragging || false,
        activation: activation,
        color: getNodeColor(node.type, activation)
      });
    }
  }

  const enhancedResult = applyPhysicsEnhanced(enhancedLayout, width, height, deltaTime, 'physics', true);
  return convertToStandardLayout(enhancedResult);
};

// Export default as the enhanced version
export const createNeuralLayout = createNeuralLayoutEnhanced;