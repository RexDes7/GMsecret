"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

type Props = { children: React.ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends React.Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[ErrorBoundary]", error, info);
    }
  }

  reset = () => this.setState({ error: null });

  override render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="text-2xl font-semibold">Что-то сломалось</h1>
        <p className="text-sm text-muted-foreground">
          Произошла непредвиденная ошибка. Попробуйте обновить страницу.
        </p>
        {process.env.NODE_ENV !== "production" && this.state.error?.message ? (
          <pre className="max-w-full overflow-auto rounded-md bg-muted/40 px-3 py-2 text-left text-xs text-muted-foreground">
            {this.state.error.message}
          </pre>
        ) : null}
        <Button onClick={this.reset}>Попробовать снова</Button>
      </div>
    );
  }
}
