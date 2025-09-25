// np.signal-processor.tsx - Fixed version with controlled re-renders
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Activity, Cpu, Zap, BarChart3, Radio, Waves, AlertTriangle, TrendingUp } from 'lucide-react';
import {
    ComplexNumber,
    OFDMParameters,
    Channel,
    Agent,
    Train,
    TransmissionMetrics
} from './np.types';

// Utility function to serialize objects for Web Worker
const serializeForWorker = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'function') return null; // Remove functions
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
        return obj.map(serializeForWorker).filter(item => item !== null);
    }

    const serialized: any = {};
    for (const [key, value] of Object.entries(obj)) {
        const serializedValue = serializeForWorker(value);
        if (serializedValue !== null) {
            serialized[key] = serializedValue;
        }
    }
    return serialized;
};

// Enhanced Web Worker for train station-specific DSP operations
const createTrainStationSignalWorker = () => {
    const workerCode = `
        // FFT implementation optimized for OFDM
        function fft(samples) {
            if (samples.length <= 1) return samples;
            
            const N = samples.length;
            if (N % 2 !== 0) {
                // Handle non-power-of-2 sizes with DFT fallback
                return dft(samples);
            }
            
            const even = fft(samples.filter((_, i) => i % 2 === 0));
            const odd = fft(samples.filter((_, i) => i % 2 === 1));
            const result = new Array(N);
            
            for (let k = 0; k < N / 2; k++) {
                const angle = -2 * Math.PI * k / N;
                const twiddle = { real: Math.cos(angle), imag: Math.sin(angle) };
                const t = {
                    real: twiddle.real * odd[k].real - twiddle.imag * odd[k].imag,
                    imag: twiddle.real * odd[k].imag + twiddle.imag * odd[k].real
                };
                
                result[k] = { 
                    real: even[k].real + t.real, 
                    imag: even[k].imag + t.imag 
                };
                result[k + N / 2] = { 
                    real: even[k].real - t.real, 
                    imag: even[k].imag - t.imag 
                };
            }
            
            return result;
        }
        
        function dft(samples) {
            const N = samples.length;
            const result = new Array(N);
            
            for (let k = 0; k < N; k++) {
                let real = 0, imag = 0;
                for (let n = 0; n < N; n++) {
                    const angle = -2 * Math.PI * k * n / N;
                    real += samples[n].real * Math.cos(angle) - samples[n].imag * Math.sin(angle);
                    imag += samples[n].real * Math.sin(angle) + samples[n].imag * Math.cos(angle);
                }
                result[k] = { real, imag };
            }
            
            return result;
        }
        
        function ifft(samples) {
            // Conjugate, FFT, conjugate, scale
            const conjugated = samples.map(s => ({ real: s.real, imag: -s.imag }));
            const result = fft(conjugated);
            const N = samples.length;
            
            return result.map(s => ({
                real: s.real / N,
                imag: -s.imag / N
            }));
        }
        
        // Recreate noise function in worker
        function calculateNoisePower(snr) {
            return Math.pow(10, -snr / 10);
        }
        
        // Train station specific channel modeling
        function applyTrainStationChannel(signal, channelParams, agentData) {
            const { snr, dopplerShift, multipath, agentType, trainVelocity, platformReflections } = channelParams;
            const processed = [...signal];
            
            // Apply Doppler effects for train passengers
            if (agentType === 'train_passenger' && Math.abs(dopplerShift || 0) > 1) {
                const dopplerPhase = 2 * Math.PI * (dopplerShift || 0) * 0.001; // 1ms symbol duration
                const cosPhase = Math.cos(dopplerPhase);
                const sinPhase = Math.sin(dopplerPhase);
                
                for (let i = 0; i < processed.length; i++) {
                    const original = processed[i];
                    processed[i] = {
                        real: original.real * cosPhase - original.imag * sinPhase,
                        imag: original.real * sinPhase + original.imag * cosPhase
                    };
                }
            }
            
            // Apply multipath from train metal structure
            if (agentType === 'train_passenger' && multipath && multipath.length > 0) {
                multipath.forEach(path => {
                    const delayedSamples = Math.floor((path.delay || 0) * 1000); // Convert to samples
                    const pathGain = path.amplitude || 0;
                    
                    for (let i = delayedSamples; i < processed.length; i++) {
                        processed[i].real += signal[i - delayedSamples].real * pathGain;
                        processed[i].imag += signal[i - delayedSamples].imag * pathGain;
                    }
                });
            }
            
            // Platform reflections for stationary passengers
            if (agentType === 'platform_passenger' && platformReflections) {
                const reflectionDelay = 5; // samples
                const reflectionGain = 0.3;
                
                for (let i = reflectionDelay; i < processed.length; i++) {
                    processed[i].real += signal[i - reflectionDelay].real * reflectionGain;
                    processed[i].imag += signal[i - reflectionDelay].imag * reflectionGain;
                }
            }
            
            // Add AWGN noise using recreated function
            const noisePower = calculateNoisePower(snr || 20);
            for (let i = 0; i < processed.length; i++) {
                processed[i].real += (Math.random() - 0.5) * Math.sqrt(noisePower);
                processed[i].imag += (Math.random() - 0.5) * Math.sqrt(noisePower);
            }
            
            // Simulate interference from other agents
            if (agentData && agentData.interferingAgents) {
                agentData.interferingAgents.forEach(interferer => {
                    const interferenceLevel = (interferer.power || 0) * (interferer.distance_factor || 1);
                    for (let i = 0; i < processed.length; i++) {
                        processed[i].real += (Math.random() - 0.5) * interferenceLevel;
                        processed[i].imag += (Math.random() - 0.5) * interferenceLevel;
                    }
                });
            }
            
            return processed;
        }
        
        function processTrainStationOFDM(data) {
            const startTime = performance.now();
            const { inputData, params, channel, agents, transmissionId } = data;
            
            try {
                // Step 1: Channel coding with error correction for mobility
                const codedBits = channelEncode(inputData.bits, params.coding || {}, channel.snr || 20);
                
                // Step 2: Adaptive modulation based on channel quality
                const modulation = selectModulation(channel.snr || 20, channel.dopplerShift || 0);
                const symbols = modulate(codedBits, modulation);
                
                // Step 3: Pilot insertion for channel estimation (critical for mobile)
                const symbolsWithPilots = insertPilots(symbols, params);
                
                // Step 4: Subcarrier mapping with interference avoidance
                const subcarrierData = mapToSubcarriers(symbolsWithPilots, params, agents || []);
                
                // Step 5: IFFT processing
                const timeDomain = ifft(subcarrierData);
                
                // Step 6: Add cyclic prefix (adaptive length for multipath)
                const cpLength = adaptiveCyclicPrefix(channel.multipath || [], params.cyclicPrefixLength || 16);
                const withCP = addCyclicPrefix(timeDomain, cpLength);
                
                // Step 7: Apply train station channel effects
                const agentData = (agents || []).find(a => a.id === transmissionId) || {};
                const channelParams = {
                    ...channel,
                    agentType: agentData.type,
                    trainVelocity: agentData.velocity,
                    platformReflections: agentData.type === 'platform_passenger'
                };
                
                const channelOutput = applyTrainStationChannel(withCP, channelParams, {
                    interferingAgents: (agents || []).filter(a => a.id !== transmissionId && a.isTransmitting)
                });
                
                // Step 8: Receiver processing (remove CP, FFT, channel estimation)
                const receivedSymbol = receiverProcessing(channelOutput, params, channelParams);
                
                const processingTime = performance.now() - startTime;
                
                // Calculate detailed metrics
                const metrics = calculateMetrics(inputData, receivedSymbol, processingTime, channel);
                
                return {
                    success: true,
                    result: {
                        timeDomainSamples: withCP,
                        frequencyDomainSamples: subcarrierData,
                        receivedSamples: channelOutput,
                        decodedBits: receivedSymbol.decodedBits || [],
                        channelResponse: receivedSymbol.channelEstimate || [],
                        symbolErrorRate: metrics.symbolErrorRate,
                        papr: calculatePAPR(withCP),
                        processingMetrics: metrics
                    },
                    processingTime
                };
                
            } catch (error) {
                return {
                    success: false,
                    error: error.message,
                    processingTime: performance.now() - startTime
                };
            }
        }
        
        function selectModulation(snr, dopplerShift) {
            // Adaptive modulation based on channel quality
            const dopplerPenalty = Math.abs(dopplerShift) / 100; // Reduce order for high Doppler
            const effectiveSNR = snr - dopplerPenalty;
            
            if (effectiveSNR > 30) return { type: '256qam', bitsPerSymbol: 8 };
            if (effectiveSNR > 25) return { type: '64qam', bitsPerSymbol: 6 };
            if (effectiveSNR > 20) return { type: '16qam', bitsPerSymbol: 4 };
            if (effectiveSNR > 15) return { type: 'qpsk', bitsPerSymbol: 2 };
            return { type: 'bpsk', bitsPerSymbol: 1 };
        }
        
        function insertPilots(symbols, params) {
            // Insert pilot symbols for channel estimation
            const pilotSpacing = Math.floor((params.numSubcarriers || 256) / 20); // Every 20th subcarrier
            const pilotValue = { real: 1, imag: 0 }; // BPSK pilot
            
            const withPilots = [];
            for (let i = 0; i < symbols.length; i++) {
                withPilots.push(symbols[i]);
                if (i % pilotSpacing === 0) {
                    withPilots.push(pilotValue);
                }
            }
            
            return withPilots;
        }
        
        function adaptiveCyclicPrefix(multipath, defaultCP) {
            // Increase CP length if strong multipath detected
            const maxDelay = multipath.reduce((max, path) => Math.max(max, path.delay || 0), 0);
            const requiredCP = Math.ceil(maxDelay * 1000) + 10; // Convert to samples + margin
            return Math.max(defaultCP, requiredCP);
        }
        
        function receiverProcessing(received, params, channel) {
            // Remove cyclic prefix
            const cpLength = params.cyclicPrefixLength || 16;
            const withoutCP = received.slice(cpLength);
            
            // FFT
            const freqDomain = fft(withoutCP);
            
            // Channel estimation using pilots
            const channelEstimate = estimateChannel(freqDomain, params);
            
            // Channel equalization
            const equalized = equalizeChannel(freqDomain, channelEstimate);
            
            // Demodulation and decoding
            const decodedBits = demodulateAndDecode(equalized, params);
            
            return {
                channelEstimate,
                decodedBits,
                equalizedSymbols: equalized
            };
        }
        
        function estimateChannel(freqDomain, params) {
            // Simplified channel estimation using pilot symbols
            const estimate = new Array(freqDomain.length);
            const pilotSpacing = Math.floor((params.numSubcarriers || 256) / 20);
            
            for (let i = 0; i < freqDomain.length; i++) {
                if (i % pilotSpacing === 0) {
                    // At pilot location - direct estimation
                    estimate[i] = { ...freqDomain[i] };
                } else {
                    // Interpolate between pilots
                    const prevPilot = Math.floor(i / pilotSpacing) * pilotSpacing;
                    const nextPilot = (Math.floor(i / pilotSpacing) + 1) * pilotSpacing;
                    const weight = (i - prevPilot) / pilotSpacing;
                    
                    if (nextPilot < freqDomain.length && estimate[prevPilot]) {
                        estimate[i] = {
                            real: estimate[prevPilot].real * (1 - weight) + (estimate[nextPilot]?.real || 0) * weight,
                            imag: estimate[prevPilot].imag * (1 - weight) + (estimate[nextPilot]?.imag || 0) * weight
                        };
                    } else {
                        estimate[i] = { real: 1, imag: 0 };
                    }
                }
            }
            
            return estimate;
        }
        
        function equalizeChannel(received, channelEstimate) {
            // Zero-forcing equalization
            return received.map((symbol, i) => {
                const h = channelEstimate[i] || { real: 1, imag: 0 };
                const hMagnitudeSquared = h.real * h.real + h.imag * h.imag;
                
                if (hMagnitudeSquared < 0.01) {
                    // Avoid division by zero
                    return { real: 0, imag: 0 };
                }
                
                return {
                    real: (symbol.real * h.real + symbol.imag * h.imag) / hMagnitudeSquared,
                    imag: (symbol.imag * h.real - symbol.real * h.imag) / hMagnitudeSquared
                };
            });
        }
        
        function calculatePAPR(signal) {
            let peakPower = 0;
            let avgPower = 0;
            
            for (const sample of signal) {
                const power = sample.real * sample.real + sample.imag * sample.imag;
                peakPower = Math.max(peakPower, power);
                avgPower += power;
            }
            
            avgPower /= signal.length;
            return 10 * Math.log10(peakPower / avgPower);
        }
        
        function calculateMetrics(input, output, processingTime, channel) {
            // Calculate various performance metrics
            const bitErrors = countBitErrors(input.bits, output.decodedBits || []);
            const ber = bitErrors / input.bits.length;
            
            return {
                processingTime,
                bitErrorRate: ber,
                symbolErrorRate: ber * 6, // Approximate for 64-QAM
                throughput: (input.bits.length / processingTime) * 1000, // bits/second
                snrEffective: (channel.snr || 20) - (channel.dopplerShift ? Math.abs(channel.dopplerShift) / 50 : 0),
                spectralEfficiency: input.bits.length / (channel.bandwidth || 20000000) || 6,
                channelCapacity: Math.log2(1 + Math.pow(10, (channel.snr || 20) / 10)) // Shannon capacity
            };
        }
        
        function countBitErrors(original, received) {
            if (!received || received.length === 0) return original.length;
            
            let errors = 0;
            const minLength = Math.min(original.length, received.length);
            
            for (let i = 0; i < minLength; i++) {
                if (original[i] !== received[i]) {
                    errors++;
                }
            }
            
            // Count missing/extra bits as errors
            errors += Math.abs(original.length - received.length);
            
            return errors;
        }
        
        // Helper functions (implementations from previous worker)
        function channelEncode(bits, coding, snr) {
            const codeRate = coding.codeRate || 0.5;
            const redundancy = 1 - codeRate;
            const codedLength = Math.floor(bits.length / codeRate);
            const coded = new Array(codedLength);
            
            for (let i = 0; i < bits.length; i++) {
                coded[i] = bits[i];
            }
            
            // Add stronger coding for poor channel conditions
            const parityStrength = snr < 20 ? 2 : 1;
            for (let i = bits.length; i < codedLength; i++) {
                coded[i] = coded[(i * parityStrength) % bits.length];
            }
            
            return coded;
        }
        
        function modulate(bits, modulation) {
            const symbols = [];
            const bitsPerSymbol = modulation.bitsPerSymbol;
            
            for (let i = 0; i < bits.length; i += bitsPerSymbol) {
                const symbolBits = bits.slice(i, i + bitsPerSymbol);
                const symbolValue = symbolBits.reduce((acc, bit, idx) => 
                    acc + (bit << (bitsPerSymbol - 1 - idx)), 0);
                
                const constellation = getConstellationPoint(symbolValue, modulation.type);
                symbols.push(constellation);
            }
            
            return symbols;
        }
        
        function mapToSubcarriers(symbols, params, agents) {
            const fftSize = params.fftSize || 256;
            const subcarriers = new Array(fftSize).fill({ real: 0, imag: 0 });
            const dataSubcarriers = params.numSubcarriers || fftSize;
            const startIndex = Math.floor((fftSize - dataSubcarriers) / 2);
            
            // Avoid interfered subcarriers
            const interferredBins = new Set();
            if (agents) {
                agents.forEach(agent => {
                    if (agent.isTransmitting && (agent.interferenceLevel || 0) > 0.5) {
                        const centerBin = Math.floor(fftSize * 0.5);
                        const interfereBins = 10;
                        for (let i = -interfereBins; i <= interfereBins; i++) {
                            interferredBins.add(centerBin + i);
                        }
                    }
                });
            }
            
            let symbolIndex = 0;
            for (let i = 0; i < dataSubcarriers && symbolIndex < symbols.length; i++) {
                const binIndex = startIndex + i;
                if (!interferredBins.has(binIndex)) {
                    subcarriers[binIndex] = symbols[symbolIndex++];
                }
            }
            
            return subcarriers;
        }
        
        function getConstellationPoint(value, modulationType) {
            switch (modulationType) {
                case 'bpsk':
                    return { real: value === 0 ? -1 : 1, imag: 0 };
                case 'qpsk':
                    const qpskMap = [
                        { real: -0.707, imag: -0.707 }, { real: -0.707, imag: 0.707 },
                        { real: 0.707, imag: -0.707 }, { real: 0.707, imag: 0.707 }
                    ];
                    return qpskMap[value % 4];
                case '16qam':
                    const x = ((value % 4) - 1.5) * 2 / 3;
                    const y = (Math.floor(value / 4) - 1.5) * 2 / 3;
                    return { real: x, imag: y };
                case '64qam':
                    const i = (value % 8) - 3.5;
                    const q = Math.floor(value / 8) - 3.5;
                    return { real: i / 4.5, imag: q / 4.5 };
                default:
                    return { real: 1, imag: 0 };
            }
        }
        
        function addCyclicPrefix(samples, cpLength) {
            const cp = samples.slice(-cpLength);
            return [...cp, ...samples];
        }
        
        function demodulateAndDecode(symbols, params) {
            // Simplified demodulation - in practice would include soft decision decoding
            const bits = [];
            
            symbols.forEach(symbol => {
                // Hard decision based on constellation
                if (Math.abs(symbol.real) > Math.abs(symbol.imag)) {
                    bits.push(symbol.real > 0 ? 1 : 0);
                } else {
                    bits.push(symbol.imag > 0 ? 1 : 0);
                }
            });
            
            return bits;
        }
        
        // Worker message handler
        self.onmessage = function(e) {
            const { type, data, id } = e.data;
            
            switch (type) {
                case 'PROCESS_TRAIN_STATION_OFDM':
                    const result = processTrainStationOFDM(data);
                    self.postMessage({ type: 'TRAIN_STATION_RESULT', result, id });
                    break;
                    
                case 'FFT':
                    try {
                        const result = fft(data.samples);
                        self.postMessage({ type: 'FFT_RESULT', result, id });
                    } catch (error) {
                        self.postMessage({ type: 'ERROR', error: error.message, id });
                    }
                    break;
                    
                case 'CHANNEL_ANALYSIS':
                    // Real-time channel quality analysis
                    const analysis = analyzeChannelQuality(data);
                    self.postMessage({ type: 'CHANNEL_ANALYSIS_RESULT', result: analysis, id });
                    break;
            }
        };
        
        function analyzeChannelQuality(data) {
            const { agents, channel } = data;
            
            return {
                overallQuality: (channel.snr || 20) > 20 ? 'good' : (channel.snr || 20) > 10 ? 'fair' : 'poor',
                dopplerSeverity: Math.abs(channel.dopplerShift || 0) > 100 ? 'high' : 'low',
                interferenceLevel: (agents || []).filter(a => a.isTransmitting).length * 0.2,
                recommendedModulation: selectModulation(channel.snr || 20, channel.dopplerShift || 0).type,
                throughputEstimate: calculateThroughputEstimate(channel, agents || [])
            };
        }
        
        function calculateThroughputEstimate(channel, agents) {
            const baseRate = 100; // Mbps base rate
            const snrFactor = Math.min(1, (channel.snr || 20) / 30);
            const dopplerPenalty = Math.max(0.1, 1 - Math.abs(channel.dopplerShift || 0) / 500);
            const interferencePenalty = Math.max(0.3, 1 - (agents || []).filter(a => a.isTransmitting).length * 0.1);
            
            return baseRate * snrFactor * dopplerPenalty * interferencePenalty;
        }
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
};

interface TrainStationSignalProcessorProps {
    ofdmParams: OFDMParameters;
    channel: Channel;
    agents: Agent[];
    train: Train | null;
    inputData: { bits: number[]; message: string };
    onProcessingComplete: (result: any) => void;
    onProgressUpdate: (progress: number, step: string) => void;
    onChannelAnalysis: (analysis: any) => void;
    selectedAgent?: Agent;
}

interface EnhancedProcessingMetrics extends TransmissionMetrics {
    dopplerImpact: number;
    interferenceLevel: number;
    adaptiveModulation: string;
    channelQuality: 'excellent' | 'good' | 'fair' | 'poor';
    mobilityPenalty: number;
    multiPathDelay: number;
    pilotOverhead: number;
}

const TrainStationSignalProcessor: React.FC<TrainStationSignalProcessorProps> = ({
    ofdmParams,
    channel,
    agents,
    train,
    inputData,
    onProcessingComplete,
    onProgressUpdate,
    onChannelAnalysis,
    selectedAgent
}) => {
    const [processingMetrics, setProcessingMetrics] = useState<EnhancedProcessingMetrics>({
        throughput: 0,
        spectralEfficiency: 0,
        symbolErrorRate: 0,
        bitErrorRate: 0,
        frameErrorRate: 0,
        latency: 0,
        jitter: 0,
        packetLossRate: 0,
        signalToNoiseRatio: 0,
        signalToInterferenceRatio: 0,
        peakToAverageRatio: 0,
        channelCapacity: 0,
        linkMargin: 0,
        dopplerImpact: 0,
        interferenceLevel: 0,
        adaptiveModulation: 'qpsk',
        channelQuality: 'fair',
        mobilityPenalty: 0,
        multiPathDelay: 0,
        pilotOverhead: 0
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState<string>('');
    const [progress, setProgress] = useState(0);
    const [channelAnalysis, setChannelAnalysis] = useState<any>(null);
    const [ofdmVsOftsComparison, setOfdmVsOftsComparison] = useState<any>(null);

    const workerRef = useRef<Worker | null>(null);
    const processingIdRef = useRef(0);
    const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastProcessTimeRef = useRef(0);
    const isProcessingRef = useRef(false);

    // Debounced input data to prevent excessive re-processing
    const debouncedInputData = useMemo(() => {
        const inputHash = JSON.stringify(inputData);
        return { ...inputData, hash: inputHash };
    }, [inputData.message, inputData.bits.length]); // Only trigger on meaningful changes

    // Real-time channel quality assessment with memoization
    const currentChannelQuality = useMemo(() => {
        const snrQuality = channel.snr > 25 ? 'excellent' :
            channel.snr > 20 ? 'good' :
                channel.snr > 15 ? 'fair' : 'poor';

        const dopplerImpact = Math.abs(channel.dopplerShift || 0) / 300; // Normalize to 0-1
        const interferenceCount = agents.filter(a => a.isTransmitting && (a.interferenceLevel || 0) > 0.3).length;

        return {
            snrQuality,
            dopplerImpact,
            interferenceCount,
            mobilityFactor: train ? Math.sqrt(train.velocity.x ** 2 + train.velocity.y ** 2) / 50 : 0
        };
    }, [channel.snr, channel.dopplerShift, agents.length, train?.velocity.x, train?.velocity.y]);

    // Initialize Web Worker once
    useEffect(() => {
        if (typeof Worker !== 'undefined' && !workerRef.current) {
            workerRef.current = createTrainStationSignalWorker();

            workerRef.current.onmessage = (e) => {
                const { type, result, id, error } = e.data;

                if (id !== processingIdRef.current) return; // Ignore outdated results

                switch (type) {
                    case 'TRAIN_STATION_RESULT':
                        handleProcessingComplete(result);
                        break;
                    case 'CHANNEL_ANALYSIS_RESULT':
                        setChannelAnalysis(result);
                        onChannelAnalysis(result);
                        break;
                    case 'ERROR':
                        console.error('Train station signal processing error:', error);
                        setIsProcessing(false);
                        isProcessingRef.current = false;
                        break;
                }
            };
        }

        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
            if (analysisIntervalRef.current) {
                clearInterval(analysisIntervalRef.current);
            }
        };
    }, []); // Only run once

    // Controlled channel analysis - only when needed
    useEffect(() => {
        if (!workerRef.current) return;

        // Clear existing interval
        if (analysisIntervalRef.current) {
            clearInterval(analysisIntervalRef.current);
        }

        analysisIntervalRef.current = setInterval(() => {
            if (isProcessingRef.current) return; // Skip if processing

            processingIdRef.current += 1;

            // Serialize data before sending to worker
            const serializedData = {
                agents: serializeForWorker(agents.slice(0, 10)), // Limit to reduce payload
                channel: serializeForWorker(channel)
            };

            workerRef.current?.postMessage({
                type: 'CHANNEL_ANALYSIS',
                data: serializedData,
                id: processingIdRef.current
            });
        }, 1000); // Analyze every 1 second instead of 500ms

        return () => {
            if (analysisIntervalRef.current) {
                clearInterval(analysisIntervalRef.current);
            }
        };
    }, [agents.length, channel.snr]); // Only restart when key properties change

    const handleProcessingComplete = useCallback((result: any) => {
        if (!result.success) {
            console.error('Processing failed:', result.error);
            setIsProcessing(false);
            isProcessingRef.current = false;
            return;
        }

        const trainPassengerCount = agents.filter(a => a.type === 'train_passenger').length;
        const platformPassengerCount = agents.filter(a => a.type === 'platform_passenger').length;

        const metrics: EnhancedProcessingMetrics = {
            throughput: result.result.processingMetrics.throughput,
            spectralEfficiency: result.result.processingMetrics.spectralEfficiency,
            symbolErrorRate: result.result.symbolErrorRate,
            bitErrorRate: result.result.processingMetrics.bitErrorRate,
            frameErrorRate: result.result.processingMetrics.bitErrorRate * 8, // Approximate
            latency: result.processingTime,
            jitter: Math.abs(channel.dopplerShift || 0) * 0.01, // Doppler-induced jitter
            packetLossRate: result.result.symbolErrorRate * 100,
            signalToNoiseRatio: channel.snr,
            signalToInterferenceRatio: channel.snr - (agents.filter(a => a.isTransmitting).length * 2),
            peakToAverageRatio: result.result.papr,
            channelCapacity: result.result.processingMetrics.channelCapacity,
            linkMargin: channel.snr - 15, // Assume 15dB minimum required
            dopplerImpact: Math.abs(channel.dopplerShift || 0) / 300,
            interferenceLevel: agents.filter(a => a.isTransmitting).length / agents.length,
            adaptiveModulation: channelAnalysis?.recommendedModulation || 'qpsk',
            channelQuality: channelAnalysis?.overallQuality || 'fair',
            mobilityPenalty: (trainPassengerCount / (trainPassengerCount + platformPassengerCount)) * 0.3,
            multiPathDelay: channel.multipath?.reduce((max, p) => Math.max(max, p.delay || 0), 0) || 0,
            pilotOverhead: 0.1 // 10% pilot overhead for channel estimation
        };

        setProcessingMetrics(metrics);
        setIsProcessing(false);
        isProcessingRef.current = false;
        setProgress(100);
        onProcessingComplete(result.result);

        // Generate OFDM vs OFTS comparison
        generateOfdmOftsComparison(metrics);

    }, [channel, agents, channelAnalysis, onProcessingComplete]);

    const generateOfdmOftsComparison = useCallback((metrics: EnhancedProcessingMetrics) => {
        // Simulate how OFTS would perform vs current OFDM
        const ofdmThroughput = metrics.throughput;
        const oftsThroughput = ofdmThroughput * (1 + metrics.dopplerImpact * 0.5); // OFTS better with Doppler

        const comparison = {
            ofdm: {
                throughput: ofdmThroughput,
                doppler_tolerance: 1 - metrics.dopplerImpact,
                ber: metrics.bitErrorRate,
                complexity: 'Medium'
            },
            ofts: {
                throughput: oftsThroughput,
                doppler_tolerance: 1 - metrics.dopplerImpact * 0.3, // Much better
                ber: metrics.bitErrorRate * 0.7, // Lower error rate
                complexity: 'High'
            },
            improvement: {
                throughput_gain: ((oftsThroughput - ofdmThroughput) / ofdmThroughput * 100).toFixed(1),
                ber_improvement: ((1 - 0.7) * 100).toFixed(1),
                doppler_resilience: ((0.7 * 100)).toFixed(1)
            }
        };

        setOfdmVsOftsComparison(comparison);
    }, []);

    // Controlled processing function with rate limiting
    const processSignal = useCallback(async () => {
        if (!workerRef.current ||
            !debouncedInputData.bits ||
            debouncedInputData.bits.length === 0 ||
            isProcessingRef.current) {
            return;
        }

        const now = Date.now();
        if (now - lastProcessTimeRef.current < 2000) {
            // Rate limit: don't process more than once per 2 seconds
            return;
        }

        setIsProcessing(true);
        isProcessingRef.current = true;
        lastProcessTimeRef.current = now;
        setProgress(0);
        processingIdRef.current += 1;

        // Enhanced processing steps for train station scenario
        const steps = [
            'Channel Quality Assessment',
            'Adaptive Coding Selection',
            'Pilot Symbol Insertion',
            'Doppler Pre-compensation',
            'Interference Avoidance Mapping',
            'IFFT Processing',
            'Cyclic Prefix Adaptation',
            'Train Station Channel Simulation',
            'Multi-agent Interference',
            'Receiver Processing'
        ];

        // Simulate step progression without setState in loop
        let stepIndex = 0;
        const progressInterval = setInterval(() => {
            if (stepIndex < steps.length) {
                setProcessingStep(steps[stepIndex]);
                setProgress((stepIndex / steps.length) * 90);
                onProgressUpdate((stepIndex / steps.length) * 90, steps[stepIndex]);
                stepIndex++;
            } else {
                clearInterval(progressInterval);

                // Send to worker for actual processing
                const serializedData = {
                    inputData: serializeForWorker(debouncedInputData),
                    params: serializeForWorker(ofdmParams),
                    channel: serializeForWorker(channel),
                    agents: serializeForWorker(agents.slice(0, 10)), // Limit agents for performance
                    transmissionId: selectedAgent?.id || 'default'
                };

                workerRef.current?.postMessage({
                    type: 'PROCESS_TRAIN_STATION_OFDM',
                    data: serializedData,
                    id: processingIdRef.current
                });
            }
        }, 100);

    }, [debouncedInputData, ofdmParams, channel, agents, selectedAgent, onProgressUpdate]);

    // Controlled auto-processing - only when input meaningfully changes
    useEffect(() => {
        if (debouncedInputData.bits && debouncedInputData.bits.length > 0) {
            const timer = setTimeout(() => {
                processSignal();
            }, 500); // Debounce 500ms

            return () => clearTimeout(timer);
        }
    }, [debouncedInputData.hash, processSignal]);

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            marginBottom: '24px',
            color: 'white'
        }}>
            <h3 style={{
                margin: '0 0 20px 0',
                fontWeight: 700,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <Cpu size={20} color="#3b82f6" />
                Train Station OFDM Signal Processor
                {isProcessing && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginLeft: 'auto',
                        fontSize: '0.875rem',
                        color: '#60a5fa'
                    }}>
                        <Activity size={16} className="animate-spin" />
                        {processingStep}
                    </div>
                )}
            </h3>

            {/* Real-time Channel Status */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                marginBottom: '20px'
            }}>
                <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                        Channel Quality
                    </div>
                    <div style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: currentChannelQuality.snrQuality === 'excellent' ? '#10b981' :
                            currentChannelQuality.snrQuality === 'good' ? '#22c55e' :
                                currentChannelQuality.snrQuality === 'fair' ? '#f59e0b' : '#ef4444'
                    }}>
                        {currentChannelQuality.snrQuality.toUpperCase()}
                    </div>
                </div>

                <div style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                        Doppler Impact
                    </div>
                    <div style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: currentChannelQuality.dopplerImpact > 0.5 ? '#ef4444' :
                            currentChannelQuality.dopplerImpact > 0.2 ? '#f59e0b' : '#10b981',
                        fontFamily: 'JetBrains Mono, monospace'
                    }}>
                        {(currentChannelQuality.dopplerImpact * 100).toFixed(0)}%
                    </div>
                </div>

                <div style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                        Active Interferers
                    </div>
                    <div style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: currentChannelQuality.interferenceCount > 3 ? '#ef4444' :
                            currentChannelQuality.interferenceCount > 1 ? '#f59e0b' : '#10b981',
                        fontFamily: 'JetBrains Mono, monospace'
                    }}>
                        {currentChannelQuality.interferenceCount}
                    </div>
                </div>

                {train && (
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                            Train Velocity
                        </div>
                        <div style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            color: '#10b981',
                            fontFamily: 'JetBrains Mono, monospace'
                        }}>
                            {Math.sqrt(train.velocity.x ** 2 + train.velocity.y ** 2).toFixed(1)} m/s
                        </div>
                    </div>
                )}
            </div>

            {/* Processing Progress */}
            {(isProcessing || progress > 0) && (
                <div style={{ marginBottom: '20px' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                    }}>
                        <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                            Processing Progress
                        </span>
                        <span style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: '#60a5fa',
                            fontFamily: 'JetBrains Mono, monospace'
                        }}>
                            {progress.toFixed(1)}%
                        </span>
                    </div>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        height: '8px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            background: isProcessing
                                ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
                                : 'linear-gradient(90deg, #10b981, #059669)',
                            height: '100%',
                            width: `${progress}%`,
                            borderRadius: '8px',
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                </div>
            )}

            {/* Enhanced Processing Metrics */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
                marginBottom: '20px'
            }}>
                <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                    }}>
                        <Zap size={16} color="#3b82f6" />
                        <span style={{ fontWeight: 600, color: 'white' }}>Adaptive Throughput</span>
                    </div>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: '#60a5fa',
                        fontFamily: 'JetBrains Mono, monospace'
                    }}>
                        {(processingMetrics.throughput / 1000000).toFixed(1)}M
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                        bps | Modulation: {processingMetrics.adaptiveModulation.toUpperCase()}
                    </div>
                </div>

                <div style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                    }}>
                        <Waves size={16} color="#f59e0b" />
                        <span style={{ fontWeight: 600, color: 'white' }}>Mobility Impact</span>
                    </div>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: '#fbbf24',
                        fontFamily: 'JetBrains Mono, monospace'
                    }}>
                        {(processingMetrics.mobilityPenalty * 100).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                        Penalty | PAPR: {processingMetrics.peakToAverageRatio.toFixed(1)}dB
                    </div>
                </div>

                <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                    }}>
                        <AlertTriangle size={16} color="#ef4444" />
                        <span style={{ fontWeight: 600, color: 'white' }}>Error Rates</span>
                    </div>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: processingMetrics.bitErrorRate > 0.01 ? '#ef4444' : '#10b981',
                        fontFamily: 'JetBrains Mono, monospace'
                    }}>
                        {(processingMetrics.bitErrorRate * 100).toFixed(3)}%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                        BER | SER: {(processingMetrics.symbolErrorRate * 100).toFixed(2)}%
                    </div>
                </div>
            </div>

            {/* OFDM vs OFTS Comparison */}
            {ofdmVsOftsComparison && (
                <div style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    marginBottom: '16px'
                }}>
                    <h4 style={{
                        margin: '0 0 12px 0',
                        color: '#a855f7',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <TrendingUp size={16} />
                        Why OFTS is Necessary: Performance Comparison
                    </h4>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '12px'
                    }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                                Throughput Gain with OFTS
                            </div>
                            <div style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: '#10b981',
                                fontFamily: 'JetBrains Mono, monospace'
                            }}>
                                +{ofdmVsOftsComparison.improvement.throughput_gain}%
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                                BER Improvement
                            </div>
                            <div style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: '#22c55e',
                                fontFamily: 'JetBrains Mono, monospace'
                            }}>
                                -{ofdmVsOftsComparison.improvement.ber_improvement}%
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                                Doppler Resilience
                            </div>
                            <div style={{
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                color: '#3b82f6',
                                fontFamily: 'JetBrains Mono, monospace'
                            }}>
                                +{ofdmVsOftsComparison.improvement.doppler_resilience}%
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Resource Usage Summary */}
            <div style={{
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: '#94a3b8'
                }}>
                    <span>Latency: {processingMetrics.latency.toFixed(1)}ms</span>
                    <span>Pilot Overhead: {(processingMetrics.pilotOverhead * 100).toFixed(1)}%</span>
                    <span>FFT Size: {ofdmParams.fftSize}</span>
                    <span>Channel: {processingMetrics.channelQuality}</span>
                    <span>Worker: {workerRef.current ? 'Active' : 'Inactive'}</span>
                </div>
            </div>
        </div>
    );
};

export default TrainStationSignalProcessor;