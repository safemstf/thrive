// src/components/cs/agario/neat.ts - SIMPLIFIED WORKING VERSION

export interface NeatConfig {
  mutationRate: number;
  elitism: number;
  mutationSize: number;
  addNodeRate: number;
  addConnectionRate: number;
  compatibilityThreshold: number;
}

export enum NodeType {
  INPUT = 'INPUT',
  HIDDEN = 'HIDDEN',
  OUTPUT = 'OUTPUT'
}

export class NodeGene {
  id: number;
  type: NodeType;
  activation: 'tanh' | 'sigmoid' | 'relu' | 'leaky_relu';
  
  constructor(id: number, type: NodeType, activation: 'tanh' | 'sigmoid' | 'relu' | 'leaky_relu' = 'leaky_relu') {
    this.id = id;
    this.type = type;
    this.activation = activation;
  }
  
  clone(): NodeGene {
    return new NodeGene(this.id, this.type, this.activation);
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
  
  private applyActivation(x: number, func: string): number {
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
    
    const nodeValues = new Map<number, number>();
    const calculated = new Set<number>();
    
    // Set input values (nodes 0 to inputSize-1)
    for (let i = 0; i < this.inputSize; i++) {
      nodeValues.set(i, inputs[i]);
      calculated.add(i);
    }
    
    // Collect non-input nodes
    const nodesToCalculate: number[] = [];
    for (const [id, node] of this.nodes) {
      if (node.type !== NodeType.INPUT) {
        nodesToCalculate.push(id);
      }
    }
    
    // Iteratively calculate (handles any topology)
    let iterations = 0;
    const maxIterations = nodesToCalculate.length + 5;
    
    while (calculated.size < this.nodes.size && iterations < maxIterations) {
      iterations++;
      let madeProgress = false;
      
      for (const nodeId of nodesToCalculate) {
        if (calculated.has(nodeId)) continue;
        
        const node = this.nodes.get(nodeId)!;
        
        // Get enabled incoming connections
        const incoming: ConnectionGene[] = [];
        for (const conn of this.connections.values()) {
          if (conn.to === nodeId && conn.enabled) {
            incoming.push(conn);
          }
        }
        
        // Check if all source nodes are calculated
        const ready = incoming.length === 0 || incoming.every(c => calculated.has(c.from));
        
        if (ready) {
          let sum = 0;
          for (const conn of incoming) {
            sum += (nodeValues.get(conn.from) || 0) * conn.weight;
          }
          
          const output = this.applyActivation(sum, node.activation);
          nodeValues.set(nodeId, output);
          calculated.add(nodeId);
          madeProgress = true;
        }
      }
      
      // If no progress, force calculate remaining nodes with available inputs
      if (!madeProgress) {
        for (const nodeId of nodesToCalculate) {
          if (!calculated.has(nodeId)) {
            const node = this.nodes.get(nodeId)!;
            let sum = 0;
            for (const conn of this.connections.values()) {
              if (conn.to === nodeId && conn.enabled && calculated.has(conn.from)) {
                sum += (nodeValues.get(conn.from) || 0) * conn.weight;
              }
            }
            nodeValues.set(nodeId, this.applyActivation(sum, node.activation));
            calculated.add(nodeId);
          }
        }
        break;
      }
    }
    
    // Extract outputs (nodes inputSize to inputSize+outputSize-1)
    const outputs: number[] = [];
    for (let i = 0; i < this.outputSize; i++) {
      outputs.push(nodeValues.get(this.inputSize + i) || 0);
    }
    
    return outputs;
  }
  
  addNode(innovationNum: number, connection: ConnectionGene): NodeGene {
    connection.enabled = false;
    
    const newNodeId = this.getNextNodeId();
    const newNode = new NodeGene(newNodeId, NodeType.HIDDEN, 'leaky_relu');
    this.nodes.set(newNodeId, newNode);
    
    const conn1 = new ConnectionGene(innovationNum, connection.from, newNodeId, 1.0, true);
    this.connections.set(innovationNum, conn1);
    
    const conn2 = new ConnectionGene(innovationNum + 1, newNodeId, connection.to, connection.weight, true);
    this.connections.set(innovationNum + 1, conn2);
    
    return newNode;
  }
  
  addConnection(innovationNum: number, from: number, to: number, weight: number): boolean {
    for (const conn of this.connections.values()) {
      if (conn.from === from && conn.to === to) {
        if (!conn.enabled) {
          conn.enabled = true;
          return true;
        }
        return false;
      }
    }
    
    this.connections.set(innovationNum, new ConnectionGene(innovationNum, from, to, weight, true));
    return true;
  }
  
  mutateWeights(rate: number, size: number): void {
    for (const conn of this.connections.values()) {
      if (Math.random() < rate) {
        if (Math.random() < 0.1) {
          conn.weight = (Math.random() * 2 - 1) * 2;
        } else {
          conn.weight += (Math.random() * 2 - 1) * size;
          conn.weight = Math.max(-4, Math.min(4, conn.weight));
        }
      }
    }
  }
  
  getNextNodeId(): number {
    let max = -1;
    for (const id of this.nodes.keys()) {
      if (id > max) max = id;
    }
    return max + 1;
  }
  
  clone(): Genome {
    const copy = new Genome(this.inputSize, this.outputSize);
    for (const [id, node] of this.nodes) {
      copy.nodes.set(id, node.clone());
    }
    for (const [inn, conn] of this.connections) {
      copy.connections.set(inn, conn.clone());
    }
    copy.fitness = this.fitness;
    return copy;
  }
  
  compatibilityDistance(other: Genome): number {
    const inn1 = new Set(this.connections.keys());
    const inn2 = new Set(other.connections.keys());
    
    let disjoint = 0, matching = 0, weightDiff = 0;
    
    const all = new Set([...inn1, ...inn2]);
    for (const inn of all) {
      if (inn1.has(inn) && inn2.has(inn)) {
        matching++;
        weightDiff += Math.abs(this.connections.get(inn)!.weight - other.connections.get(inn)!.weight);
      } else {
        disjoint++;
      }
    }
    
    const N = Math.max(this.connections.size, other.connections.size, 1);
    return (disjoint / N) + (matching > 0 ? 0.4 * weightDiff / matching : 0);
  }
  
  crossover(other: Genome, fitterIsThis: boolean): Genome {
    const child = new Genome(this.inputSize, this.outputSize);
    
    // Copy all nodes from both
    for (const [id, node] of this.nodes) child.nodes.set(id, node.clone());
    for (const [id, node] of other.nodes) {
      if (!child.nodes.has(id)) child.nodes.set(id, node.clone());
    }
    
    // Inherit connections
    const allInn = new Set([...this.connections.keys(), ...other.connections.keys()]);
    for (const inn of allInn) {
      const c1 = this.connections.get(inn);
      const c2 = other.connections.get(inn);
      
      if (c1 && c2) {
        child.connections.set(inn, (Math.random() < 0.5 ? c1 : c2).clone());
      } else if (fitterIsThis && c1) {
        child.connections.set(inn, c1.clone());
      } else if (!fitterIsThis && c2) {
        child.connections.set(inn, c2.clone());
      }
    }
    
    return child;
  }
  
  getComplexity() {
    const enabled = Array.from(this.connections.values()).filter(c => c.enabled).length;
    return { nodes: this.nodes.size, connections: this.connections.size, enabled };
  }
}

export class Species {
  id: number;
  members: Genome[] = [];
  representative: Genome;
  bestFitness: number = 0;
  stagnation: number = 0;
  
