/// <reference lib="webworker" />
declare const self: DedicatedWorkerGlobalScope;
export {};

import {
  type SimState,
  trainHeadless,
  restoreNEATState,
  captureNEATState,
} from './td.logic';

// ── Message protocol ──

interface TrainRequest {
  type: 'train';
  state: SimState;
  generations: number;
  neatState: { nextHiddenId: number; nextInnov: number; innovCache: [string, number][] };
  trainId: number; // for stale-result detection
}

interface ProgressMsg {
  type: 'progress';
  gen: number;
  total: number;
  trainId: number;
}

interface DoneMsg {
  type: 'done';
  state: SimState;
  neatState: { nextHiddenId: number; nextInnov: number; innovCache: [string, number][] };
  trainId: number;
}

self.onmessage = (e: MessageEvent<TrainRequest>) => {
  const { state, generations, neatState, trainId } = e.data;

  // Restore NEAT innovation registry in worker context
  restoreNEATState(neatState);

  trainHeadless(state, generations, (gen, total) => {
    self.postMessage({ type: 'progress', gen, total, trainId } satisfies ProgressMsg);
  });

  self.postMessage({
    type: 'done',
    state,
    neatState: captureNEATState(),
    trainId,
  } satisfies DoneMsg);
};
