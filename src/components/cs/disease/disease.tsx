import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import { Activity, PlayCircle, PauseCircle, RefreshCw } from "lucide-react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const CANVAS_W = 800;
const CANVAS_H = 500;

type Agent = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  state: "S" | "I" | "R";
  timer: number;
};

interface Props {
  isRunning: boolean;
  speed: number;
  isDark: boolean;
}

/* ---------- styled components ---------- */
const SimulationContainer = styled.div<{ $isDark: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  background: ${({ $isDark }) => ($isDark ? "#0f172a" : "#ffffff")};
  padding: 1.5rem;
  border-radius: 1.25rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 1.125rem;
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.25rem;
`;

const SliderGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
`;

export default function DiseaseSimulation({ isRunning, speed, isDark }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const agents = useRef<Agent[]>([]);
  const [history, setHistory] = useState<{ t: number; S: number; I: number; R: number }[]>([]);
  const [localRunning, setLocalRunning] = useState(isRunning);
  const [tickCount, setTickCount] = useState(0);

  const [population, setPopulation] = useState(120);
  const [infectionRadius, setInfectionRadius] = useState(14);
  const [recoveryTime, setRecoveryTime] = useState(600);

  // setup
  const initAgents = () => {
    agents.current = Array.from({ length: population }, () => ({
      x: Math.random() * CANVAS_W,
      y: Math.random() * CANVAS_H,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      state: "S",
      timer: 0,
    }));

    // infect a seed agent
    const seed = agents.current[Math.floor(Math.random() * agents.current.length)];
    seed.state = "I";
    seed.timer = recoveryTime;

    setHistory([]);
    setTickCount(0);
  };

  useEffect(() => {
    initAgents();
  }, [population]);

  // loop
  useEffect(() => {
    let frame: number;
    const loop = () => {
      if (localRunning) {
        for (let i = 0; i < speed; i++) {
          update();
          setTickCount((t) => {
            const nt = t + 1;
            if (nt % 10 === 0) recordStats(nt);
            return nt;
          });
        }
        render();
      }
      frame = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(frame);
  }, [localRunning, speed, infectionRadius, recoveryTime]);

  const update = () => {
    for (const a of agents.current) {
      // random wandering adjustment for natural motion
      a.vx += (Math.random() - 0.5) * 0.05;
      a.vy += (Math.random() - 0.5) * 0.05;

      // move
      a.x += a.vx;
      a.y += a.vy;
      if (a.x < 0 || a.x > CANVAS_W) a.vx *= -1;
      if (a.y < 0 || a.y > CANVAS_H) a.vy *= -1;

      if (a.state === "I") {
        a.timer--;
        if (a.timer <= 0) {
          a.state = "R";
        } else {
          // spread
          for (const b of agents.current) {
            if (b.state === "S") {
              const dx = a.x - b.x;
              const dy = a.y - b.y;
              if (dx * dx + dy * dy < infectionRadius * infectionRadius) {
                b.state = "I";
                b.timer = recoveryTime;
              }
            }
          }
        }
      }
    }
  };

  const recordStats = (t: number) => {
    const counts = { S: 0, I: 0, R: 0 };
    for (const a of agents.current) counts[a.state]++;
    setHistory((prev) => [...prev, { t, ...counts }]);
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = isDark ? "#0f172a" : "#ffffff";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    for (const a of agents.current) {
      ctx.beginPath();
      if (a.state === "S") ctx.fillStyle = "#3b82f6";
      if (a.state === "I") ctx.fillStyle = "#ef4444";
      if (a.state === "R") {
        ctx.fillStyle = "#22c55e";
        ctx.arc(a.x, a.y, 4, 0, Math.PI * 2); // smaller recovered agents
        ctx.fill();
        continue;
      }
      ctx.arc(a.x, a.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const data = {
    labels: history.map((d) => d.t),
    datasets: [
      { label: "Susceptible", data: history.map((d) => d.S), borderColor: "#3b82f6", fill: false },
      { label: "Infected", data: history.map((d) => d.I), borderColor: "#ef4444", fill: false },
      { label: "Recovered", data: history.map((d) => d.R), borderColor: "#22c55e", fill: false },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: "bottom" as const } },
    scales: {
      x: { display: false },
      y: { beginAtZero: true },
    },
  };

  return (
    <SimulationContainer $isDark={isDark}>
      <Header>
        <Activity size={20} />
        Disease Spread Simulation
      </Header>
      <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="rounded-2xl shadow" />

      <div className="w-full h-64">
        <Line data={data} options={options} />
      </div>

      <Controls>
        <button onClick={() => setLocalRunning((r) => !r)}>
          {localRunning ? <PauseCircle size={28} /> : <PlayCircle size={28} />}
        </button>
        <button onClick={initAgents}>
          <RefreshCw size={24} />
        </button>
        <SliderGroup>
          <label>Population</label>
          <input type="range" min={50} max={300} value={population} onChange={(e) => setPopulation(Number(e.target.value))} />
        </SliderGroup>
        <SliderGroup>
          <label>Infection Radius</label>
          <input type="range" min={5} max={30} value={infectionRadius} onChange={(e) => setInfectionRadius(Number(e.target.value))} />
        </SliderGroup>
        <SliderGroup>
          <label>Recovery Time</label>
          <input type="range" min={200} max={1000} step={50} value={recoveryTime} onChange={(e) => setRecoveryTime(Number(e.target.value))} />
        </SliderGroup>
      </Controls>
    </SimulationContainer>
  );
}
