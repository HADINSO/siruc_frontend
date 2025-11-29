import { Injectable } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toasts: Toast[] = [];
  private toastContainer: HTMLElement | null = null;

  constructor() {
    this.createToastContainer();
  }

  private createToastContainer(): void {
    if (typeof document !== 'undefined') {
      this.toastContainer = document.createElement('div');
      this.toastContainer.className = 'fixed bottom-4 right-4 z-50 space-y-3 max-w-sm';
      document.body.appendChild(this.toastContainer);
    }
  }

  show(type: ToastType, title: string, message: string, duration: number = 3000): void {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: Toast = { id, type, title, message, duration };
    
    this.toasts.push(toast);
    this.renderToast(toast);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  success(title: string, message: string, duration?: number): void {
    this.show('success', title, message, duration);
  }

  error(title: string, message: string, duration?: number): void {
    this.show('error', title, message, duration);
  }

  warning(title: string, message: string, duration?: number): void {
    this.show('warning', title, message, duration);
  }

  info(title: string, message: string, duration?: number): void {
    this.show('info', title, message, duration);
  }

  remove(id: string): void {
    const index = this.toasts.findIndex(t => t.id === id);
    if (index !== -1) {
      this.toasts.splice(index, 1);
      const toastElement = document.getElementById(id);
      if (toastElement) {
        toastElement.classList.add('toast-hide');
        setTimeout(() => toastElement.remove(), 300);
      }
    }
  }

  private renderToast(toast: Toast): void {
    if (!this.toastContainer) return;

    const toastElement = document.createElement('div');
    toastElement.id = toast.id;
    toastElement.className = `toast-item bg-white rounded-xl shadow-2xl p-4 flex items-start gap-3 border-l-4 ${this.getBorderColor(toast.type)} transform transition-all duration-300 ease-out`;
    
    toastElement.innerHTML = `
      <div class="flex-shrink-0">
        <div class="h-10 w-10 rounded-full flex items-center justify-center ${this.getBgColor(toast.type)}">
          ${this.getIcon(toast.type)}
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-gray-900">${toast.title}</p>
        <p class="text-sm text-gray-600 mt-1">${toast.message}</p>
      </div>
      <button 
        onclick="document.getElementById('${toast.id}').remove()" 
        class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    `;

    this.toastContainer.appendChild(toastElement);

    // Trigger animation
    setTimeout(() => {
      toastElement.classList.add('toast-show');
    }, 10);
  }

  private getBorderColor(type: ToastType): string {
    const colors = {
      success: 'border-green-500',
      error: 'border-red-500',
      warning: 'border-orange-500',
      info: 'border-blue-500'
    };
    return colors[type];
  }

  private getBgColor(type: ToastType): string {
    const colors = {
      success: 'bg-green-100',
      error: 'bg-red-100',
      warning: 'bg-orange-100',
      info: 'bg-blue-100'
    };
    return colors[type];
  }

  private getIcon(type: ToastType): string {
    const icons = {
      success: '<svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
      error: '<svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>',
      warning: '<svg class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
      info: '<svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
    };
    return icons[type];
  }
}
