import { Tourist } from "@/Tourist/Domain/tourist.entity.js";

export class TouristAssembler {
    static toEntityFromResource(resource) {
        return new Tourist({
            id: resource.id,
            name: resource.name,
            email: resource.email,
            avatar: resource.avatar,
            preferences: resource.preferences || {
                adventureTypes: [],
                sustainability: true
            },
            contactInfo: resource.contactInfo || {
                phone: "",
                address: ""
            }
        });
    }

    static toRequestPayload(entity) {
        // Asegurarse de que todas las propiedades necesarias estén presentes
        return {
            id: entity.id,
            name: entity.name,
            email: entity.email,
            avatar: entity.avatar,
            role: 'tourist',
            preferences: {
                adventureTypes: entity.preferences?.adventureTypes || [],
                sustainability: entity.preferences?.sustainability === false ? false : true
            },
            contactInfo: {
                phone: entity.contactInfo?.phone || '',
                address: entity.contactInfo?.address || ''
            },
            password: entity.password // Mantener la contraseña si existe
        };
    }
}
