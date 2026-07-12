import { Injectable, signal, effect } from '@angular/core';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

const IS_BROWSER = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
const STORAGE_KEY = 'travgo_chat_history';
const OPEN_KEY = 'travgo_chat_open';
const MAX_CHARS = 500;
const TIMEOUT_MS = 9000; // Netlify free tier functions time out at 10s; we fail over early to WhatsApp

// In local dev, Angular runs on :4200 but Netlify functions are on :8888
// Detect and redirect automatically
const FUNCTIONS_BASE = IS_BROWSER && window.location.port === '4200'
  ? 'http://localhost:8888'
  : '';

const WELCOME: ChatMessage = {
  role: 'assistant',
  content: 'Hi there! 🌴 I am Travgo AI, your personal travel assistant. Ask me anything about our travel packages, destinations, pricing, or custom itineraries!',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  readonly isOpen = signal<boolean>(false);
  readonly messages = signal<ChatMessage[]>(this.getInitialMessages());
  readonly isLoading = signal<boolean>(false);

  constructor() {
    if (IS_BROWSER) {
      // Persist messages
      effect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.messages()));
      });

      // Restore open state
      if (localStorage.getItem(OPEN_KEY) === 'true') {
        this.isOpen.set(true);
      }

      // Persist open state
      effect(() => {
        localStorage.setItem(OPEN_KEY, String(this.isOpen()));
      });
    }
  }

  private getInitialMessages(): ChatMessage[] {
    if (IS_BROWSER) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // Fall through to default
        }
      }
    }
    return [WELCOME];
  }

  private now(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  toggleChat(): void { this.isOpen.update(v => !v); }
  closeChat(): void  { this.isOpen.set(false); }
  openChat(): void   { this.isOpen.set(true); }

  async sendMessage(content: string): Promise<void> {
    const trimmed = content.trim().slice(0, MAX_CHARS);
    if (!trimmed || this.isLoading()) return;

    this.messages.update(msgs => [...msgs, { role: 'user', content: trimmed, timestamp: this.now() }]);
    this.isLoading.set(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(`${FUNCTIONS_BASE}/.netlify/functions/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: this.messages() }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.reply) {
        this.messages.update(msgs => [...msgs, { role: 'assistant', content: data.reply, timestamp: this.now() }]);
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error('Unexpected response format.');
      }
    } catch (error: any) {
      clearTimeout(timeout);
      const isTimeout = error.name === 'AbortError';
      this.messages.update(msgs => [
        ...msgs,
        {
          role: 'assistant',
          content: isTimeout
            ? '⏱️ The request timed out. Please try again or contact us on WhatsApp: +91 8893147696'
            : `⚠️ ${error.message || 'Connection error. Please try again.'}`,
          timestamp: this.now()
        }
      ]);
    } finally {
      this.isLoading.set(false);
    }
  }

  clearChat(): void {
    if (IS_BROWSER) {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.messages.set([{ ...WELCOME, timestamp: this.now() }]);
  }
}
