// np.advanced-viz.tsx - Fixed version with stable rendering algorithms
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
    Layers,
    Waves,
    Radio,
    ArrowRight,
    Zap,
    Eye,
    BarChart3,
    Activity,
    Settings,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { ComplexNumber, OFDMSymbol, Channel, Agent } from './np.types';

interface AdvancedVisualizationProps {
    currentSymbol: OFDMSymbol | null;
    channel: Channel;
    agents: Agent[];
    isActive: boolean;
    selectedAgent?: Agent;
    width?: number;
    height?: number;
}

// 1. OFDM Symbol Construction Visualization - Optimized
const OFDMSymbolConstruction: React.FC<{
    symbol: OFDMSymbol;
    isActive: boolean;
    width: number;
    height: number;
}> = ({ symbol, isActive, width, height }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>(0);
    const phaseRef = useRef<number>(0);
    const lastFrameTimeRef = useRef<number>(0);

    // UI state only - doesn't trigger re-renders when changed
    const [showSubcarriers, setShowSubcarriers] = useState(true);
    const [showCombined, setShowCombined] = useState(true);

    // Memoize stable data structures
    const activeSubcarriers = useMemo(() =>
        symbol.subcarriers.filter(sc => sc.isActive),
        [symbol.subcarriers]
    );

    const timePoints = 256; // Constant

    // Optimized render function with minimal dependencies
    const renderFrame = useCallback((timestamp: number) => {
        const canvas = canvasRef.current;
        if (!canvas || !isActive) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Throttle to ~30 FPS for better performance
        if (timestamp - lastFrameTimeRef.current < 33) {
            if (isActive) {
                animationFrameRef.current = requestAnimationFrame(renderFrame);
            }
            return;
        }
        lastFrameTimeRef.current = timestamp;

        // Update phase smoothly
        phaseRef.current = (phaseRef.current + 0.05) % (2 * Math.PI);

        ctx.clearRect(0, 0, width, height);

        // Set up coordinate system
        const margin = 40;
        const plotWidth = width - 2 * margin;
        const plotHeight = height - 2 * margin;
        const centerY = height / 2;

        // Draw axes - optimized
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(margin, centerY);
        ctx.lineTo(width - margin, centerY);
        ctx.moveTo(margin, margin);
        ctx.lineTo(margin, height - margin);
        ctx.stroke();

        // Pre-allocate combined signal array
        const combinedSignal = new Float32Array(timePoints);

        // Draw individual subcarriers - optimized loop
        if (showSubcarriers && activeSubcarriers.length > 0) {
            const colorStep = 360 / activeSubcarriers.length;

            for (let scIndex = 0; scIndex < activeSubcarriers.length; scIndex++) {
                const subcarrier = activeSubcarriers[scIndex];
                const hue = scIndex * colorStep;

                ctx.strokeStyle = `hsl(${hue}, 70%, 60%)`;
                ctx.lineWidth = 1;
                ctx.globalAlpha = 0.6;

                ctx.beginPath();
                const freq = subcarrier.id * 0.1;
                const amplitude = subcarrier.amplitude;
                const basePhase = subcarrier.phase + phaseRef.current;

                for (let t = 0; t < timePoints; t++) {
                    const x = margin + (t / timePoints) * plotWidth;
                    const timeNorm = t / timePoints;

                    const signal = amplitude * Math.cos(2 * Math.PI * freq * timeNorm + basePhase);
                    const y = centerY - signal * (plotHeight / 4);

                    if (t === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }

                    // Accumulate combined signal
                    combinedSignal[t] += signal;
                }
                ctx.stroke();
            }
        }

        // Draw combined OFDM signal - optimized
        if (showCombined) {
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 3;
            ctx.globalAlpha = 1;

            ctx.beginPath();
            for (let t = 0; t < timePoints; t++) {
                const x = margin + (t / timePoints) * plotWidth;
                const y = centerY - combinedSignal[t] * (plotHeight / 8);

                if (t === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();

            // Optimized glow effect
            ctx.save();
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.restore();
        }

        ctx.globalAlpha = 1;

        // Static labels - only draw once per setting change
        ctx.fillStyle = '#e5e7eb';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Time Domain OFDM Signal', width / 2, 20);

        // Legend
        ctx.textAlign = 'left';
        let legendY = height - 40;
        if (showSubcarriers) {
            ctx.fillStyle = '#e5e7eb';
            ctx.fillText('Individual subcarriers', 10, legendY);
            legendY += 20;
        }
        if (showCombined) {
            ctx.fillStyle = '#10b981';
            ctx.fillText('Combined OFDM signal', 10, legendY);
        }

        // Continue animation
        if (isActive) {
            animationFrameRef.current = requestAnimationFrame(renderFrame);
        }
    }, [width, height, activeSubcarriers, showSubcarriers, showCombined, isActive]);

    // Controlled animation lifecycle
    useEffect(() => {
        if (isActive) {
            animationFrameRef.current = requestAnimationFrame(renderFrame);
        } else {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isActive, renderFrame]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{ width: '100%', height: '100%' }}
            />

            {/* Controls */}
            <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
            }}>
                <label style={{
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <input
                        type="checkbox"
                        checked={showSubcarriers}
                        onChange={(e) => setShowSubcarriers(e.target.checked)}
                    />
                    Subcarriers
                </label>
                <label style={{
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <input
                        type="checkbox"
                        checked={showCombined}
                        onChange={(e) => setShowCombined(e.target.checked)}
                    />
                    Combined
                </label>
            </div>
        </div>
    );
};

// 2. Constellation Diagram with optimized history management
const ConstellationDiagram: React.FC<{
    symbol: OFDMSymbol;
    channel: Channel;
    isActive: boolean;
    width: number;
    height: number;
}> = ({ symbol, channel, isActive, width, height }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>(0);
    const historyRef = useRef<ComplexNumber[][]>([]);
    const lastUpdateTimeRef = useRef<number>(0);

    // Memoized channel effects calculator
    const addChannelEffects = useCallback((complexNum: ComplexNumber, snr: number, dopplerHz: number, timeIndex: number): ComplexNumber => {
        const noisePower = Math.pow(10, -snr / 10);
        const noiseReal = (Math.random() - 0.5) * Math.sqrt(noisePower);
        const noiseImag = (Math.random() - 0.5) * Math.sqrt(noisePower);

        const dopplerPhase = 2 * Math.PI * dopplerHz * timeIndex * 0.001;
        const cosPhase = Math.cos(dopplerPhase);
        const sinPhase = Math.sin(dopplerPhase);

        const rotatedReal = complexNum.real * cosPhase - complexNum.imag * sinPhase;
        const rotatedImag = complexNum.real * sinPhase + complexNum.imag * cosPhase;

        return {
            real: rotatedReal + noiseReal,
            imag: rotatedImag + noiseImag
        };
    }, []);

    // Stable render function
    const renderFrame = useCallback((timestamp: number) => {
        const canvas = canvasRef.current;
        if (!canvas || !isActive) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Update at 10 FPS for constellation (less frequent than signal plot)
        if (timestamp - lastUpdateTimeRef.current < 100) {
            if (isActive) {
                animationFrameRef.current = requestAnimationFrame(renderFrame);
            }
            return;
        }
        lastUpdateTimeRef.current = timestamp;

        ctx.clearRect(0, 0, width, height);

        const centerX = width / 2;
        const centerY = height / 2;
        const scale = Math.min(width, height) * 0.35;

        // Draw grid - optimized
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);

        // Axes
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height);
        ctx.stroke();

        // Grid circles
        ctx.beginPath();
        for (let r = 0.5; r <= 2; r += 0.5) {
            ctx.moveTo(centerX + r * scale, centerY);
            ctx.arc(centerX, centerY, r * scale, 0, 2 * Math.PI);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw ideal constellation points (reference) - only if valid
        const idealPoints = symbol.frequencyDomainSamples;
        if (idealPoints && idealPoints.length > 0) {
            ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
            for (const point of idealPoints) {
                const x = centerX + point.real * scale;
                const y = centerY - point.imag * scale;

                ctx.beginPath();
                ctx.arc(x, y, 8, 0, 2 * Math.PI);
                ctx.fill();
            }

            // Generate new noisy points and update history
            const timeIndex = Date.now() % 10000;
            const dopplerFrequency = channel.dopplerShift || 0;

            const noisyPoints = idealPoints.map((point, index) =>
                addChannelEffects(point, channel.snr, dopplerFrequency, timeIndex + index)
            );

            // Update history efficiently
            historyRef.current = [noisyPoints, ...historyRef.current.slice(0, 19)];

            // Draw historical points with optimized alpha blending
            const history = historyRef.current;
            for (let historyIndex = 0; historyIndex < history.length; historyIndex++) {
                const points = history[historyIndex];
                const alpha = Math.max(0.1, 1 - historyIndex * 0.05);

                const dopplerIntensity = Math.abs(dopplerFrequency) / 300;
                const hue = dopplerIntensity > 0.5 ? 0 : 120;

                ctx.fillStyle = `hsl(${hue}, 70%, ${50 + alpha * 30}%)`;
                ctx.globalAlpha = alpha;

                ctx.beginPath();
                for (const point of points) {
                    const x = centerX + point.real * scale;
                    const y = centerY - point.imag * scale;
                    ctx.moveTo(x + 3, y);
                    ctx.arc(x, y, 3, 0, 2 * Math.PI);
                }
                ctx.fill();
            }
        }

        ctx.globalAlpha = 1;

        // Static labels
        ctx.fillStyle = '#e5e7eb';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Constellation Diagram', width / 2, 20);
        ctx.textAlign = 'left';
        ctx.fillText('I', width - 20, centerY - 5);
        ctx.textAlign = 'center';
        ctx.fillText('Q', centerX + 5, 15);

        // Doppler indicator
        const dopplerFreq = channel.dopplerShift || 0;
        if (Math.abs(dopplerFreq) > 10) {
            ctx.fillStyle = '#ef4444';
            ctx.font = '10px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`Doppler: ${dopplerFreq.toFixed(0)}Hz`, 10, height - 20);
        }

        // Continue animation
        if (isActive) {
            animationFrameRef.current = requestAnimationFrame(renderFrame);
        }
    }, [symbol.frequencyDomainSamples, channel.snr, channel.dopplerShift, width, height, isActive, addChannelEffects]);

    // Controlled animation lifecycle
    useEffect(() => {
        if (isActive) {
            animationFrameRef.current = requestAnimationFrame(renderFrame);
        } else {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isActive, renderFrame]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{ width: '100%', height: '100%' }}
            />

            <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontFamily: 'JetBrains Mono, monospace'
            }}>
                SNR: {channel.snr.toFixed(1)}dB
            </div>
        </div>
    );
};

// 3. Signal Processing Flow Diagram - Simplified
const SignalFlowDiagram: React.FC<{
    symbol: OFDMSymbol;
    channel: Channel;
    isActive: boolean;
    width: number;
    height: number;
}> = ({ symbol, channel, isActive, width, height }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>(0);
    const currentStepRef = useRef<number>(0);
    const lastStepTimeRef = useRef<number>(0);

    const steps = useMemo(() => [
        { name: 'Input Data', icon: Radio, color: '#3b82f6' },
        { name: 'Symbol Mapping', icon: Layers, color: '#10b981' },
        { name: 'IFFT', icon: Zap, color: '#f59e0b' },
        { name: 'Add CP', icon: Settings, color: '#8b5cf6' },
        { name: 'Channel', icon: Waves, color: '#ef4444' },
        { name: 'Remove CP', icon: Settings, color: '#8b5cf6' },
        { name: 'FFT', icon: Zap, color: '#f59e0b' },
        { name: 'Demodulate', icon: Eye, color: '#22c55e' }
    ], []);

    const renderFrame = useCallback((timestamp: number) => {
        const canvas = canvasRef.current;
        if (!canvas || !isActive) return;

        // Update step every 1 second
        if (timestamp - lastStepTimeRef.current > 1000) {
            currentStepRef.current = (currentStepRef.current + 1) % steps.length;
            lastStepTimeRef.current = timestamp;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);

        const stepWidth = width / steps.length;
        const centerY = height / 2;
        const boxHeight = 60;
        const boxWidth = stepWidth * 0.8;

        // Draw steps
        for (let index = 0; index < steps.length; index++) {
            const step = steps[index];
            const x = index * stepWidth + stepWidth / 2;
            const isActive = index === currentStepRef.current;
            const isPast = index < currentStepRef.current;

            // Box
            ctx.fillStyle = isActive ? step.color : isPast ? `${step.color}80` : '#374151';
            ctx.strokeStyle = step.color;
            ctx.lineWidth = isActive ? 3 : 1;

            const boxX = x - boxWidth / 2;
            const boxY = centerY - boxHeight / 2;

            ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
            ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

            // Text
            ctx.fillStyle = isActive ? 'white' : '#e5e7eb';
            ctx.font = '12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(step.name, x, centerY + 4);

            // Arrow
            if (index < steps.length - 1) {
                const arrowX = x + boxWidth / 2 + 10;
                const arrowY = centerY;

                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(arrowX, arrowY);
                ctx.lineTo(arrowX + stepWidth * 0.2 - 20, arrowY);
                ctx.lineTo(arrowX + stepWidth * 0.2 - 25, arrowY - 5);
                ctx.moveTo(arrowX + stepWidth * 0.2 - 20, arrowY);
                ctx.lineTo(arrowX + stepWidth * 0.2 - 25, arrowY + 5);
                ctx.stroke();
            }

            // Glow for active step
            if (isActive) {
                ctx.save();
                ctx.shadowColor = step.color;
                ctx.shadowBlur = 15;
                ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
                ctx.restore();
            }
        }

        if (isActive) {
            animationFrameRef.current = requestAnimationFrame(renderFrame);
        }
    }, [width, height, steps, isActive]);

    useEffect(() => {
        if (isActive) {
            animationFrameRef.current = requestAnimationFrame(renderFrame);
        } else {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isActive, renderFrame]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
};

// 4. Spectrum Waterfall - Optimized with efficient data structures
const SpectrumWaterfall: React.FC<{
    symbol: OFDMSymbol;
    channel: Channel;
    agents: Agent[];
    isActive: boolean;
    width: number;
    height: number;
}> = ({ symbol, channel, agents, isActive, width, height }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationFrameRef = useRef<number>(0);
    const spectrumHistoryRef = useRef<Float32Array[]>([]);
    const lastUpdateTimeRef = useRef<number>(0);

    // Optimized speed calculation
    const getSpeed = useCallback((velocity: any): number => {
        if (!velocity || typeof velocity !== 'object') {
            return typeof velocity === 'number' ? Math.abs(velocity) : 0;
        }
        const x = velocity.x || velocity.vx || 0;
        const y = velocity.y || velocity.vy || 0;
        return Math.sqrt(x * x + y * y);
    }, []);

    // Optimized spectrum generation
    const generateSpectrum = useCallback((timestamp: number): Float32Array => {
        const bins = 256;
        const spectrum = new Float32Array(bins);

        // Add OFDM signal spectrum
        const subcarriers = symbol.subcarriers;
        const numSubcarriers = subcarriers.length;
        for (let i = 0; i < numSubcarriers; i++) {
            const sc = subcarriers[i];
            if (sc.isActive) {
                const binIndex = Math.floor((sc.id / numSubcarriers) * bins);
                if (binIndex < bins) {
                    spectrum[binIndex] = sc.amplitude;
                }
            }
        }

        // Add interference from agents
        const interferingAgents = agents.filter(a => a.isTransmitting && (a.interferenceLevel || 0) > 0);
        for (const agent of interferingAgents) {
            if (agent.type === 'train_passenger') {
                const dopplerShift = agent.dopplerShift || 0;
                const centerBin = Math.floor(bins * 0.5);
                const shiftBins = Math.floor((dopplerShift / 20e6) * bins);
                const speed = getSpeed(agent.velocity);

                const interferenceStart = Math.max(0, Math.min(bins - 30, centerBin + shiftBins - 15));
                const dopplerIntensity = (agent.interferenceLevel || 0) * (speed > 0 ? 1.5 : 1.0);

                for (let i = 0; i < 30 && interferenceStart + i < bins; i++) {
                    const gaussian = Math.exp(-Math.pow(i - 15, 2) / 36); // Gaussian shape
                    spectrum[interferenceStart + i] += dopplerIntensity * 0.7 * gaussian;
                }

                // Secondary reflection for high speed
                if (speed > 5) {
                    const reflectionBin = Math.max(0, Math.min(bins - 20, centerBin - shiftBins - 10));
                    for (let i = 0; i < 20 && reflectionBin + i < bins; i++) {
                        const gaussian = Math.exp(-Math.pow(i - 10, 2) / 25);
                        spectrum[reflectionBin + i] += (agent.interferenceLevel || 0) * 0.3 * gaussian;
                    }
                }
            } else if (agent.type === 'platform_passenger') {
                const baseIntensity = agent.movementState === 'walking' ? 1.2 : 0.8;
                const interferenceStart = Math.floor(Math.random() * bins * 0.6 + bins * 0.2);
                const interferenceWidth = agent.movementState === 'sitting' ? 15 : 25;

                for (let i = 0; i < interferenceWidth && interferenceStart + i < bins; i++) {
                    const gaussian = Math.exp(-Math.pow(i - interferenceWidth / 2, 2) / (interferenceWidth / 4));
                    spectrum[interferenceStart + i] += (agent.interferenceLevel || 0) * baseIntensity * 0.4 * gaussian;
                }
            }
        }

        // Add noise floor
        const noiseLevel = Math.pow(10, -channel.snr / 10);
        for (let i = 0; i < bins; i++) {
            spectrum[i] += noiseLevel * (0.5 + Math.random() * 0.5);
            spectrum[i] = Math.min(1, Math.max(0, spectrum[i])); // Clamp
        }

        return spectrum;
    }, [symbol.subcarriers, channel.snr, agents, getSpeed]);

    const renderFrame = useCallback((timestamp: number) => {
        const canvas = canvasRef.current;
        if (!canvas || !isActive) return;

        // Update spectrum at 10 FPS
        if (timestamp - lastUpdateTimeRef.current > 100) {
            const newSpectrum = generateSpectrum(timestamp);
            spectrumHistoryRef.current = [newSpectrum, ...spectrumHistoryRef.current.slice(0, 99)];
            lastUpdateTimeRef.current = timestamp;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const history = spectrumHistoryRef.current;
        if (history.length === 0) {
            if (isActive) {
                animationFrameRef.current = requestAnimationFrame(renderFrame);
            }
            return;
        }

        ctx.clearRect(0, 0, width, height);

        const rowHeight = height / Math.min(history.length, 50); // Limit rows for performance
        const colWidth = width / 256; // Fixed bins

        // Draw waterfall efficiently
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        for (let timeIndex = 0; timeIndex < Math.min(history.length, 50); timeIndex++) {
            const spectrum = history[timeIndex];
            const y = Math.floor(timeIndex * rowHeight);

            for (let freqIndex = 0; freqIndex < spectrum.length; freqIndex++) {
                const value = spectrum[freqIndex];
                const x = Math.floor(freqIndex * colWidth);

                // Convert to color
                const hue = (1 - value) * 240; // Blue to red
                const saturation = 0.7 + value * 0.3;
                const lightness = 0.3 + value * 0.5;

                // HSL to RGB conversion (simplified)
                const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
                const x1 = c * (1 - Math.abs((hue / 60) % 2 - 1));
                const m = lightness - c / 2;

                let r = 0, g = 0, b = 0;
                if (hue < 60) { r = c; g = x1; b = 0; }
                else if (hue < 120) { r = x1; g = c; b = 0; }
                else if (hue < 180) { r = 0; g = c; b = x1; }
                else if (hue < 240) { r = 0; g = x1; b = c; }
                else { r = x1; g = 0; b = c; }

                const red = Math.floor((r + m) * 255);
                const green = Math.floor((g + m) * 255);
                const blue = Math.floor((b + m) * 255);

                // Fill pixel area
                for (let py = y; py < Math.min(y + rowHeight, height); py++) {
                    for (let px = x; px < Math.min(x + colWidth, width); px++) {
                        const pixelIndex = (py * width + px) * 4;
                        if (pixelIndex < data.length) {
                            data[pixelIndex] = red;
                            data[pixelIndex + 1] = green;
                            data[pixelIndex + 2] = blue;
                            data[pixelIndex + 3] = 255;
                        }
                    }
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);

        // Draw frequency markers
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.textAlign = 'center';

        for (let i = 0; i <= 4; i++) {
            const x = (i / 4) * width;
            const freq = (i / 4) * 20;

            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();

            ctx.fillText(`${freq.toFixed(0)}MHz`, x, height - 5);
        }

        if (isActive) {
            animationFrameRef.current = requestAnimationFrame(renderFrame);
        }
    }, [width, height, isActive, generateSpectrum]);

    useEffect(() => {
        if (isActive) {
            animationFrameRef.current = requestAnimationFrame(renderFrame);
        } else {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isActive, renderFrame]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{ width: '100%', height: '100%' }}
            />

            <div style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                color: 'white',
                fontSize: '12px',
                fontWeight: 600
            }}>
                Frequency Spectrum (Time ↓)
            </div>
        </div>
    );
};

// Main Advanced Visualization Component - Optimized
const AdvancedVisualizations: React.FC<AdvancedVisualizationProps> = ({
    currentSymbol,
    channel,
    agents,
    isActive,
    selectedAgent,
    width = 400,
    height = 300
}) => {
    const [activeView, setActiveView] = useState<'symbol' | 'constellation' | 'flow' | 'spectrum'>('symbol');
    const [isExpanded, setIsExpanded] = useState(false);

    // Memoize the view configurations
    const views = useMemo(() => [
        { id: 'symbol' as const, label: 'OFDM Construction', icon: Layers },
        { id: 'constellation' as const, label: 'Constellation', icon: Radio },
        { id: 'flow' as const, label: 'Signal Flow', icon: ArrowRight },
        { id: 'spectrum' as const, label: 'Spectrum', icon: BarChart3 }
    ], []);

    if (!currentSymbol) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                color: '#64748b',
                fontSize: '14px'
            }}>
                <Activity size={20} style={{ marginRight: '8px' }} />
                Waiting for signal data...
            </div>
        );
    }

    const adjustedHeight = isExpanded ? Math.min(window.innerHeight * 0.8, 800) : height;

    return (
        <div style={{
            width: '100%',
            height: isExpanded ? `${adjustedHeight}px` : '100%',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8))',
            borderRadius: '12px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Header with view selector */}
            <div style={{
                padding: '12px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.3)'
            }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {views.map(view => (
                        <button
                            key={view.id}
                            onClick={() => setActiveView(view.id)}
                            style={{
                                background: activeView === view.id
                                    ? 'rgba(59, 130, 246, 0.8)'
                                    : 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <view.icon size={14} />
                            {view.label}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        padding: '4px'
                    }}
                >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>
            </div>

            {/* Visualization content */}
            <div style={{
                height: 'calc(100% - 60px)',
                padding: '8px'
            }}>
                {activeView === 'symbol' && (
                    <OFDMSymbolConstruction
                        symbol={currentSymbol}
                        isActive={isActive}
                        width={width}
                        height={adjustedHeight - 60}
                    />
                )}

                {activeView === 'constellation' && (
                    <ConstellationDiagram
                        symbol={currentSymbol}
                        channel={channel}
                        isActive={isActive}
                        width={width}
                        height={adjustedHeight - 60}
                    />
                )}

                {activeView === 'flow' && (
                    <SignalFlowDiagram
                        symbol={currentSymbol}
                        channel={channel}
                        isActive={isActive}
                        width={width}
                        height={adjustedHeight - 60}
                    />
                )}

                {activeView === 'spectrum' && (
                    <SpectrumWaterfall
                        symbol={currentSymbol}
                        channel={channel}
                        agents={agents}
                        isActive={isActive}
                        width={width}
                        height={adjustedHeight - 60}
                    />
                )}
            </div>
        </div>
    );
};

export default AdvancedVisualizations;