import { AggregateRoot } from '@/Shared/Domain/AggregateRoot';
import { ExperienceId } from '../ValueObjects/ExperienceId';
import { ExperienceTitle } from '../ValueObjects/ExperienceTitle';
import { ExperienceDescription } from '../ValueObjects/ExperienceDescription';
import { Duration } from '../ValueObjects/Duration';
import { Price } from '../ValueObjects/Price';
import { Location } from '../ValueObjects/Location';
import { Review } from '../Entities/Review';
import { ExperienceCreatedDomainEvent } from '../Events/ExperienceCreatedDomainEvent';
import { ExperienceBookedDomainEvent } from '../Events/ExperienceBookedDomainEvent';

export class ExperienceAggregate extends AggregateRoot {
    constructor(
        id,
        title,
        description,
        type,
        location,
        duration,
        price,
        agencyId
    ) {
        super();
        this._id = id;
        this._title = title;
        this._description = description;
        this._type = type;
        this._location = location;
        this._duration = duration;
        this._price = price;
        this._agencyId = agencyId;
        this._reviews = [];
        this._isSustainable = false;
        this._maxParticipants = 0;
        this._requirements = [];
    }

    get id() { return this._id; }
    get title() { return this._title; }
    get description() { return this._description; }
    get type() { return this._type; }
    get location() { return this._location; }
    get duration() { return this._duration; }
    get price() { return this._price; }
    get agencyId() { return this._agencyId; }
    get reviews() { return [...this._reviews]; }
    get isSustainable() { return this._isSustainable; }
    get maxParticipants() { return this._maxParticipants; }
    get requirements() { return [...this._requirements]; }

    static create(props) {
        const experience = new ExperienceAggregate(
            new ExperienceId(props.id),
            new ExperienceTitle(props.title),
            new ExperienceDescription(props.description),
            props.type,
            new Location(props.location),
            new Duration(props.duration),
            new Price(props.price),
            props.agencyId
        );

        experience.addDomainEvent(new ExperienceCreatedDomainEvent({
            aggregateId: experience.id.value,
            title: experience.title.value,
            agencyId: experience.agencyId
        }));

        return experience;
    }

    addReview(review) {
        if (!(review instanceof Review)) {
            throw new Error('Invalid review object');
        }
        this._reviews.push(review);
    }

    book(userId, numberOfParticipants) {
        if (numberOfParticipants > this._maxParticipants) {
            throw new Error('Exceeds maximum participants allowed');
        }

        this.addDomainEvent(new ExperienceBookedDomainEvent({
            aggregateId: this.id.value,
            userId,
            numberOfParticipants
        }));
    }

    setMaxParticipants(number) {
        if (number <= 0) {
            throw new Error('Maximum participants must be greater than 0');
        }
        this._maxParticipants = number;
    }

    setSustainable(value) {
        this._isSustainable = Boolean(value);
    }

    addRequirement(requirement) {
        if (!requirement || typeof requirement !== 'string') {
            throw new Error('Invalid requirement');
        }
        this._requirements.push(requirement);
    }

    toJSON() {
        return {
            id: this._id.value,
            title: this._title.value,
            description: this._description.value,
            type: this._type,
            location: this._location.value,
            duration: this._duration.value,
            price: this._price.value,
            agencyId: this._agencyId,
            reviews: this._reviews.map(review => review.toJSON()),
            isSustainable: this._isSustainable,
            maxParticipants: this._maxParticipants,
            requirements: [...this._requirements]
        };
    }
}
