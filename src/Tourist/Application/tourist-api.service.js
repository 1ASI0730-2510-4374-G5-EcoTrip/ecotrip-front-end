import http from '@/Shared/Infrastructure/httpClient.js';
import { TouristAssembler } from './tourist.assembler.js';

const BASE_URL = 'http://localhost:3003';

export class TouristApiService {
    async getProfile(touristId) {
        try {
            console.log('[TouristApiService] Getting profile for user:', touristId);
            if (!touristId) throw new Error('Tourist ID is required');
            
            const response = await http.get(`${BASE_URL}/users/${touristId}`);
            console.log('[TouristApiService] Raw API response:', response.data);
            
            const mappedData = TouristAssembler.toEntityFromResource(response.data);
            console.log('[TouristApiService] Mapped tourist data:', mappedData);
            
            return {
                data: mappedData
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
        console.error('TouristApiService Error:', error);
        
        if (!error.response) {
            localStorage.clear(); // Limpiar sesión en caso de error de red
            return new Error('Error de conexión. Por favor, intenta nuevamente.');
        }

        switch (error.response.status) {
            case 400:
                return new Error('Datos de solicitud inválidos');
            case 401:
                localStorage.clear(); // Limpiar sesión cuando no está autorizado
                return new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
            case 403:
                return new Error('No tienes permisos para realizar esta acción');
            case 404:
                return new Error('No se encontró el perfil del turista');
            case 500:
                return new Error('Error en el servidor. Por favor, intenta más tarde.');
            default:
                return error;
        }
    }
}
