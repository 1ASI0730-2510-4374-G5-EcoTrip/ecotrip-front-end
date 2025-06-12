import { ValueObject } from '@/Shared/Domain/ValueObject';

export class ExperienceId extends ValueObject {
    constructor(value) {
        super();
        this.value = value;
    }
}

export class ExperienceTitle extends ValueObject {
    constructor(value) {
        super();
        this.value = value;
    }

    validate() {
        if (!this.value?.trim()) {
            throw new Error('El título es requerido');
        }
        if (this.value.length > 100) {
            throw new Error('El título no puede exceder los 100 caracteres');
        }
    }
}

export class ExperienceDescription extends ValueObject {
    constructor(value) {
        super();
        this.value = value;
    }

    validate() {
        if (!this.value?.trim()) {
            throw new Error('La descripción es requerida');
        }
        if (this.value.length > 2000) {
            throw new Error('La descripción no puede exceder los 2000 caracteres');
        }
    }
}

export class Price extends ValueObject {
    constructor(value) {
        super();
        this.value = value;
    }

    validate() {
        if (typeof this.value !== 'number' || this.value < 0) {
            throw new Error('El precio debe ser un número positivo');
        }
    }

    format() {
        return `S/ ${this.value.toFixed(2)}`;
    }
}

export class Location extends ValueObject {
    constructor(value) {
        super();
        this.value = value;
    }

    validate() {
        if (!this.value?.trim()) {
            throw new Error('La ubicación es requerida');
        }
    }

    format() {
        return this.value;
    }
}

export class Duration extends ValueObject {
    constructor(value) {
        super();
        this.value = value;
    }

    validate() {
        if (!this.value?.trim()) {
            throw new Error('La duración es requerida');
        }
    }

    format() {
        return this.value;
    }
}
