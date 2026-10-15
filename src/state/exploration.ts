export type Mode = 'landing' | 'explore'

export interface ExplorationState {
  mode: Mode
  /** Landmark currently focused by the camera and shown in the panel. */
  selectedId: string | null
  /** Incremented on every "reset view" so the camera rig can react even when nothing is selected. */
  viewNonce: number
}

export type ExplorationAction =
  | { type: 'enter' }
  | { type: 'exit' }
  | { type: 'select'; id: string }
  | { type: 'deselect' }
  | { type: 'resetView' }

export const initialExplorationState: ExplorationState = {
  mode: 'landing',
  selectedId: null,
  viewNonce: 0,
}

export function explorationReducer(
  state: ExplorationState,
  action: ExplorationAction,
): ExplorationState {
  switch (action.type) {
    case 'enter':
      return state.mode === 'explore' ? state : { ...state, mode: 'explore' }
    case 'exit':
      return { ...state, mode: 'landing', selectedId: null }
    case 'select':
      // Selecting a landmark always implies exploration mode.
      if (state.mode === 'explore' && state.selectedId === action.id) return state
      return { ...state, mode: 'explore', selectedId: action.id }
    case 'deselect':
      return state.selectedId === null ? state : { ...state, selectedId: null }
    case 'resetView':
      return { ...state, selectedId: null, viewNonce: state.viewNonce + 1 }
  }
}
