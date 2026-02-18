// src/components/cs/agario/utils/feature-preprocessor.ts

/**
 * INTELLIGENT FEATURE ENGINEERING PREPROCESSOR (12 inputs → 12 outputs)
 *
 * Philosophy: Transform raw gradient inputs into more meaningful features while
 * preserving the same dimensionality for evolutionary stability.
 *
 * Now includes velocity/predictive inputs for smarter decision making!
 *
 * Key transformations:
 * 1. Combine correlated inputs into orthogonal features
 * 2. Add non-linearities where biologically relevant
 * 3. Create features with clearer semantic meaning
 * 4. Normalize to similar scales for better NN learning
 * 5. Incorporate velocity for prediction
 */

import { Blob, Food, Obstacle, TerrainBarrier } from '../config/agario.types';
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

  // Predictive inputs (2) - NEW! Enable anticipation
  threatImminence: number;         // How soon will threat reach us? (0-1)
  preyVulnerability: number;       // How catchable is prey? (0-1)

  // Internal state (3)
  metabolicBalance: number;        // Energy reserves vs metabolic cost (0-1)
  reproductivePotential: number;   // Ability + readiness to reproduce (0-1)
  movementEfficiency: number;      // Am I moving efficiently? (0-1)

  // Temporal (2)
  decisionConfidence: number;      // Clarity of best action (0-1)
  courseCorrection: number;        // Need to change direction? (-1 to 1)
}

// ===================== FEATURE ENGINEERING CLASS =====================

export class FeaturePreprocessor {
  private readonly epsilon = 0.001;
  
  constructor() {}
  
