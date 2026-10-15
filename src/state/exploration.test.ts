import { describe, expect, it } from 'vitest'
import { explorationReducer, initialExplorationState as initial } from './exploration'

describe('explorationReducer', () => {
  it('enters and exits exploration mode', () => {
    const explored = explorationReducer(initial, { type: 'enter' })
    expect(explored.mode).toBe('explore')
    expect(explorationReducer(explored, { type: 'enter' })).toBe(explored)
    const back = explorationReducer({ ...explored, selectedId: 'vimana' }, { type: 'exit' })
    expect(back).toMatchObject({ mode: 'landing', selectedId: null })
  })

  it('selecting a landmark switches to explore mode and replaces the selection', () => {
    const a = explorationReducer(initial, { type: 'select', id: 'gopuram' })
    expect(a).toMatchObject({ mode: 'explore', selectedId: 'gopuram' })
    const b = explorationReducer(a, { type: 'select', id: 'mandapa' })
    expect(b.selectedId).toBe('mandapa')
    expect(explorationReducer(b, { type: 'select', id: 'mandapa' })).toBe(b)
  })

  it('deselect closes the panel without leaving explore mode', () => {
    const a = explorationReducer(initial, { type: 'select', id: 'gopuram' })
    const b = explorationReducer(a, { type: 'deselect' })
    expect(b).toMatchObject({ mode: 'explore', selectedId: null })
    expect(explorationReducer(b, { type: 'deselect' })).toBe(b)
  })

  it('resetView clears the selection and bumps the nonce every time', () => {
    const a = explorationReducer(initial, { type: 'select', id: 'gopuram' })
    const b = explorationReducer(a, { type: 'resetView' })
    const c = explorationReducer(b, { type: 'resetView' })
    expect(b).toMatchObject({ selectedId: null, viewNonce: 1 })
    expect(c.viewNonce).toBe(2)
  })
})
