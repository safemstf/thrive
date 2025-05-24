import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Play, Pause, RotateCcw, Settings, Activity, Users } from 'lucide-react';

// Activation functions
const activationFunctions = {
  sigmoid: (x: number) => 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))),
  tanh: (x: number) => Math.tanh(Math.max(-500, Math.min(500, x))),
  relu: (x: number) => Math.max(0, x),
  leaky_relu: (x: number) => x > 0 ? x : 0.01 * x,
  linear: (x: number) => Math.max(-10, Math.min(10, x))
};

type ActivationType = keyof typeof activationFunctions;
const activationNames: ActivationType[] = Object.keys(activationFunctions) as ActivationType[];

// Food particle class
class Food {
  x: number;
  y: number;
  size: number;
  nutritionValue: number;
  age: number;
  maxAge: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 3 + 2;
    this.nutritionValue = this.size * 10;
    this.age = 0;
    this.maxAge = 1000 + Math.random() * 2000; // Food decays over time
  }

  update() {
    this.age++;
    return this.age < this.maxAge;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alpha = Math.max(0.3, 1 - (this.age / this.maxAge));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#90EE90';
    ctx.shadowColor = '#90EE90';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Simple neural network with 6 nodes for more complex behavior
class NeuralNetwork {
  activationType: ActivationType;
  activation: (x: number) => number;
  weights: number[][][];
  biases: number[][];

  constructor(activationType: ActivationType = 'sigmoid') {
    this.activationType = activationType;
    this.activation = activationFunctions[activationType];
    
    // Input layer (7 inputs) -> Hidden layer (8 nodes) -> Output layer (2 outputs)
    this.weights = [
      this.randomMatrix(7, 8), // input to hidden
      this.randomMatrix(8, 2)  // hidden to output
    ];
    this.biases = [
      this.randomArray(8), // hidden layer biases
      this.randomArray(2)  // output layer biases
    ];
  }

  randomMatrix(rows: number, cols: number) {
    return Array.from({ length: rows }, () => 
      Array.from({ length: cols }, () => (Math.random() - 0.5) * 2)
    );
  }

  randomArray(length: number) {
    return Array.from({ length }, () => (Math.random() - 0.5) * 2);
  }

  predict(inputs: number[]) {
    let layer = [...inputs];
    
    for (let i = 0; i < this.weights.length; i++) {
      const newLayer = [];
      for (let j = 0; j < this.weights[i][0].length; j++) {
        let sum = this.biases[i][j];
        for (let k = 0; k < layer.length; k++) {
          sum += layer[k] * this.weights[i][k][j];
        }
        newLayer.push(this.activation(sum));
      }
      layer = newLayer;
    }
    
    return layer;
  }

  mutate(rate = 0.08, strength = 0.2) {
    for (let i = 0; i < this.weights.length; i++) {
      for (let j = 0; j < this.weights[i].length; j++) {
        for (let k = 0; k < this.weights[i][j].length; k++) {
          if (Math.random() < rate) {
            this.weights[i][j][k] += (Math.random() - 0.5) * strength;
            this.weights[i][j][k] = Math.max(-3, Math.min(3, this.weights[i][j][k]));
          }
        }
      }
    }
    
    for (let i = 0; i < this.biases.length; i++) {
      for (let j = 0; j < this.biases[i].length; j++) {
        if (Math.random() < rate) {
          this.biases[i][j] += (Math.random() - 0.5) * strength;
          this.biases[i][j] = Math.max(-3, Math.min(3, this.biases[i][j]));
        }
      }
    }
  }

  copy() {
    const newNet = new NeuralNetwork(this.activationType);
    newNet.weights = this.weights.map(layer => 
      layer.map(row => [...row])
    );
    newNet.biases = this.biases.map(layer => [...layer]);
    return newNet;
  }
}

// Creature class with stricter survival requirements
class Creature {
  x: number;
  y: number;
  size: number;
  energy: number;
  maxEnergy: number;
  age: number;
  generation: number;
  maturityAge: number;
  lastReproduction: number;
  reproductionCooldown: number;
  activationType: ActivationType;
  brain: NeuralNetwork;
  color: string;
  vx: number;
  vy: number;
  id: string;
  survivabilityScore: number;
  hungerLevel: number;

  constructor(x: number, y: number, activationType: ActivationType) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 2 + 3;
    this.energy = 80;
    this.maxEnergy = 100;
    this.age = 0;
    this.generation = 0;
    this.maturityAge = 800 + Math.random() * 400; // Must mature before reproduction
    this.lastReproduction = 0;
    this.reproductionCooldown = 600; // Minimum time between reproductions
    this.activationType = activationType || activationNames[Math.floor(Math.random() * activationNames.length)];
    this.brain = new NeuralNetwork(this.activationType);
    this.color = this.getColorFromActivation();
    this.vx = 0;
    this.vy = 0;
    this.id = Math.random().toString(36).substr(2, 9);
    this.survivabilityScore = 0;
    this.hungerLevel = 0;
  }

  getColorFromActivation() {
    const colors: Record<ActivationType, string> = {
      sigmoid: '#ff6b6b',
      tanh: '#4ecdc4',
      relu: '#45b7d1',
      leaky_relu: '#96ceb4',
      linear: '#ffeaa7'
    };
    return colors[this.activationType] || '#ffffff';
  }

  getNearestFood(food: Food[]) {
    let nearest = null;
    let minDist = Infinity;
    
    for (const f of food) {
      const dx = this.x - f.x;
      const dy = this.y - f.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        nearest = f;
      }
    }
    
    return { food: nearest, distance: minDist };
  }

  getNearestCreature(creatures: Creature[]) {
    let nearest = null;
    let minDist = Infinity;
    
    for (const other of creatures) {
      if (other === this) continue;
      const dx = this.x - other.x;
      const dy = this.y - other.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        nearest = other;
      }
    }
    
    return { creature: nearest, distance: minDist };
  }

  update(creatures: Creature[], food: Food[], width: number, height: number) {
    const { food: nearestFood, distance: foodDistance } = this.getNearestFood(food);
    const { creature: nearest, distance: creatureDistance } = this.getNearestCreature(creatures);
    
    // Enhanced neural network inputs
    const inputs = [
      // Food information
      nearestFood ? Math.max(-1, Math.min(1, (nearestFood.x - this.x) / width)) : 0,
      nearestFood ? Math.max(-1, Math.min(1, (nearestFood.y - this.y) / height)) : 0,
      nearestFood ? Math.max(0, Math.min(1, 1 - (foodDistance / 100))) : 0,
      
      // Other creature information
      nearest ? Math.max(-1, Math.min(1, (nearest.x - this.x) / width)) : 0,
      nearest ? Math.max(-1, Math.min(1, (nearest.y - this.y) / height)) : 0,
      nearest ? Math.max(-1, Math.min(1, (nearest.size - this.size) / 10)) : 0,
      
      // Self information
      this.energy / this.maxEnergy
    ];

    const output = this.brain.predict(inputs);
    const angle = output[0] * Math.PI * 2;
    const speed = Math.abs(output[1]) * 1.2;
    
    const newVx = Math.cos(angle) * speed;
    const newVy = Math.sin(angle) * speed;
    
    this.vx = this.vx * 0.7 + newVx * 0.3;
    this.vy = this.vy * 0.7 + newVy * 0.3;
    
    this.x += this.vx;
    this.y += this.vy;

    // Strict boundaries - bounce off walls
    const margin = this.size;
    if (this.x <= margin) {
      this.x = margin;
      this.vx = Math.abs(this.vx);
    }
    if (this.x >= width - margin) {
      this.x = width - margin;
      this.vx = -Math.abs(this.vx);
    }
    if (this.y <= margin) {
      this.y = margin;
      this.vy = Math.abs(this.vy);
    }
    if (this.y >= height - margin) {
      this.y = height - margin;
      this.vy = -Math.abs(this.vy);
    }

    // Energy consumption - higher base cost for survival challenge
    const movementCost = Math.sqrt(this.vx * this.vx + this.vy * this.vy) * 0.03;
    const sizeCost = this.size * 0.008;
    const baseCost = 0.12; // Higher base metabolic cost
    this.energy -= baseCost + movementCost + sizeCost;
    
    this.age++;
    this.hungerLevel = Math.max(0, this.hungerLevel + 0.1);

    // Try to eat food
    for (let i = food.length - 1; i >= 0; i--) {
      const f = food[i];
      const dx = this.x - f.x;
      const dy = this.y - f.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < this.size + f.size) {
        this.energy = Math.min(this.maxEnergy, this.energy + f.nutritionValue);
        this.hungerLevel = Math.max(0, this.hungerLevel - 20);
        this.survivabilityScore += 10;
        food.splice(i, 1);
      }
    }

    // Predation - much more restricted
    for (const other of creatures) {
      if (other === this || other.energy <= 0) continue;
      
      const dx = this.x - other.x;
      const dy = this.y - other.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < (this.size + other.size) * 0.7) {
        if (this.size > other.size * 1.3 && this.energy > 50) { // Higher threshold
          this.energy = Math.min(this.maxEnergy * 1.1, this.energy + other.energy * 0.4);
          this.size += other.size * 0.02; // Much smaller growth
          this.survivabilityScore += 25;
          other.energy = 0;
        } else if (other.size > this.size * 1.3 && other.energy > 50) {
          // This creature gets eaten
          this.energy = 0;
        }
      }
    }
  }

  canReproduce() {
    return (
      this.age > this.maturityAge && // Must be mature
      this.energy > this.maxEnergy * 0.85 && // High energy requirement
      this.survivabilityScore > 100 && // Must have proven survival skills
      (this.age - this.lastReproduction) > this.reproductionCooldown && // Cooldown period
      this.hungerLevel < 30 // Not too hungry
    );
  }

  reproduce() {
    if (!this.canReproduce()) return null;
    
    const child = new Creature(
      this.x + (Math.random() - 0.5) * 40,
      this.y + (Math.random() - 0.5) * 40,
      this.activationType
    );
    
    child.brain = this.brain.copy();
    child.brain.mutate(0.1, 0.3);
    child.generation = this.generation + 1;
    child.size = this.size * 0.8;
    
    // High reproduction cost
    this.energy -= this.maxEnergy * 0.6;
    this.lastReproduction = this.age;
    this.survivabilityScore = Math.max(0, this.survivabilityScore - 50);
    
    return child;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.energy <= 0) return;
    
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Maturity indicator
    const alpha = this.age > this.maturityAge ? 1.0 : 0.6;
    
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.age > this.maturityAge ? 10 : 5;
    ctx.fillStyle = this.color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Maturity ring for adult creatures
    if (this.age > this.maturityAge) {
      ctx.strokeStyle = this.color;
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, this.size + 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.shadowBlur = 0;
    
    // Energy bar
    const energyRatio = this.energy / this.maxEnergy;
    ctx.fillStyle = energyRatio > 0.6 ? '#00ff00' : energyRatio > 0.3 ? '#ffff00' : '#ff0000';
    ctx.globalAlpha = 0.8;
    const barWidth = this.size * 2;
    const barHeight = 2;
    ctx.fillRect(-barWidth/2, -this.size - 10, barWidth * energyRatio, barHeight);
    
    // Age indicator (small dot)
    if (this.age > this.maturityAge) {
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(0, this.size - 2, 1, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
}

interface EcosystemStats {
  sigmoid: number;
  tanh: number;
  relu: number;
  leaky_relu: number;
  linear: number;
  avgGeneration: string;
  totalAlive: number;
  avgAge: string;
  foodCount: number;
  matureCreatures: number;
}

export default function NeuralEcosystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const creaturesRef = useRef<Creature[]>([]);
  const foodRef = useRef<Food[]>([]);
  const frameCountRef = useRef(0);
  
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<Partial<EcosystemStats>>({});

  const activationColors = useMemo(() => {
    const colors: Record<ActivationType, string> = {
      sigmoid: '#ff6b6b',
      tanh: '#4ecdc4', 
      relu: '#45b7d1',
      leaky_relu: '#96ceb4',
      linear: '#ffeaa7'
    };
    return colors;
  }, []);

  const initializeEcosystem = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Start with only 4 creatures
    const newCreatures: Creature[] = [];
    for (let i = 0; i < 4; i++) {
      const creature = new Creature(
        50 + Math.random() * (canvas.width - 100),
        50 + Math.random() * (canvas.height - 100),
        activationNames[i % activationNames.length]
      );
      newCreatures.push(creature);
    }
    creaturesRef.current = newCreatures;
    
    // Initialize food sources
    const initialFood: Food[] = [];
    for (let i = 0; i < 305; i++) {
      initialFood.push(new Food(
        20 + Math.random() * (canvas.width - 40),
        20 + Math.random() * (canvas.height - 40)
      ));
    }
    foodRef.current = initialFood;
  }, []);

  const updateStats = useCallback((creatureList: Creature[], foodList: Food[]) => {
    const activationStats: Record<ActivationType, number> = {
      sigmoid: 0,
      tanh: 0,
      relu: 0,
      leaky_relu: 0,
      linear: 0
    };
    
    activationNames.forEach(name => {
      activationStats[name] = creatureList.filter(c => c.activationType === name).length;
    });
    
    const avgGeneration = creatureList.length > 0 ? 
      creatureList.reduce((sum, c) => sum + c.generation, 0) / creatureList.length : 0;
    
    const avgAge = creatureList.length > 0 ?
      creatureList.reduce((sum, c) => sum + c.age, 0) / creatureList.length : 0;
    
    const matureCreatures = creatureList.filter(c => c.age > c.maturityAge).length;
    
    setStats({
      ...activationStats,
      avgGeneration: avgGeneration.toFixed(1),
      avgAge: avgAge.toFixed(0),
      totalAlive: creatureList.length,
      foodCount: foodList.length,
      matureCreatures
    });
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear with dark background
    ctx.fillStyle = 'rgba(5, 5, 5, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw boundaries
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
    
    const aliveCreatures = creaturesRef.current.filter(c => c.energy > 0);
    
    // Update creatures
    aliveCreatures.forEach(creature => {
      creature.update(aliveCreatures, foodRef.current, canvas.width, canvas.height);
    });
    
    // Food spawning - controlled rate for balance
    if (frameCountRef.current % 120 === 0 && foodRef.current.length < 25) {
      const newFood = new Food(
        30 + Math.random() * (canvas.width - 60),
        30 + Math.random() * (canvas.height - 60)
      );
      foodRef.current.push(newFood);
    }
    
    // Update and remove old food
    foodRef.current = foodRef.current.filter(food => food.update());
    
    // Reproduction - very selective
    if (frameCountRef.current % 180 === 0) { // Check every 3 seconds
      const reproducers = aliveCreatures.filter(c => c.canReproduce());
      const maxNewborns = Math.min(2, Math.max(0, 12 - aliveCreatures.length)); // Cap population
      
      for (let i = 0; i < Math.min(reproducers.length, maxNewborns); i++) {
        if (Math.random() < 0.3) { // Only 30% chance even if eligible
          const parent = reproducers[i];
          const child = parent.reproduce();
          if (child) {
            // Ensure child is within bounds
            child.x = Math.max(child.size, Math.min(canvas.width - child.size, child.x));
            child.y = Math.max(child.size, Math.min(canvas.height - child.size, child.y));
            creaturesRef.current.push(child);
          }
        }
      }
    }
    
    creaturesRef.current = aliveCreatures;
    
    // Draw food
    foodRef.current.forEach(food => {
      food.draw(ctx);
    });
    
    // Draw creatures
    creaturesRef.current.forEach(creature => {
      creature.draw(ctx);
    });
    
    // Update stats every 2 seconds
    if (frameCountRef.current % 120 === 0) {
      updateStats(creaturesRef.current, foodRef.current);
    }
    
    frameCountRef.current++;
    
    if (isRunning) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
  }, [isRunning, updateStats]);

  useEffect(() => {
    if (isRunning) {
      frameCountRef.current = 0;
      animationRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, gameLoop]);

  useEffect(() => {
    initializeEcosystem();
  }, [initializeEcosystem]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      canvas.width = Math.min(800, rect.width - 20);
      canvas.height = Math.min(600, (canvas.width * 3) / 4);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setTimeout(initializeEcosystem, 100);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-gray-900 rounded-lg">
      <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={toggleSimulation}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={resetSimulation}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
        
        <div className="flex gap-4 text-sm text-gray-300">
          <div className="flex items-center gap-1">
            <Users size={16} />
            Pop: {stats.totalAlive || 0}
          </div>
          <div className="flex items-center gap-1">
            <Activity size={16} />
            Mature: {stats.matureCreatures || 0}
          </div>
          <div>Food: {stats.foodCount || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border border-gray-700 rounded-lg bg-black w-full"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Settings size={16} />
              Population by Type
            </h3>
            <div className="space-y-2">
              {activationNames.map(name => (
                <div key={name} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full border border-gray-600"
                      style={{ backgroundColor: activationColors[name] }}
                    />
                    <span className="text-sm text-gray-300 capitalize">{name.replace('_', ' ')}</span>
                  </div>
                  <span className="text-sm font-mono text-white">
                    {stats[name] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3">Ecosystem Status</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Avg Generation:</span>
                <span className="text-white">{stats.avgGeneration || '0.0'}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Age:</span>
                <span className="text-white">{stats.avgAge || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span>Food Available:</span>
                <span className="text-green-400">{stats.foodCount || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Survival Rules</h3>
            <div className="text-xs text-gray-400 space-y-1">
              <p>• Start with 4 creatures in bounded area</p>
              <p>• Must find green food to survive</p>
              <p>• High energy cost for living</p>
              <p>• Must mature before reproduction</p>
              <p>• Reproduction requires high energy + survival score</p>
              <p>• Long cooldown between breeding</p>
              <p>• Predation only for much larger creatures</p>
              <p>• Limited food spawning for balance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}