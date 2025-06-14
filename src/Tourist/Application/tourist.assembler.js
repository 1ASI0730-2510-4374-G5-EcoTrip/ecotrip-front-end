import { Tourist } from "@/Tourist/Domain/tourist.entity.js";

export class TouristAssembler {    static toEntityFromResource(resource) {
        if (!resource) {
            console.error('TouristAssembler: Received null resource');
            return null;
        }
        
        console.log('TouristAssembler: Processing resource:', resource);
        
        try {
            return new Tourist({
                id: resource.id,
                name: resource.name,
                email: resource.email,
                avatar: resource.avatar || 'https://i.pravatar.cc/150?u=tourist1',
                preferences: {
                    adventureTypes: Array.isArray(resource.preferences?.adventureTypes) 
                        ? resource.preferences.adventureTypes 
                        : [],
                    sustainability: Boolean(resource.preferences?.sustainability)
                },
                contactInfo: {
                    phone: resource.contactInfo?.phone || '',
                    address: resource.contactInfo?.address || ''
                }
            });
        } catch (error) {
            console.error('TouristAssembler: Error creating tourist entity:', error);
            return null;
        }
    }

    static toRequestPayload(entity) {
        return {
            id: entity.id,
            name: entity.name,
            email: entity.email,
            avatar: entity.avatar,
            preferences: {
                adventureTypes: entity.preferences.adventureTypes,
                sustainability: entity.preferences.sustainability
            },
            contactInfo: {
                phone: entity.contactInfo.phone,
                address: entity.contactInfo.address
            }
        };
    }
}
