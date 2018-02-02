import { bind } from 'bind-decorator';

const JSON_PARSING = false;

export default class WorkerMessaging<T> {

    private readonly handlers = new Map<T, EventMessageHandler>();

    constructor(
        private readonly target: Window,
    ) {
        target.addEventListener('message', this.onMessage);
    }

    send(type: T, payload: object | null) {
        const message = { type, payload };
        const data = JSON_PARSING ? JSON.stringify(message) : message;
        (this.target as RealWindow).postMessage(data);
    }

    addHandler(type: T, handler: EventMessageHandler) {
        if (this.handlers.has(type)) {
            throw new Error(`Handler ${type} already used`);
        }

        this.handlers.set(type, handler);
    }

    @bind
    private onMessage(event: MessageEvent) {
        if (JSON_PARSING && typeof event.data !== 'string') {
            return;
        }

        const { data } = event;
        const { type, payload } = JSON_PARSING ? JSON.parse(data) : data;
        const handler = this.handlers.get(type);

        if (handler) {
            handler(payload, event);
        } else {
            console.warn(`Unhandled message ${type}`);
        }
    }

}

// We have to do this because FUCKING TYPESCRIPT thinks second param is mandatory!!!
interface RealWindow extends Window {
    postMessage(message: any, targetOrigin?: string, transfer?: any[]): void;
}

type EventMessageHandler<T = any> = (data: T, event: MessageEvent) => void;
