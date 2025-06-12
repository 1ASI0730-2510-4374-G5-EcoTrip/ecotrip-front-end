export class Agency {
    constructor({
                    id,
                    name,
                    description,
                    avatarUrl,
                    rating,
                    reviewCount,
                    reservationCount,
                    taxId,
                    contact,
                    socialLinks,
                    reviews
                }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.avatarUrl = avatarUrl;
        this.rating = rating;
        this.reviewCount = reviewCount;
        this.reservationCount = reservationCount;
        this.taxId = taxId;
        this.contact = contact;
        this.socialLinks = socialLinks;
        this.reviews = reviews;
    }
}
