import { createElement, ReactNode } from "react";

interface ReactWrapperProps {
  children: ReactNode;
}

// Simple wrapper to ensure React context is properly initialized
export function ReactWrapper({ children }: ReactWrapperProps) {
  return createElement('div', { style: { display: 'contents' } }, children);
}