  constructor(id: number, rep: Genome) {
    this.id = id;
    this.representative = rep.clone();
  }
  
  add(g: Genome) { this.members.push(g); }
  clear() { this.members = []; }
  
  update() {
    if (this.members.length === 0) return;
    const best = Math.max(...this.members.map(g => g.fitness));
    if (best > this.bestFitness) {
      this.bestFitness = best;
      this.stagnation = 0;
    } else {
      this.stagnation++;
    }
  }
  
  selectParent(): Genome {
    let best = this.members[0];
    for (let i = 0; i < Math.min(3, this.members.length); i++) {
      const c = this.members[Math.floor(Math.random() * this.members.length)];
      if (c.fitness > best.fitness) best = c;
    }
    return best;
  }
}

export class Neat {
  population: Genome[];
  species: Species[] = [];
  config: NeatConfig;
  inputSize: number;
  outputSize: number;
  populationSize: number;
  nextInnovation: number = 0;
  innovationHistory: Map<string, number> = new Map();
  generation: number = 0;
  bestFitnessEver: number = 0;
  private nextSpeciesId: number = 0;

  constructor(inputSize: number, outputSize: number, populationSize: number, config: Partial<NeatConfig> = {}) {
    this.inputSize = inputSize;
    this.outputSize = outputSize;
    this.populationSize = populationSize;
    
    this.config = {
      mutationRate: config.mutationRate ?? 0.8,
      elitism: config.elitism ?? 0.4,
      mutationSize: config.mutationSize ?? 0.5,
      addNodeRate: config.addNodeRate ?? 0.4,
      addConnectionRate: config.addConnectionRate ?? 0.25,
      compatibilityThreshold: config.compatibilityThreshold ?? 3.0,
    };

    this.population = [];
    for (let i = 0; i < populationSize; i++) {
      this.population.push(this.createMinimalGenome());
    }
    
    console.log(`🧬 NEAT: ${inputSize}→${outputSize}, pop=${populationSize}`);
  }
  
  createMinimalGenome(): Genome {
    const g = new Genome(this.inputSize, this.outputSize);
    
    // Inputs: 0 to inputSize-1
    for (let i = 0; i < this.inputSize; i++) {
      g.nodes.set(i, new NodeGene(i, NodeType.INPUT));
    }
    
    // Outputs: inputSize to inputSize+outputSize-1
    for (let i = 0; i < this.outputSize; i++) {
      g.nodes.set(this.inputSize + i, new NodeGene(this.inputSize + i, NodeType.OUTPUT, 'tanh'));
    }
    
    // Full connectivity with random weights
    for (let i = 0; i < this.inputSize; i++) {
      for (let o = 0; o < this.outputSize; o++) {
        const to = this.inputSize + o;
        const inn = this.getInnovation(i, to);
        g.connections.set(inn, new ConnectionGene(inn, i, to, (Math.random() * 2 - 1) * 1.5, true));
      }
    }
    
    return g;
  }
  
