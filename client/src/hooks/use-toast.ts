import React from "react";

// Fixed toast hook without React dependencies causing null useState
let toastId = 0;

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

interface ToastState {
  toasts: Toast[];
}

// Global state management without React hooks
let globalState: ToastState = { toasts: [] };
let listeners: Array<(state: ToastState) => void> = [];

function notifyListeners() {
  listeners.forEach(listener => listener(globalState));
}

function generateId(): string {
  return (++toastId).toString();
}

function toastFunction({
  title,
  description,
  variant = 'default'
}: Omit<Toast, 'id'>) {
  const id = generateId();
  const newToast: Toast = { id, title, description, variant };
  
  globalState = {
    ...globalState,
    toasts: [...globalState.toasts, newToast]
  };
  
  notifyListeners();
  
  // Auto dismiss after 5 seconds
  setTimeout(() => {
    dismiss(id);
  }, 5000);
  
  return {
    id,
    dismiss: () => dismiss(id),
    update: (props: Partial<Toast>) => update(id, props)
  };
}

function dismiss(toastId: string) {
  globalState = {
    ...globalState,
    toasts: globalState.toasts.filter(t => t.id !== toastId)
  };
  notifyListeners();
}

function update(toastId: string, props: Partial<Toast>) {
  globalState = {
    ...globalState,
    toasts: globalState.toasts.map(t => 
      t.id === toastId ? { ...t, ...props } : t
    )
  };
  notifyListeners();
}

// Export toast function as well
export const toast = toastFunction;

// Simple hook replacement that works without React hooks
export function useToast() {
  // Return the current state and functions
  return {
    toasts: globalState.toasts,
    toast,
    dismiss: (toastId?: string) => {
      if (toastId) {
        dismiss(toastId);
      } else {
        globalState = { toasts: [] };
        notifyListeners();
      }
    }
  };
}