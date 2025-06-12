import { AggregateRoot } from '@/Shared/Domain/AggregateRoot';
import { 
    ExperienceId, 
    ExperienceTitle, 
    ExperienceDescription, 
    Price, 
    Location, 
    Duration 
} from './experience.value-objects.js';

export class Experience extends AggregateRoot {
    constructor({
        id = "",
        title = "",
        description = "",
        location = "",
        duration = "0 días",
        price = 0.0,
        images = [],
        included = [],
        notIncluded = [],
        important = "",
        agencyId = "",
        categories = [],
        sustainability = {
            ecoCertifications: [],
            sustainablePractices: [],
            localCommunityImpact: ''
        },
        difficulty = 'medium',
        maxGroupSize = 10,
        languages = ['Español'],
        reviews = []
    }) {
        super();
        this.id = new ExperienceId(id);
        this.title = new ExperienceTitle(title);
        this.description = new ExperienceDescription(description);
        this.price = new Price(price);
        this.location = new Location(location);
        this.duration = new Duration(duration);
        this.images = images;
        this.included = included;
        this.notIncluded = notIncluded;
        this.important = important;
        this.agencyId = agencyId;
        this.categories = categories;
        this.sustainability = sustainability;
        this.difficulty = difficulty;
        this.maxGroupSize = maxGroupSize;
        this.languages = languages;
        this._reviews = reviews;
    }

    validate() {
        if (!this.title?.value?.trim()) {
            throw new Error('El título es requerido');
        }
        if (!this.description?.value?.trim()) {
            throw new Error('La descripción es requerida');
        }
        if (!this.agencyId) {
            throw new Error('La experiencia debe estar asociada a una agencia');
        }
        if (!this.images?.length) {
            throw new Error('Debe incluir al menos una imagen');
        }
    }

    addReview(userId, rating, comment) {
        const review = {
            userId,
            rating,
            comment,
            date: new Date()
        };
        this._reviews.push(review);
        return review;
    }

    isEcoFriendly() {
        return this.sustainability.ecoCertifications.length > 0 ||
               this.sustainability.sustainablePractices.length > 0;
    }

    getFormattedPrice() {
        return this.price.format();
    }

    getDurationText() {
        return this.duration.format();
    }

    getLocationText() {
        return this.location.format();
    }

    addCategory(category) {
        if (!this.categories.includes(category)) {
            this.categories.push(category);
        }
    }

    removeCategory(category) {
        const index = this.categories.indexOf(category);
        if (index > -1) {
            this.categories.splice(index, 1);
        }
    }

    addSustainablePractice(practice) {
        if (!this.sustainability.sustainablePractices.includes(practice)) {
            this.sustainability.sustainablePractices.push(practice);
        }
    }

    addEcoCertification(certification) {
        if (!this.sustainability.ecoCertifications.includes(certification)) {
            this.sustainability.ecoCertifications.push(certification);
        }
    }

    toJSON() {
        return {
            id: this.id.value,
            title: this.title.value,
            description: this.description.value,
            location: this.location.value,
            duration: this.duration.value,
            price: this.price.value,
            images: [...this.images],
            included: [...this.included],
            notIncluded: [...this.notIncluded],
            important: this.important,
            agencyId: this.agencyId,
            categories: [...this.categories],
            sustainability: {...this.sustainability},
            difficulty: this.difficulty,
            maxGroupSize: this.maxGroupSize,
            languages: [...this.languages],
            reviews: this._reviews.map(review => ({...review}))
        };
    }
}
