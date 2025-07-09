import { Experience } from '../Domain/experience.entity.js';

export class ExperienceAssembler {    static toEntityFromResource(resource) {
        if (!resource) return null;
        
        console.log('[ExperienceAssembler] Processing resource:', resource);
        
        // Crear un objeto más simple sin usar value objects complejos
        const entity = {
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
        };
        
        console.log('[ExperienceAssembler] Created entity with ID:', entity.id, 'Type:', typeof entity.id);
        return entity;
    }

    static toEntitiesFromResponse(response) {
        console.log('[ExperienceAssembler] Processing response:', response);
        
        if (!response) {
            console.error('[ExperienceAssembler] No response provided');
            return [];
        }
        
        // Manejar tanto response.data como response directamente
        let dataArray;
        if (response.data) {
            dataArray = response.data;
        } else if (Array.isArray(response)) {
            dataArray = response;
        } else {
            console.error('[ExperienceAssembler] Invalid response format:', response);
            return [];
        }
        
        if (!Array.isArray(dataArray)) {
            console.error('[ExperienceAssembler] Data is not an array:', dataArray);
            return [];
        }
        
        console.log('[ExperienceAssembler] Processing', dataArray.length, 'experiences');
        
        const entities = dataArray.map(exp => {
            console.log('[ExperienceAssembler] Processing experience:', exp);
            return this.toEntityFromResource(exp);
        });
        
        console.log('[ExperienceAssembler] Generated entities:', entities);
        return entities;
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
