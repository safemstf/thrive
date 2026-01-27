// src/components/cs/agario/neat.ts

export interface NeatConfig {
  mutationRate: number;
  elitism: number;
  randomBehaviour: number;
  mutationSize: number;
  addNodeRate: number;
  addConnectionRate: number;
  compatibilityThreshold: number;
  activationFunction?: 'tanh' | 'sigmoid' | 'relu' | 'leaky_relu';
}

export enum NodeType {
  INPUT = 'INPUT',
  HIDDEN = 'HIDDEN',
  OUTPUT = 'OUTPUT'
}

export class NodeGene {
  id: number;
  type: NodeType;
  activationFunction: 'tanh' | 'sigmoid' | 'relu' | 'leaky_relu';
  
  constructor(id: number, type: NodeType, activationFunction: 'tanh' | 'sigmoid' | 'relu' | 'leaky_relu' = 'leaky_relu') {
    this.id = id;
    this.type = type;
    this.activationFunction = activationFunction;
  }
  
  clone(): NodeGene {
    return new NodeGene(this.id, this.type, this.activationFunction);
  }
}

export class ConnectionGene {
  innovation: number;
  from: number;
  to: number;
  weight: number;
  enabled: boolean;
  
  constructor(innovation: number, from: number, to: number, weight: number, enabled = true) {
    this.innovation = innovation;
    this.from = from;
    this.to = to;
    this.weight = weight;
    this.enabled = enabled;
  }
  
  clone(): ConnectionGene {
    return new ConnectionGene(this.innovation, this.from, this.to, this.weight, this.enabled);
  }
}

export class Genome {
  nodes: Map<number, NodeGene>;
  connections: Map<number, ConnectionGene>;
  fitness: number = 0;
  inputSize: number;
  outputSize: number;
  
  constructor(inputSize: number, outputSize: number) {
    this.inputSize = inputSize;
    this.outputSize = outputSize;
    this.nodes = new Map();
    this.connections = new Map();
  }
  
  // Activation functions
  private applyActivation(x: number, func: 'tanh' | 'sigmoid' | 'relu' | 'leaky_relu'): number {
    switch (func) {
      case 'sigmoid':
        return 1 / (1 + Math.exp(-x));
      case 'relu':
        return Math.max(0, x);
      case 'leaky_relu':
        return x > 0 ? x : x * 0.01;
      case 'tanh':
      default:
        return Math.tanh(x);
    }
  }
  
  activate(inputs: number[]): number[] {
    if (inputs.length !== this.inputSize) {
      throw new Error(`Expected ${this.inputSize} inputs, got ${inputs.length}`);
    }
    
    // Build network layers using topological sort
    const nodeValues = new Map<number, number>();
    const calculated = new Set<number>();
    
    // Set input values
    for (let i = 0; i < this.inputSize; i++) {
      nodeValues.set(i, inputs[i]);
      calculated.add(i);
    }
    
    // Calculate hidden and output nodes in order
    const nodesToCalculate: number[] = [];
    for (const [id, node] of this.nodes) {
      if (node.type !== NodeType.INPUT) {
        nodesToCalculate.push(id);
      }
    }
    
    // Keep calculating until all nodes are done (simple approach)
    let maxIterations = 100;
    while (calculated.size < this.nodes.size && maxIterations > 0) {
      maxIterations--;
      
      for (const nodeId of nodesToCalculate) {
        if (calculated.has(nodeId)) continue;
        
        const node = this.nodes.get(nodeId)!;
        
        // Check if all inputs to this node are calculated
        const incomingConnections = Array.from(this.connections.values())
          .filter(c => c.to === nodeId && c.enabled);
        
        const canCalculate = incomingConnections.every(c => calculated.has(c.from));
        
        if (canCalculate) {
          // Calculate weighted sum
          let sum = 0;
          for (const conn of incomingConnections) {
            const inputValue = nodeValues.get(conn.from) || 0;
            sum += inputValue * conn.weight;
          }
          
          // Apply activation
          const output = node.type === NodeType.OUTPUT 
            ? Math.tanh(sum) // Always tanh for output
            : this.applyActivation(sum, node.activationFunction);
          
          nodeValues.set(nodeId, output);
          calculated.add(nodeId);
        }
      }
    }
    
    // Extract outputs
    const outputs: number[] = [];
    for (let i = this.inputSize; i < this.inputSize + this.outputSize; i++) {
      outputs.push(nodeValues.get(i) || 0);
    }
    
    return outputs;
  }
  
