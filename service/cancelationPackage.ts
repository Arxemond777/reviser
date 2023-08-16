interface AbortControllerInterface {
    readonly signal: AbortSignalInterface;

    abort(reason?: any): void;
}

declare var AbortController: {
    prototype: AbortControllerInterface;
    new(): AbortControllerInterface;
};

interface AbortSignalInterface {
    readonly aborted: boolean;

    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;

    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare var AbortSignal: {
    prototype: AbortSignalInterface;
    new(): AbortSignalInterface;
};

class AbortSignal implements AbortSignalInterface {
    listeners: any[];
    aborted: boolean;

    constructor() {
        this.aborted = false;
        this.listeners = [];
    }

    addEventListener(type, listener) {
        if (type === 'abort' && typeof listener === 'function') {
            this.listeners.push(listener);
        }
    }

    removeEventListener(type, listener) {
        if (type === 'abort' && typeof listener === 'function') {
            const index = this.listeners.indexOf(listener);
            if (index !== -1) {
                this.listeners.splice(index, 1);
            }
        }
    }
}

class AbortController implements AbortControllerInterface {

    readonly signal: AbortSignalInterface;

    constructor() {
        this.signal = new AbortSignal();
    }

    abort() {
        if (!this.signal.aborted) {
            this.signal.aborted = true;
            for (const listener of this.signal.listeners) {
                listener.call(this.signal);
            }
            this.signal.listeners = [];
        }
    }
}