  /**
   * Transform 12 raw inputs into 12 engineered features
   */
  preprocess(
    blob: Blob,
    rawVision: number[],  // [attrDx, attrDy, attrStr, dangDx, dangDy, dangStr, threatVel, preyVel, massNorm, reproReady, speed, heading]
    currentTick: number
  ): number[] {
    const [
      attrDx, attrDy, attrStr,
      dangDx, dangDy, dangStr,
      threatVel, preyVel,
      massNorm, reproReady,
      mySpeed, headingAlignment
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
    const strategicUrgency = this.calculateStrategicUrgency(blob, attrStr, dangStr, massNorm, threatVel);
    const environmentalOpenness = this.calculateEnvironmentalOpenness(blob, dangStr);

    // 3. PREDICTIVE INPUTS (2 features) - NEW!
    const threatImminence = this.calculateThreatImminence(dangStr, threatVel);
    const preyVulnerability = this.calculatePreyVulnerability(attrStr, preyVel, mySpeed);

    // 4. INTERNAL STATE (3 features)
    const metabolicBalance = this.calculateMetabolicBalance(blob, massNorm);
    const reproductivePotential = this.calculateReproductivePotential(blob, massNorm, reproReady);
    const movementEfficiency = this.calculateMovementEfficiency(mySpeed, headingAlignment, attrStr, dangStr);

    // 5. TEMPORAL/COGNITIVE (2 features)
    const decisionConfidence = this.calculateDecisionConfidence(
      netMotivationX, netMotivationY,
      blob.vx, blob.vy,
      attrStr, dangStr
    );
    const courseCorrection = this.calculateCourseCorrection(headingAlignment, threatVel, preyVel);

    // Return all 12 engineered features
    return [
      netMotivationX,
      netMotivationY,
      threatOpportunityRatio,
      strategicUrgency,
      environmentalOpenness,
      threatImminence,
      preyVulnerability,
      metabolicBalance,
      reproductivePotential,
      movementEfficiency,
      decisionConfidence,
      courseCorrection
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
   * How urgently the blob needs to act (combines threat, opportunity, energy, and velocity)
   */
  private calculateStrategicUrgency(
    blob: Blob,
    attrStr: number,
    dangStr: number,
    massNorm: number,
    threatVel: number = 0
  ): number {
    // Base urgency from external signals
    const signalUrgency = Math.max(attrStr, dangStr);

    // Approaching threat increases urgency dramatically!
    const approachingThreatUrgency = threatVel > 0 ? threatVel * dangStr : 0;

    // Energy urgency (low mass = more urgent)
    const energyUrgency = 1 - massNorm;

    // Age-based urgency (old = more urgent to reproduce or find food)
    const ageUrgency = Math.min(blob.age / 2000, 1);

    // Idle urgency (not moving = bad)
    const idleUrgency = Math.min(blob.idleTicks / 100, 1);

    // Weighted combination - approaching threats get high priority!
    return Math.min(1,
      signalUrgency * 0.3 +
      approachingThreatUrgency * 0.25 +  // NEW: velocity matters!
      energyUrgency * 0.25 +
      ageUrgency * 0.1 +
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
   * 3a. Threat Imminence (NEW - PREDICTIVE!)
   * How soon will the threat reach us? Combines proximity and approach velocity
   * High value = threat is close AND approaching fast = URGENT!
   */
  private calculateThreatImminence(dangStr: number, threatVel: number): number {
    // If no danger, no imminence
    if (dangStr < 0.05) return 0;

    // threatVel > 0 means threat is approaching
    // threatVel < 0 means threat is retreating

    if (threatVel <= 0) {
      // Threat is stationary or retreating - lower imminence
      return dangStr * 0.3; // Still some danger from proximity
    }

    // Threat is approaching! Imminence = proximity × approach rate
    // This creates urgency for fast-approaching threats even if far away
    const imminence = dangStr * (0.5 + threatVel * 0.5);
    return Math.min(1, imminence);
  }

  /**
   * 3b. Prey Vulnerability (NEW - PREDICTIVE!)
   * How catchable is the prey? Combines proximity, their fleeing, and our speed
   * High value = prey is close, not fleeing fast, and we're fast = GOOD OPPORTUNITY
   */
  private calculatePreyVulnerability(attrStr: number, preyVel: number, mySpeed: number): number {
    // If no prey attraction, no vulnerability to exploit
    if (attrStr < 0.05) return 0;

    // preyVel > 0 means prey is approaching us (easy catch!)
    // preyVel < 0 means prey is fleeing (harder to catch)

    // Base vulnerability from proximity
    let vulnerability = attrStr;

    // Fleeing prey is harder to catch
    if (preyVel < 0) {
      // Reduce vulnerability based on how fast they're fleeing
      vulnerability *= (1 + preyVel); // preyVel is negative, so this reduces
    } else {
      // Approaching prey is easier to catch!
      vulnerability *= (1 + preyVel * 0.5);
    }

    // Our speed helps catch fleeing prey
    vulnerability *= (0.5 + mySpeed * 0.5);

    return Math.min(1, Math.max(0, vulnerability));
  }

  /**
   * 3c. Metabolic Balance
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
   * 4a. Movement Efficiency (NEW!)
   * Are we moving efficiently toward our goal?
   */
  private calculateMovementEfficiency(
    mySpeed: number,
    headingAlignment: number,
    attrStr: number,
    dangStr: number
  ): number {
    // If no signals, can't measure efficiency
    const totalSignal = attrStr + dangStr;
    if (totalSignal < 0.1) return 0.5; // Neutral

    // Efficiency = speed × alignment with goal
    // High speed + good alignment = efficient
    // High speed + bad alignment = wasted energy
    // Low speed + any alignment = inefficient

    const efficiency = mySpeed * ((headingAlignment + 1) / 2);
    return Math.min(1, efficiency);
  }

  /**
   * 4b. Decision Confidence
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
   * 4c. Course Correction (NEW!)
   * Do we need to change direction?
   * Positive = need to turn toward opportunity
   * Negative = need to turn away from danger
   */
  private calculateCourseCorrection(
    headingAlignment: number,
    threatVel: number,
    preyVel: number
  ): number {
    // If we're already well-aligned, no correction needed
    if (headingAlignment > 0.5) return 0;

    // If threat is approaching and we're not fleeing properly, need correction
    if (threatVel > 0.3 && headingAlignment < 0) {
      return -1; // Strong need to turn away!
    }

    // If prey is fleeing and we're not chasing properly, need correction
    if (preyVel < -0.3 && headingAlignment < 0.3) {
      return 0.7; // Need to turn toward prey
    }

    // General course correction based on alignment
    return -headingAlignment; // Turn toward better alignment
  }

  /**
   * Get feature labels for visualization
   */
  static getFeatureLabels(): string[] {
    return [
      'NetMotX',      // 0: Combined motivation X direction
      'NetMotY',      // 1: Combined motivation Y direction
      'ThreatOpp',    // 2: Threat vs opportunity balance
      'Urgency',      // 3: Strategic urgency
      'Openness',     // 4: Environmental openness
      'Imminence',    // 5: Threat imminence (PREDICTIVE)
      'Vulnerable',   // 6: Prey vulnerability (PREDICTIVE)
      'Metabolism',   // 7: Metabolic balance
      'ReproPot',     // 8: Reproductive potential
      'MoveEff',      // 9: Movement efficiency
      'Confidence',   // 10: Decision confidence
      'Course'        // 11: Course correction needed
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
  preprocessor: FeaturePreprocessor,
  barriers: TerrainBarrier[] = []  // Non-lethal terrain for navigation challenges
): number[] => {
  // Get raw gradient vision (12 inputs, including barrier sensing)
  const rawVision = getVisionGradient(
    blob, blobs, food, obstacles, getNearbyFood, currentTick, worldWidth, worldHeight, barriers
  );

  // Apply feature engineering (12 inputs → 12 better inputs)
  return preprocessor.preprocess(blob, rawVision, currentTick);
};

/**
 * Factory function to create preprocessor and integrated vision system
 */
export function createEngineeredVisionSystem() {
  const preprocessor = new FeaturePreprocessor();

  return {
    preprocessor,

    // Vision function that maintains 12 inputs (now with barrier sensing)
    getVision: (
      blob: Blob,
      blobs: Blob[],
      food: Food[],
      obstacles: Obstacle[],
      getNearbyFood: (x: number, y: number, range: number) => Food[],
      currentTick: number,
      worldWidth: number,
      worldHeight: number,
      barriers: TerrainBarrier[] = []  // Non-lethal terrain for navigation
    ): number[] => {
      return getEngineeredVision(
        blob, blobs, food, obstacles, getNearbyFood,
        currentTick, worldWidth, worldHeight, preprocessor, barriers
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