// Simple event emitter để notify AuthContext khi có 401 error
// Không dùng Node.js EventEmitter vì có thể không tương thích với React Native

type EventCallback = () => void;

class SimpleEventEmitter {
    private listeners: Map<string, EventCallback[]> = new Map();

    on(event: string, callback: EventCallback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);
    }

    off(event: string, callback: EventCallback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event: string) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback());
        }
    }
}

export const authEvents = new SimpleEventEmitter();

// Event names
export const AUTH_EVENTS = {
    TOKEN_EXPIRED: 'token_expired',
    LOGOUT_REQUIRED: 'logout_required',
} as const;

