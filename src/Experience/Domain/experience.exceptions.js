export class ExperienceNotFoundError extends Error {
    constructor(id) {
        super(`Experience with id ${id} not found`);
        this.name = 'ExperienceNotFoundError';
    }
}

export class InvalidExperienceDataError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidExperienceDataError';
    }
}

export class ExperienceValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ExperienceValidationError';
    }
}
