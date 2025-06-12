export class DomainEvent {
    constructor() {
        this._occurredOn = new Date();
    }

    get occurredOn() {
        return this._occurredOn;
    }
}
