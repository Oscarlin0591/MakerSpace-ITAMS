/**
 * setupTests.ts
 * Frontend Jest setup for jest-dom and browser API mocks.
 *
 * @ai-assisted Codex (OpenAI) — https://openai.com/codex
 * AI used to configure React Testing Library browser test setup.
 */

import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

class MockEventSource {
  url: string;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
  }

  addEventListener = jest.fn();
  close = jest.fn();
}

Object.defineProperty(window, 'EventSource', {
  writable: true,
  value: MockEventSource,
});

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: class {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
  },
});
