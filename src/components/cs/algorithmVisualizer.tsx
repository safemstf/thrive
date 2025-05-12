import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

// Step type
type SortStep = { array: number[]; highlights: number[] };

type Algorithm = {
  name: string;
  generateSteps: (arr: number[]) => SortStep[];
};

// Bubble Sort
function bubbleSteps(arr: number[]): SortStep[] {
  const a = arr.slice(), steps: SortStep[] = [];
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      steps.push({ array: a.slice(), highlights: [j, j + 1] });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({ array: a.slice(), highlights: [j, j + 1] });
      }
    }
  }
  steps.push({ array: a.slice(), highlights: [] });
  return steps;
}

// Insertion Sort
function insertionSteps(arr: number[]): SortStep[] {
  const a = arr.slice(), steps: SortStep[] = [];
  for (let i = 1; i < a.length; i++) {
    const key = a[i]; let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      steps.push({ array: a.slice(), highlights: [j, j + 1] });
      j--;
    }
    a[j + 1] = key;
    steps.push({ array: a.slice(), highlights: [j + 1] });
  }
  steps.push({ array: a.slice(), highlights: [] });
  return steps;
}

// Selection Sort
function selectionSteps(arr: number[]): SortStep[] {
  const a = arr.slice(), steps: SortStep[] = [];
  for (let i = 0; i < a.length - 1; i++) {
    let min = i;
    for (let j = i + 1; j < a.length; j++) {
      steps.push({ array: a.slice(), highlights: [min, j] });
      if (a[j] < a[min]) min = j;
    }
    [a[i], a[min]] = [a[min], a[i]];
    steps.push({ array: a.slice(), highlights: [i, min] });
  }
  steps.push({ array: a.slice(), highlights: [] });
  return steps;
}

// Merge Sort
function mergeSortSteps(arr: number[]): SortStep[] {
  const a = arr.slice(), steps: SortStep[] = [];
  function merge(l: number, m: number, r: number) {
    const left = a.slice(l, m + 1), right = a.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
      a[k++] = left[i] <= right[j] ? left[i++] : right[j++];
      steps.push({ array: a.slice(), highlights: [k - 1] });
    }
    while (i < left.length) { a[k++] = left[i++]; steps.push({ array: a.slice(), highlights: [k - 1] }); }
    while (j < right.length) { a[k++] = right[j++]; steps.push({ array: a.slice(), highlights: [k - 1] }); }
  }
  function sort(l: number, r: number) {
    if (l >= r) return;
    const m = (l + r) >> 1;
    sort(l, m); sort(m + 1, r);
    merge(l, m, r);
  }
  sort(0, a.length - 1);
  steps.push({ array: a.slice(), highlights: [] });
  return steps;
}

// Quick Sort
function quickSortSteps(arr: number[]): SortStep[] {
  const a = arr.slice(), steps: SortStep[] = [];
  function partition(l: number, r: number) {
    const pivot = a[r]; let i = l;
    for (let j = l; j < r; j++) {
      steps.push({ array: a.slice(), highlights: [j, r] });
      if (a[j] < pivot) { [a[i], a[j]] = [a[j], a[i]]; steps.push({ array: a.slice(), highlights: [i, j] }); i++; }
    }
    [a[i], a[r]] = [a[r], a[i]];
    steps.push({ array: a.slice(), highlights: [i, r] });
    return i;
  }
  function sort(l: number, r: number) { if (l < r) { const p = partition(l, r); sort(l, p - 1); sort(p + 1, r); } }
  sort(0, a.length - 1);
  steps.push({ array: a.slice(), highlights: [] });
  return steps;
}

// Heap Sort
function heapSortSteps(arr: number[]): SortStep[] {
  const a = arr.slice(), steps: SortStep[] = [];
  function heapify(n: number, i: number) {
    let largest = i, l = 2 * i + 1, r = 2 * i + 2;
    if (l < n && a[l] > a[largest]) largest = l;
    if (r < n && a[r] > a[largest]) largest = r;
    if (largest !== i) {
      [a[i], a[largest]] = [a[largest], a[i]];
      steps.push({ array: a.slice(), highlights: [i, largest] });
      heapify(n, largest);
    }
  }
  for (let i = Math.floor(a.length / 2) - 1; i >= 0; i--) heapify(a.length, i);
  for (let i = a.length - 1; i > 0; i--) {
    [a[0], a[i]] = [a[i], a[0]];
    steps.push({ array: a.slice(), highlights: [0, i] });
    heapify(i, 0);
  }
  steps.push({ array: a.slice(), highlights: [] });
  return steps;
}

const algorithms: Algorithm[] = [
  { name: 'Bubble', generateSteps: bubbleSteps },
  { name: 'Insertion', generateSteps: insertionSteps },
  { name: 'Selection', generateSteps: selectionSteps },
  { name: 'Merge', generateSteps: mergeSortSteps },
  { name: 'Quick', generateSteps: quickSortSteps },
  { name: 'Heap', generateSteps: heapSortSteps },
];

export default function AlgorithmVisualizer() {
  const [algIdx, setAlgIdx] = useState(0);
  const [data, setData] = useState<number[]>([]);
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const arr = Array.from({ length: 50 }, () => Math.floor(Math.random() * 150) + 1);
    setData(arr);
    setSteps(algorithms[algIdx].generateSteps(arr));
    setStepIdx(0);
    intervalRef.current && clearInterval(intervalRef.current);
  }, [algIdx]);

  const togglePlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else {
      intervalRef.current = window.setInterval(() => setStepIdx(i => Math.min(i + 1, steps.length - 1)), 75);
    }
  };

  const current = steps[stepIdx] || { array: data, highlights: [] };

  return (
    <Wrapper>
      <Header>
        <Select
          value={algIdx}
          onChange={e => setAlgIdx(Number(e.target.value))}
        >
          {algorithms.map((a, i) => <option key={i} value={i}>{a.name}</option>)}
        </Select>
        <ToggleBtn onClick={togglePlay}>
          {intervalRef.current ? 'Pause' : 'Play'}
        </ToggleBtn>
      </Header>
      <BarContainer>
        {current.array.map((v, i) => (
          <Bar
            key={i}
            height={`${(v / 150) * 100}%`}
            highlighted={current.highlights.includes(i)}
          />
        ))}
      </BarContainer>
    </Wrapper>
  );
}

// Styled Components
const Wrapper = styled.div`
  background: #1a1a2e;
  padding: 0.8rem;
  border-radius: 8px;
  color: #eef;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const Select = styled.select`
  background: #0f3460;
  color: #eef;
  border: none;
  padding: 0.3rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
`;

const ToggleBtn = styled.button`
  background: #e94560;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  color: white;
  font-size: 0.8rem;
  cursor: pointer;
  transition: transform 0.1s;
  &:hover { transform: scale(1.05); }
`;

const BarContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 1px;
  background: #16213e;
  padding: 0.2rem;
  border-radius: 4px;
`;

const barAnim = keyframes`
  from { opacity: 0.7; }
  to { opacity: 1; }
`;

const Bar = styled.div<{ height: string; highlighted: boolean }>`
  flex: 1;
  height: ${props => props.height};
  background: ${props => (props.highlighted ? '#e94560' : '#0f3460')};
  animation: ${barAnim} 0.2s ease-in;
`;
