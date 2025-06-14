import { Tourist } from '../Domain/tourist.entity.js';

export class TouristService {
    constructor(touristApiService) {
        this.touristApiService = touristApiService;
    }    async getProfile(userId) {
        console.log('[TouristService] Getting profile for user:', userId);
        const response = await this.touristApiService.getProfile(userId);
        console.log('[TouristService] Profile response:', response);
        return response.data;
    }

    async updateProfile(touristData) {
        const response = await this.touristApiService.updateProfile(touristData.id, touristData);
        return response.data;
    }
    
    async getBookedExperiences(userId) {
        const response = await this.touristApiService.getBookedExperiences(userId);
        return response.data;
    }
}