  getInnovation(from: number, to: number): number {
    const key = `${from}->${to}`;
    if (!this.innovationHistory.has(key)) {
      this.innovationHistory.set(key, this.nextInnovation++);
    }
    return this.innovationHistory.get(key)!;
  }
  
  mutate(genome: Genome): void {
    genome.mutateWeights(this.config.mutationRate, this.config.mutationSize);
    
    // Add node
    if (Math.random() < this.config.addNodeRate) {
      const enabled = Array.from(genome.connections.values()).filter(c => c.enabled);
      if (enabled.length > 0) {
        const conn = enabled[Math.floor(Math.random() * enabled.length)];
        genome.addNode(this.nextInnovation, conn);
        this.nextInnovation += 2;
      }
    }
    
    // Add connection
    if (Math.random() < this.config.addConnectionRate) {
      const nodeIds = Array.from(genome.nodes.keys());
      const fromCandidates = nodeIds.filter(id => genome.nodes.get(id)!.type !== NodeType.OUTPUT);
      const toCandidates = nodeIds.filter(id => genome.nodes.get(id)!.type !== NodeType.INPUT);
      
      for (let attempt = 0; attempt < 10; attempt++) {
        const from = fromCandidates[Math.floor(Math.random() * fromCandidates.length)];
        const to = toCandidates[Math.floor(Math.random() * toCandidates.length)];
        if (from !== to) {
          const inn = this.getInnovation(from, to);
          if (genome.addConnection(inn, from, to, (Math.random() * 2 - 1) * 2)) break;
        }
      }
    }
  }
  
  speciate(): void {
    for (const s of this.species) s.clear();
    
    for (const g of this.population) {
      let found = false;
      for (const s of this.species) {
        if (g.compatibilityDistance(s.representative) < this.config.compatibilityThreshold) {
          s.add(g);
          found = true;
          break;
        }
      }
      if (!found) {
        const ns = new Species(this.nextSpeciesId++, g);
        ns.add(g);
        this.species.push(ns);
      }
    }
    
    this.species = this.species.filter(s => s.members.length > 0);
    for (const s of this.species) {
      s.update();
      s.representative = s.members[Math.floor(Math.random() * s.members.length)].clone();
    }
    
    // Remove stagnant
    if (this.species.length > 1) {
      this.species = this.species.filter(s => s.stagnation < 15);
      if (this.species.length === 0) {
        const ns = new Species(this.nextSpeciesId++, this.population[0]);
        ns.add(this.population[0]);
        this.species.push(ns);
      }
    }
  }
  
  evolve(): void {
    this.generation++;
    this.population.sort((a, b) => b.fitness - a.fitness);
    
    if (this.population[0].fitness > this.bestFitnessEver) {
      this.bestFitnessEver = this.population[0].fitness;
    }
    
    this.speciate();
    
    const newPop: Genome[] = [];
    
    // Elitism
    const elite = Math.max(1, Math.floor(this.populationSize * this.config.elitism));
    for (let i = 0; i < elite && i < this.population.length; i++) {
      newPop.push(this.population[i].clone());
    }
    
    // Species fitness for selection
    const specFit = this.species.map(s => 
      Math.max(0.1, s.members.reduce((sum, g) => sum + g.fitness, 0) / s.members.length)
    );
    const totalFit = specFit.reduce((a, b) => a + b, 0);
    
    while (newPop.length < this.populationSize) {
      // Select species
      let r = Math.random() * totalFit, idx = 0;
      for (let i = 0; i < this.species.length; i++) {
        r -= specFit[i];
        if (r <= 0) { idx = i; break; }
      }
      const species = this.species[idx];
      if (species.members.length === 0) continue;
      
      let child: Genome;
      if (species.members.length === 1 || Math.random() < 0.25) {
        child = species.selectParent().clone();
      } else {
        const p1 = species.selectParent();
        const p2 = species.selectParent();
        child = p1.crossover(p2, p1.fitness >= p2.fitness);
      }
      
      this.mutate(child);
      child.fitness = 0;
      newPop.push(child);
    }
    
    this.population = newPop;
    
    const avgN = this.population.reduce((s, g) => s + g.nodes.size, 0) / this.population.length;
    const avgC = this.population.reduce((s, g) => s + g.getComplexity().enabled, 0) / this.population.length;
    console.log(`🧬 Gen ${this.generation}: ${this.species.length} species, ${avgN.toFixed(1)}N, ${avgC.toFixed(1)}C, best=${this.bestFitnessEver.toFixed(0)}`);
  }
  
  getStats() {
    return {
      generation: this.generation,
      speciesCount: this.species.length,
      avgNodes: this.population.reduce((s, g) => s + g.nodes.size, 0) / this.population.length,
      avgConnections: this.population.reduce((s, g) => s + g.getComplexity().enabled, 0) / this.population.length,
      bestFitness: this.bestFitnessEver
    };
  }
}