import http from '@/Shared/Infrastructure/httpClient.js';
import { TouristAssembler } from './tourist.assembler.js';

const BASE_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:3003';

export class TouristApiService {
    async getProfile(touristId) {
        try {
            if (!touristId) throw new Error('Tourist ID is required');
            const response = await http.get(`${BASE_URL}/users/${touristId}`);
            return {
                data: TouristAssembler.toEntityFromResource(response.data)
            };
        } catch (error) {
            console.error('[TouristApiService] Error fetching profile:', error);
            throw this.handleError(error);
        }
    }

    async updateProfile(touristId, data) {
        try {
            if (!touristId) throw new Error('ID de turista es requerido');
            const payload = TouristAssembler.toRequestPayload(data);
            console.log('[TouristApiService] Updating profile with payload:', payload);
            const response = await http.put(`${BASE_URL}/users/${touristId}`, payload);
            return {
                data: TouristAssembler.toEntityFromResource(response.data)
            };
        } catch (error) {
            console.error('[TouristApiService] Error updating profile:', error);
            throw this.handleError(error);
        }
    }
    
    async getBookedExperiences(touristId) {
        try {
            if (!touristId) throw new Error('Tourist ID is required');
            const response = await http.get(`${BASE_URL}/reservations?userId=${touristId}`);
            return {
                data: response.data.map(booking => ({
                    id: booking.id,
                    experienceName: booking.experienceName,
                    date: new Date(booking.date),
                    status: booking.status
                }))
            };
        } catch (error) {
            console.error('[TouristApiService] Error fetching bookings:', error);
            throw this.handleError(error);
        }
    }

    handleError(error) {
        if (!error.response) {
            return new Error('Network error');
        }

        switch (error.response.status) {
            case 400:
                return new Error('Invalid request data');
            case 401:
                return new Error('Unauthorized');
            case 403:
                return new Error('Forbidden');
            case 404:
                return new Error('Resource not found');
            case 500:
                return new Error('Server error');
            default:
                return error;
        }
    }
}