  addNode(innovationNum: number, connection: ConnectionGene): NodeGene {
    // Disable the old connection
    connection.enabled = false;
    
    // Create new node
    const newNodeId = this.getNextNodeId();
    const newNode = new NodeGene(newNodeId, NodeType.HIDDEN);
    this.nodes.set(newNodeId, newNode);
    
    // Add two new connections (innovation numbers will be set by Neat class)
    // Connection from old input to new node (weight 1)
    const conn1 = new ConnectionGene(innovationNum, connection.from, newNodeId, 1.0, true);
    this.connections.set(innovationNum, conn1);
    
    // Connection from new node to old output (old weight)
    const conn2 = new ConnectionGene(innovationNum + 1, newNodeId, connection.to, connection.weight, true);
    this.connections.set(innovationNum + 1, conn2);
    
    return newNode;
  }
  
  addConnection(innovationNum: number, from: number, to: number, weight: number): void {
    // Check if connection already exists
    const exists = Array.from(this.connections.values()).some(
      c => c.from === from && c.to === to
    );
    
    if (!exists) {
      const conn = new ConnectionGene(innovationNum, from, to, weight, true);
      this.connections.set(innovationNum, conn);
    }
  }
  
  mutateWeights(mutationRate: number, mutationSize: number): void {
    for (const conn of this.connections.values()) {
      if (Math.random() < mutationRate) {
        if (Math.random() < 0.1) {
          // 10% chance to completely randomize
          conn.weight = (Math.random() * 2 - 1) * 2;
        } else {
          // 90% chance to perturb
          conn.weight += (Math.random() * 2 - 1) * mutationSize;
          conn.weight = Math.max(-2, Math.min(2, conn.weight));
        }
      }
    }
  }
  
  mutateActivation(): void {
    // Randomly change activation function of hidden nodes
    for (const node of this.nodes.values()) {
      if (node.type === NodeType.HIDDEN && Math.random() < 0.05) {
        const functions: Array<'tanh' | 'sigmoid' | 'relu' | 'leaky_relu'> = 
          ['tanh', 'sigmoid', 'relu', 'leaky_relu'];
        node.activationFunction = functions[Math.floor(Math.random() * functions.length)];
      }
    }
  }
  
  getNextNodeId(): number {
    let maxId = -1;
    for (const id of this.nodes.keys()) {
      if (id > maxId) maxId = id;
    }
    return maxId + 1;
  }
  
  clone(): Genome {
    const copy = new Genome(this.inputSize, this.outputSize);
    
    // Clone nodes
    for (const [id, node] of this.nodes) {
      copy.nodes.set(id, node.clone());
    }
    
    // Clone connections
    for (const [innovation, conn] of this.connections) {
      copy.connections.set(innovation, conn.clone());
    }
    
    copy.fitness = this.fitness;
    return copy;
  }
  
  // Calculate compatibility distance for speciation
  compatibilityDistance(other: Genome, c1: number = 1.0, c2: number = 1.0, c3: number = 0.4): number {
    const innovations1 = new Set(this.connections.keys());
    const innovations2 = new Set(other.connections.keys());
    
    const allInnovations = new Set([...innovations1, ...innovations2]);
    const maxInnovation = Math.max(...allInnovations);
    
    let disjoint = 0;
    let excess = 0;
    let matching = 0;
    let weightDiff = 0;
    
    for (const inn of allInnovations) {
      const has1 = innovations1.has(inn);
      const has2 = innovations2.has(inn);
      
      if (has1 && has2) {
        matching++;
        const w1 = this.connections.get(inn)!.weight;
        const w2 = other.connections.get(inn)!.weight;
        weightDiff += Math.abs(w1 - w2);
      } else if (inn === maxInnovation) {
        excess++;
      } else {
        disjoint++;
      }
    }
    
    const N = Math.max(this.connections.size, other.connections.size, 1);
    const avgWeightDiff = matching > 0 ? weightDiff / matching : 0;
    
    return (c1 * excess / N) + (c2 * disjoint / N) + (c3 * avgWeightDiff);
  }
  
