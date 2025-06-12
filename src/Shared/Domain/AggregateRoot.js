export class AggregateRoot {
    constructor() {
        this._domainEvents = [];
    }

    addDomainEvent(event) {
        this._domainEvents.push(event);
    }

    clearDomainEvents() {
        this._domainEvents = [];
    }

    getDomainEvents() {
        return [...this._domainEvents];
    }
}
