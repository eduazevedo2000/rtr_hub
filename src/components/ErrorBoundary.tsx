import React, { type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
          <h1 className="font-racing text-3xl font-bold text-white mb-4">
            Algo correu mal
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md">
            Ocorreu um erro inesperado. Tenta recarregar a página.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = "/";
            }}
            className="rounded-md bg-primary px-6 py-3 font-racing text-sm uppercase tracking-wider text-white hover:bg-primary/90 transition-colors"
          >
            Voltar ao início
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
