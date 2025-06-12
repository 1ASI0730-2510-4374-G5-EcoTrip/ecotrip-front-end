import { DomainEvent } from '@/Shared/Domain/DomainEvent';

export class ExperienceCreatedDomainEvent extends DomainEvent {
    static EVENT_NAME = 'experience.created';

    constructor({ aggregateId, title, agencyId }) {
        super(ExperienceCreatedDomainEvent.EVENT_NAME);
        this.aggregateId = aggregateId;
        this.title = title;
        this.agencyId = agencyId;
        this.occurredOn = new Date();
    }

    getEventName() {
        return ExperienceCreatedDomainEvent.EVENT_NAME;
    }
}
