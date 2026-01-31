// src/components/cs/agario/utils/feature-preprocessor.ts

/**
 * INTELLIGENT FEATURE ENGINEERING PREPROCESSOR (8 inputs → 8 outputs)
 * 
 * Philosophy: Transform raw gradient inputs into more meaningful features while
 * preserving the same dimensionality for evolutionary stability.
 * 
 * Key transformations:
 * 1. Combine correlated inputs into orthogonal features
 * 2. Add non-linearities where biologically relevant
 * 3. Create features with clearer semantic meaning
 * 4. Normalize to similar scales for better NN learning
 */

import { Blob, Food, Obstacle } from '../config/agario.types';
import { getVisionGradient } from './vision';

// ===================== FEATURE ENGINEERING TYPES =====================

export interface EngineeredFeatures {
  // Combined directional motivation (2)
  netMotivationX: number;     // Weighted direction (-1 to 1)
  netMotivationY: number;     // Weighted direction (-1 to 1)
  
  // Strategic assessment (3)
  threatOpportunityRatio: number;  // Balance between danger and reward (0-1)
  strategicUrgency: number;        // How urgent to act (0-1)
  environmentalOpenness: number;   // Space to maneuver (0-1)
  
  // Internal state (2)
  metabolicBalance: number;        // Energy reserves vs metabolic cost (0-1)
  reproductivePotential: number;   // Ability + readiness to reproduce (0-1)
  
  // Temporal (1)
  decisionConfidence: number;      // Clarity of best action (0-1)
}

// ===================== FEATURE ENGINEERING CLASS =====================

export class FeaturePreprocessor {
  private readonly epsilon = 0.001;
  
  constructor() {}
  
  /**
   * Transform 8 raw inputs into 8 engineered features
   */
  preprocess(
    blob: Blob,
    rawVision: number[],  // [attrDx, attrDy, attrStr, dangDx, dangDy, dangStr, massNorm, reproReady]
    currentTick: number
  ): number[] {
    const [
      attrDx, attrDy, attrStr,
      dangDx, dangDy, dangStr,
      massNorm, reproReady
    ] = rawVision;
    
    // ===================== ENGINEERED FEATURES =====================
    
    // 1. NET MOTIVATION VECTOR (2 features)
    // Combine attraction and danger into a single weighted direction
    const { netMotivationX, netMotivationY } = this.calculateNetMotivation(
      attrDx, attrDy, attrStr,
      dangDx, dangDy, dangStr
    );
    
    // 2. STRATEGIC ASSESSMENT (3 features)
    const threatOpportunityRatio = this.calculateThreatOpportunityRatio(attrStr, dangStr);
    const strategicUrgency = this.calculateStrategicUrgency(blob, attrStr, dangStr, massNorm);
    const environmentalOpenness = this.calculateEnvironmentalOpenness(blob, dangStr);
    
    // 3. INTERNAL STATE (2 features)
    const metabolicBalance = this.calculateMetabolicBalance(blob, massNorm);
    const reproductivePotential = this.calculateReproductivePotential(blob, massNorm, reproReady);
    
    // 4. TEMPORAL/COGNITIVE (1 feature)
    const decisionConfidence = this.calculateDecisionConfidence(
      netMotivationX, netMotivationY,
      blob.vx, blob.vy,
      attrStr, dangStr
    );
    
    // Return all 8 engineered features
    return [
      netMotivationX,
      netMotivationY,
      threatOpportunityRatio,
      strategicUrgency,
      environmentalOpenness,
      metabolicBalance,
      reproductivePotential,
      decisionConfidence
    ];
  }
  
  /**
   * 1. Net Motivation Vector (2 features)
   * Combines attraction and danger into a single weighted direction vector
   */
  private calculateNetMotivation(
    attrDx: number, attrDy: number, attrStr: number,
    dangDx: number, dangDy: number, dangStr: number
  ): { netMotivationX: number, netMotivationY: number } {
    // Danger is repulsive, so we invert its direction
    const weightedAttractionX = attrDx * attrStr;
    const weightedAttractionY = attrDy * attrStr;
    const weightedDangerX = -dangDx * dangStr;  // Inverted for repulsion
    const weightedDangerY = -dangDy * dangStr;  // Inverted for repulsion
    
    // Combine weighted vectors
    const netX = weightedAttractionX + weightedDangerX;
    const netY = weightedAttractionY + weightedDangerY;
    
    // Normalize to unit vector
    const magnitude = Math.sqrt(netX * netX + netY * netY);
    
    if (magnitude < this.epsilon) {
      return { netMotivationX: 0, netMotivationY: 0 };
    }
    
    // Soft-normalization: preserves some magnitude information
    // but keeps values in reasonable range
    const normalizedMagnitude = Math.tanh(magnitude);
    
    return {
      netMotivationX: (netX / magnitude) * normalizedMagnitude,
      netMotivationY: (netY / magnitude) * normalizedMagnitude
    };
  }
  
