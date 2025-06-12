export class Tourist {
    constructor({
        id,
        name,
        email,
        avatar,
        preferences = {
            adventureTypes: [],
            sustainability: true
        },
        contactInfo = {
            phone: '',
            address: ''
        }
    }) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.avatar = avatar;
        this.preferences = preferences;
        this.contactInfo = contactInfo;
    }

    get fullName() {
        return this.name;
    }

    hasPreference(adventureType) {
        return this.preferences.adventureTypes.includes(adventureType);
    }

    prefersSustainability() {
        return this.preferences.sustainability;
    }

    updatePreferences(preferences) {
        this.preferences = {
            ...this.preferences,
            ...preferences
        };
    }

    updateContactInfo(contactInfo) {
        this.contactInfo = {
            ...this.contactInfo,
            ...contactInfo
        };
    }
}