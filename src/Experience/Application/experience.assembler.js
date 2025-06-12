import { Experience } from '../Domain/experience.entity.js';

export class ExperienceAssembler {    static toEntityFromResource(resource) {
        if (!resource) return null;
        
        return new Experience({
            id: resource.id || Date.now().toString(),
            title: resource.title || '',
            description: resource.description || '',
            location: resource.location || '',
            duration: resource.duration?.value ? `${resource.duration.value} ${resource.duration.unit}` : "0 días",
            price: resource.price?.amount || 0,
            images: resource.images || [],
            included: resource.includedItems || [],
            notIncluded: resource.notIncluded || [],
            important: resource.localCommunityImpact || '',
            agencyId: resource.agencyId || '',
            categories: Array.isArray(resource.type) ? resource.type : [resource.type || ''],
            sustainability: {
                ecoCertifications: resource.ecoCertifications || [],
                sustainablePractices: resource.sustainablePractices || [],
                localCommunityImpact: resource.localCommunityImpact || ''
            },
            difficulty: resource.difficultyLevel?.toLowerCase() || 'medium',
            maxGroupSize: resource.maxParticipants || 10,
            languages: resource.languages || ['Español'],
            reviews: resource.reviews || []
        });
    }

    static toEntitiesFromResponse(response) {
        if (!response?.data) {
            console.error('Invalid response:', response);
            return [];
        }
        return Array.isArray(response.data) 
            ? response.data.map(exp => this.toEntityFromResource(exp))
            : [this.toEntityFromResource(response.data)];
    }    static toRequestPayload(entity) {
        const [durationValue, durationUnit] = entity.duration.value.split(' ');
        return {
            id: entity.id.value,
            title: entity.title.value,
            description: entity.description.value,
            location: entity.location.value,
            duration: {
                value: parseInt(durationValue),
                unit: durationUnit
            },
            price: {
                amount: entity.price.value,
                currency: 'EUR'
            },
            images: [...entity.images],
            includedItems: [...entity.included],
            type: entity.categories[0],
            isSustainable: true,
            ecoCertifications: entity.sustainability.ecoCertifications,
            sustainablePractices: entity.sustainability.sustainablePractices,
            localCommunityImpact: entity.sustainability.localCommunityImpact,
            agencyId: entity.agencyId,
            maxParticipants: entity.maxGroupSize,
            difficultyLevel: entity.difficulty.charAt(0).toUpperCase() + entity.difficulty.slice(1),
            languages: [...entity.languages],
            reviews: entity._reviews.map(review => ({...review}))
        };
    }
}