  /**
   * 2a. Threat-Opportunity Ratio
   * 0 = pure opportunity, 1 = pure threat, 0.5 = balanced
   */
  private calculateThreatOpportunityRatio(attrStr: number, dangStr: number): number {
    const totalSignal = attrStr + dangStr + this.epsilon;
    return dangStr / totalSignal;  // Higher = more threat-dominated
  }
  
  /**
   * 2b. Strategic Urgency
   * How urgently the blob needs to act (combines threat, opportunity, and energy)
   */
  private calculateStrategicUrgency(
    blob: Blob,
    attrStr: number,
    dangStr: number,
    massNorm: number
  ): number {
    // Base urgency from external signals
    const signalUrgency = Math.max(attrStr, dangStr);
    
    // Energy urgency (low mass = more urgent)
    const energyUrgency = 1 - massNorm;
    
    // Age-based urgency (old = more urgent to reproduce or find food)
    const ageUrgency = Math.min(blob.age / 2000, 1);
    
    // Idle urgency (not moving = bad)
    const idleUrgency = Math.min(blob.idleTicks / 100, 1);
    
    // Weighted combination
    return Math.min(1,
      signalUrgency * 0.4 +
      energyUrgency * 0.3 +
      ageUrgency * 0.2 +
      idleUrgency * 0.1
    );
  }
  
  /**
   * 2c. Environmental Openness
   * How much space to maneuver (based on danger proximity and mass)
   */
  private calculateEnvironmentalOpenness(blob: Blob, dangStr: number): number {
    // More danger = less open space
    const dangerCloseness = dangStr;
    
    // Bigger blobs perceive space as more constrained
    const sizeConstraint = Math.min(blob.mass / 100, 1);
    
    // Combine (more danger OR larger size = less open)
    const constraint = Math.max(dangerCloseness, sizeConstraint);
    
    return 1 - constraint;
  }
  
  /**
   * 3a. Metabolic Balance
   * Energy reserves vs metabolic demands (age, idle)
   */
  private calculateMetabolicBalance(blob: Blob, massNorm: number): number {
    // Energy reserves (mass)
    const reserves = massNorm;
    
    // Metabolic costs (age + idle)
    const ageCost = Math.min(blob.age / 3000, 1);
    const idleCost = Math.min(blob.idleTicks / 150, 1);
    const costs = (ageCost + idleCost) / 2;
    
    // Balance: reserves minus costs, normalized
    const balance = reserves - costs * 0.5;  // Costs weigh less
    return (balance + 1) / 2;  // Map to 0-1 range
  }
  
  /**
   * 3b. Reproductive Potential
   * Combines mass, readiness, age, and kills into single metric
   */
  private calculateReproductivePotential(
    blob: Blob,
    massNorm: number,
    reproReady: number
  ): number {
    // Mass suitability (logistic curve around optimal mass)
    const optimalMass = 0.6;  // Normalized mass ~= 30-40
    const massSuitability = Math.exp(-Math.pow((massNorm - optimalMass) * 3, 2));
    
    // Age suitability (young adults best)
    const age = Math.min(blob.age / 1000, 1);
    const ageSuitability = Math.exp(-Math.pow((age - 0.3) * 3, 2));
    
    // Experience bonus (successful hunters)
    const experience = Math.min(blob.kills / 10, 1);
    
    // Weighted combination
    return Math.min(1,
      reproReady * 0.4 +
      massSuitability * 0.3 +
      ageSuitability * 0.2 +
      experience * 0.1
    );
  }
  
  /**
   * 4. Decision Confidence
   * How clear the optimal action is (combines signal clarity and movement alignment)
   */
  private calculateDecisionConfidence(
    netMotivationX: number, netMotivationY: number,
    velocityX: number, velocityY: number,
    attrStr: number, dangStr: number
  ): number {
    // Signal clarity (are signals strong and consistent?)
    const totalSignal = attrStr + dangStr;
    const signalClarity = totalSignal > 0.1 ? 
      Math.abs(attrStr - dangStr) / totalSignal : 0;
    
    // Movement alignment (is current movement aligned with motivation?)
    const currentSpeed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    let alignment = 0;
    
    if (currentSpeed > 0.1 && (netMotivationX !== 0 || netMotivationY !== 0)) {
      const currentDirX = velocityX / currentSpeed;
      const currentDirY = velocityY / currentSpeed;
      const dotProduct = currentDirX * netMotivationX + currentDirY * netMotivationY;
      alignment = (dotProduct + 1) / 2;  // Map from [-1, 1] to [0, 1]
    }
    
    // Combined confidence
    return Math.min(1,
      signalClarity * 0.6 +
      alignment * 0.4
    );
  }
  
