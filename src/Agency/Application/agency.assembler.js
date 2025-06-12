import { Agency } from "@/Agency/Domain/agency.entity.js";
export class AgencyAssembler {
    static toEntityFromResource(resource) {
        return new Agency({
            id: resource.id,
            name: resource.name,
            description: resource.description,
            avatarUrl: resource.avatarUrl,
            rating: resource.rating,
            reviewCount: resource.reviewCount,
            reservationCount: resource.reservationCount,
            taxId: resource.taxId,
            contact: {
                email: resource.contactEmail,
                phone: resource.contactPhone
            },
            socialLinks: {
                facebook: resource.socialLinksFacebook,
                instagram: resource.socialLinksInstagram,
                whatsapp: resource.socialLinksWhatsapp
            },
            reviews: []
        });
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.code}, ${response.message}`);
            return [];
        }
        return response.data.map((agency) => this.toEntityFromResource(agency));
    }

    static toRequestPayload(entity) {
        return {
            id: entity.id,
            name: entity.name,
            description: entity.description,
            avatarUrl: entity.avatarUrl,
            rating: entity.rating,
            reviewCount: entity.reviewCount,
            reservationCount: entity.reservationCount,
            taxId: entity.taxId,
            contactEmail: entity.contact.email,
            contactPhone: entity.contact.phone,
            socialLinksFacebook: entity.socialLinks.facebook,
            socialLinksInstagram: entity.socialLinks.instagram,
            socialLinksWhatsapp: entity.socialLinks.whatsapp
        };
    }
}
