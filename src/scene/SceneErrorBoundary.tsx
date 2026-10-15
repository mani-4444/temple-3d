import { Component, type ReactNode } from 'react'

interface Props {
  onError: (error: Error) => void
  children: ReactNode
}

interface State {
  failed: boolean
}

/** Catches model-loading and render errors inside the Canvas and reports them to the HTML UI. */
export class SceneErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error) {
    this.props.onError(error)
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}