  /**
   * Get feature labels for visualization
   */
  static getFeatureLabels(): string[] {
    return [
      'NetMotX',      // Combined motivation X direction
      'NetMotY',      // Combined motivation Y direction
      'ThreatOpp',    // Threat vs opportunity balance
      'Urgency',      // Strategic urgency
      'Openness',     // Environmental openness
      'Metabolism',   // Metabolic balance
      'ReproPot',     // Reproductive potential
      'Confidence'    // Decision confidence
    ];
  }
  
  /**
   * Helper: Calculate magnitude of vector
   */
  private magnitude(x: number, y: number): number {
    return Math.sqrt(x * x + y * y);
  }
  
  /**
   * Helper: Sigmoid function for smooth normalization
   */
  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }
}

// ===================== INTEGRATION UTILITIES =====================

/**
 * Integrated vision + feature preprocessing function
 * Maintains same 8 inputs but transforms them to be more useful
 */
export const getEngineeredVision = (
  blob: Blob,
  blobs: Blob[],
  food: Food[],
  obstacles: Obstacle[],
  getNearbyFood: (x: number, y: number, range: number) => Food[],
  currentTick: number,
  worldWidth: number,
  worldHeight: number,
  preprocessor: FeaturePreprocessor
): number[] => {
  // Get raw gradient vision (8 inputs)
  const rawVision = getVisionGradient(
    blob, blobs, food, obstacles, getNearbyFood, currentTick, worldWidth, worldHeight
  );
  
  // Apply feature engineering (8 inputs → 8 better inputs)
  return preprocessor.preprocess(blob, rawVision, currentTick);
};

/**
 * Factory function to create preprocessor and integrated vision system
 */
export function createEngineeredVisionSystem() {
  const preprocessor = new FeaturePreprocessor();
  
  return {
    preprocessor,
    
    // Vision function that maintains 8 inputs
    getVision: (
      blob: Blob,
      blobs: Blob[],
      food: Food[],
      obstacles: Obstacle[],
      getNearbyFood: (x: number, y: number, range: number) => Food[],
      currentTick: number,
      worldWidth: number,
      worldHeight: number
    ): number[] => {
      return getEngineeredVision(
        blob, blobs, food, obstacles, getNearbyFood,
        currentTick, worldWidth, worldHeight, preprocessor
      );
    },
    
    // Feature labels for visualization
    getFeatureLabels: () => FeaturePreprocessor.getFeatureLabels(),
    
    // No cleanup needed for this stateless preprocessor
  };
}

// ===================== INTEGRATION WITH SIMULATION =====================

/**
 * Quick integration guide for simulation-optimized.ts:
 * 
 * 1. At top of file, import:
 *    import { createEngineeredVisionSystem } from './feature-preprocessor';
 * 
 * 2. In simulation setup, create vision system:
 *    const visionSystem = createEngineeredVisionSystem();
 * 
 * 3. Update getVision function passed to simulateBlob:
 *    const getVision = (blob: Blob) => 
 *      visionSystem.getVision(blob, blobs, food, obstacles, 
 *        getNearbyFood, tick, WORLD_WIDTH, WORLD_HEIGHT);
 * 
 * 4. That's it! Same 8 inputs, but much better features.
 * 
 * Benefits of engineered features:
 * - NetMotX/Y: Single direction vector (easier to interpret)
 * - ThreatOpp: Explicit threat/reward balance (was implicit)
 * - Urgency: Combines multiple urgency signals
 * - Openness: Space awareness (was missing)
 * - Metabolism: Energy management (combines mass + age + idle)
 * - ReproPot: Unified reproductive fitness
 * - Confidence: Decision clarity (helps with exploration/exploitation)
 * 
 * Evolutionary advantages:
 * - Same 8 inputs → no NEAT topology changes needed
 * - Features are more orthogonal → faster evolution
 * - Clearer semantic meaning → easier for networks to specialize
 * - Non-linearities where biologically relevant → better emergent behaviors
 */