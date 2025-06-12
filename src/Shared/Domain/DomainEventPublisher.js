export class DomainEventPublisher {
    constructor() {
        this._handlers = new Map();
    }

    subscribe(eventName, handler) {
        if (!this._handlers.has(eventName)) {
            this._handlers.set(eventName, []);
        }
        this._handlers.get(eventName).push(handler);
    }

    publish(event) {
        const eventName = event.getEventName();
        if (this._handlers.has(eventName)) {
            this._handlers.get(eventName).forEach(handler => {
                handler(event);
            });
        }
    }
}
