import { Tourist } from '../Domain/tourist.entity.js';

export class TouristService {
    constructor(touristApiService) {
        this.touristApiService = touristApiService;
    }    async getProfile(userId) {
        try {
            if (!userId) {
                console.error('[TouristService] No userId provided');
                throw new Error('Se requiere ID de usuario');
            }

            console.log('[TouristService] Getting profile for user:', userId);
            const response = await this.touristApiService.getProfile(userId);
            console.log('[TouristService] Profile response:', response);
            
            if (!response || !response.data) {
                console.error('[TouristService] No data received from API');
                throw new Error('No se pudo cargar el perfil');
            }
            
            if (!response.data.id) {
                console.error('[TouristService] Invalid profile data:', response.data);
                throw new Error('Datos de perfil inválidos');
            }
            
            return response.data;
        } catch (error) {
            console.error('[TouristService] Error in getProfile:', error);
            throw error;
        }
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
