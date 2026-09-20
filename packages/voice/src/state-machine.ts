import type { CallSessionState } from './types';

export type StateChangeHandler = (from: CallSessionState, to: CallSessionState) => void;

const VALID_TRANSITIONS: Record<CallSessionState, CallSessionState[]> = {
  idle: ['ringing', 'connected', 'failed'],
  ringing: ['connected', 'failed', 'ended'],
  connected: ['listening', 'speaking', 'ending', 'failed'],
  listening: ['thinking', 'speaking', 'ending', 'failed'],
  thinking: ['speaking', 'interrupted', 'ending', 'failed'],
  speaking: ['listening', 'interrupted', 'ending', 'failed'],
  interrupted: ['listening', 'thinking', 'ending', 'failed'],
  ending: ['ended', 'failed'],
  ended: [],
  failed: [],
};

export class VoiceStateMachine {
  private currentState: CallSessionState = 'idle';
  private listeners: StateChangeHandler[] = [];
  private stateHistory: { state: CallSessionState; timestamp: Date }[] = [];

  constructor(initialState: CallSessionState = 'idle') {
    this.currentState = initialState;
    this.stateHistory.push({ state: initialState, timestamp: new Date() });
  }

  get state(): CallSessionState {
    return this.currentState;
  }

  get history() {
    return [...this.stateHistory];
  }

  canTransitionTo(nextState: CallSessionState): boolean {
    if (this.currentState === nextState) return true;
    const allowed = VALID_TRANSITIONS[this.currentState] || [];
    return allowed.includes(nextState);
  }

  transition(nextState: CallSessionState): CallSessionState {
    if (this.currentState === nextState) return this.currentState;

    if (!this.canTransitionTo(nextState)) {
      throw new Error(
        `Invalid state transition: Cannot transition from '${this.currentState}' to '${nextState}'`
      );
    }

    const prevState = this.currentState;
    this.currentState = nextState;
    this.stateHistory.push({ state: nextState, timestamp: new Date() });

    this.listeners.forEach((listener) => {
      try {
        listener(prevState, nextState);
      } catch (err) {
        console.error('Error in state change listener:', err);
      }
    });

    return this.currentState;
  }

  onStateChange(listener: StateChangeHandler): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  isTerminal(): boolean {
    return this.currentState === 'ended' || this.currentState === 'failed';
  }
}