  crossover(other: Genome, fitterParent: boolean): Genome {
    const child = new Genome(this.inputSize, this.outputSize);
    
    // Copy all nodes from both parents
    const allNodeIds = new Set<number>();
    for (const id of this.nodes.keys()) allNodeIds.add(id);
    for (const id of other.nodes.keys()) allNodeIds.add(id);
    
    for (const id of allNodeIds) {
      const node1 = this.nodes.get(id);
      const node2 = other.nodes.get(id);
      
      if (node1) {
        child.nodes.set(id, node1.clone());
      } else if (node2) {
        child.nodes.set(id, node2.clone());
      }
    }
    
    // Inherit connections
    const allInnovations = new Set<number>();
    for (const inn of this.connections.keys()) allInnovations.add(inn);
    for (const inn of other.connections.keys()) allInnovations.add(inn);
    
    for (const inn of allInnovations) {
      const conn1 = this.connections.get(inn);
      const conn2 = other.connections.get(inn);
      
      if (conn1 && conn2) {
        // Both have it - randomly choose
        const chosen = Math.random() < 0.5 ? conn1 : conn2;
        child.connections.set(inn, chosen.clone());
      } else if (fitterParent && conn1) {
        // Only fitter parent has it
        child.connections.set(inn, conn1.clone());
      } else if (!fitterParent && conn2) {
        child.connections.set(inn, conn2.clone());
      }
    }
    
    return child;
  }
}

export class Neat {
  population: Genome[];
  config: NeatConfig;
  inputSize: number;
  outputSize: number;
  populationSize: number;
  nextInnovation: number;
  innovationHistory: Map<string, number>; // Track innovation numbers
  generation: number;
  species: Genome[][]; // Groups of similar genomes

  constructor(
    inputSize: number,
    outputSize: number,
    populationSize: number,
    config: Partial<NeatConfig> = {}
  ) {
    this.inputSize = inputSize;
    this.outputSize = outputSize;
    this.populationSize = populationSize;
    this.nextInnovation = 0;
    this.innovationHistory = new Map();
    this.generation = 0;
    this.species = [];
    
    this.config = {
      mutationRate: config.mutationRate ?? 0.8,
      elitism: config.elitism ?? 0.2,
      randomBehaviour: config.randomBehaviour ?? 0.05,
      mutationSize: config.mutationSize ?? 0.5,
      addNodeRate: config.addNodeRate ?? 0.03,
      addConnectionRate: config.addConnectionRate ?? 0.05,
      compatibilityThreshold: config.compatibilityThreshold ?? 3.0,
      activationFunction: config.activationFunction ?? 'leaky_relu',
    };

    // Create initial minimal population (inputs directly to outputs)
    this.population = [];
    for (let i = 0; i < populationSize; i++) {
      this.population.push(this.createMinimalGenome());
    }
    
    console.log(`🧬 NEAT initialized with minimal topology: ${inputSize} inputs → ${outputSize} outputs`);
  }
  
  createMinimalGenome(): Genome {
    const genome = new Genome(this.inputSize, this.outputSize);
    
    // Add input nodes
    for (let i = 0; i < this.inputSize; i++) {
      genome.nodes.set(i, new NodeGene(i, NodeType.INPUT));
    }
    
    // Add output nodes
    for (let i = 0; i < this.outputSize; i++) {
      const id = this.inputSize + i;
      genome.nodes.set(id, new NodeGene(id, NodeType.OUTPUT));
    }
    
    // Connect each input to each output (full connectivity to start)
    for (let i = 0; i < this.inputSize; i++) {
      for (let o = 0; o < this.outputSize; o++) {
        const to = this.inputSize + o;
        const innovation = this.getInnovation(i, to);
        const weight = (Math.random() * 2 - 1) * 0.5; // Small initial weights
        genome.connections.set(innovation, new ConnectionGene(innovation, i, to, weight, true));
      }
    }
    
    return genome;
  }
  
  getInnovation(from: number, to: number): number {
    const key = `${from}->${to}`;
    if (this.innovationHistory.has(key)) {
      return this.innovationHistory.get(key)!;
    }
    const innovation = this.nextInnovation++;
    this.innovationHistory.set(key, innovation);
    return innovation;
  }
  
  mutate(genome: Genome): void {
    // Mutate weights
    genome.mutateWeights(this.config.mutationRate, this.config.mutationSize);
    
    // Add node mutation
    if (Math.random() < this.config.addNodeRate && genome.connections.size > 0) {
      const connections = Array.from(genome.connections.values()).filter(c => c.enabled);
      if (connections.length > 0) {
        const randomConn = connections[Math.floor(Math.random() * connections.length)];
        const innovation = this.nextInnovation;
        this.nextInnovation += 2; // Reserve 2 innovation numbers
        genome.addNode(innovation, randomConn);
        console.log(`➕ Added node! Total nodes: ${genome.nodes.size}`);
      }
    }
    
    // Add connection mutation
    if (Math.random() < this.config.addConnectionRate) {
      const nodeIds = Array.from(genome.nodes.keys());
      const inputAndHidden = nodeIds.filter(id => {
        const node = genome.nodes.get(id)!;
        return node.type !== NodeType.OUTPUT;
      });
      const hiddenAndOutput = nodeIds.filter(id => {
        const node = genome.nodes.get(id)!;
        return node.type !== NodeType.INPUT;
      });
      
      if (inputAndHidden.length > 0 && hiddenAndOutput.length > 0) {
        const from = inputAndHidden[Math.floor(Math.random() * inputAndHidden.length)];
        const to = hiddenAndOutput[Math.floor(Math.random() * hiddenAndOutput.length)];
        
        // Make sure not creating recurrent connection (simplified check)
        if (from !== to) {
          const innovation = this.getInnovation(from, to);
          const weight = (Math.random() * 2 - 1);
          genome.addConnection(innovation, from, to, weight);
        }
      }
    }
    
    // Mutate activation functions
    genome.mutateActivation();
  }
  
  speciate(): void {
    this.species = [];
    
    for (const genome of this.population) {
      let foundSpecies = false;
      
      for (const spec of this.species) {
        if (spec.length > 0) {
          const representative = spec[0];
          const distance = genome.compatibilityDistance(representative);
          
          if (distance < this.config.compatibilityThreshold) {
            spec.push(genome);
            foundSpecies = true;
            break;
          }
        }
      }
      
      if (!foundSpecies) {
        this.species.push([genome]);
      }
    }
    
    console.log(`🧬 Generation ${this.generation}: ${this.species.length} species`);
  }
  
  evolve(): void {
    this.generation++;
    
    // Sort by fitness
    this.population.sort((a, b) => b.fitness - a.fitness);
    
    // Speciate
    this.speciate();
    
    const newPopulation: Genome[] = [];
    
    // Elitism - keep best from each species
    const eliteCount = Math.floor(this.populationSize * this.config.elitism);
    for (let i = 0; i < Math.min(eliteCount, this.population.length); i++) {
      newPopulation.push(this.population[i].clone());
    }
    
    // Fill rest with offspring
    while (newPopulation.length < this.populationSize) {
      if (this.species.length === 0) {
        // Failsafe: create new minimal genome
        newPopulation.push(this.createMinimalGenome());
        continue;
      }
      
      // Select random species
      const speciesIdx = Math.floor(Math.random() * this.species.length);
      const species = this.species[speciesIdx];
      
      if (species.length === 0) continue;
      
      // Select parents from species
      const parent1 = species[Math.floor(Math.random() * species.length)];
      const parent2 = species[Math.floor(Math.random() * species.length)];
      
      let child: Genome;
      if (Math.random() < 0.25 || species.length === 1) {
        // Asexual reproduction (mutation only)
        child = parent1.clone();
      } else {
        // Sexual reproduction (crossover)
        const fitterParent = parent1.fitness >= parent2.fitness;
        child = parent1.crossover(parent2, fitterParent);
      }
      
      // Mutate child
      this.mutate(child);
      child.fitness = 0;
      
      newPopulation.push(child);
    }
    
    this.population = newPopulation;
    
    // Log complexity stats
    const avgNodes = this.population.reduce((sum, g) => sum + g.nodes.size, 0) / this.population.length;
    const avgConns = this.population.reduce((sum, g) => sum + g.connections.size, 0) / this.population.length;
    console.log(`📊 Avg complexity: ${avgNodes.toFixed(1)} nodes, ${avgConns.toFixed(1)} connections`);
  }

  selectParent(): Genome {
    // Tournament selection
    const tournamentSize = 3;
    let best: Genome | null = null;

    for (let i = 0; i < tournamentSize; i++) {
      const candidate = this.population[Math.floor(Math.random() * this.population.length)];
      if (!best || candidate.fitness > best.fitness) {
        best = candidate;
      }
    }

    return best!;
  }
}