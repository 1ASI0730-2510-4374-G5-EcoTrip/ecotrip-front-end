import http from '@/Shared/Infrastructure/httpClient.js';
import { ExperienceAssembler } from './experience.assembler.js';

export class ExperiencesApiService {
    constructor() {
        this.baseURL = 'http://localhost:3000';
    }
    async getExperiences() {
        try {
            const response = await http.get('/experiences');
            return response;
        } catch (error) {
            console.error('[ExperiencesApiService] Error fetching experiences:', error);
            throw this.handleError(error);
        }
    }

    async getById(id) {
        try {
            if (!id) throw new Error('Experience ID is required');
            const response = await http.get(`/experiences/${id}`);
            return response;
        } catch (error) {
            console.error('[ExperiencesApiService] Error fetching experience:', error);
            throw this.handleError(error);
        }
    }

    async createExperience(experience) {
        try {
            const payload = ExperienceAssembler.toRequestPayload(experience);
            const response = await http.post('/experiences', payload);
            return response;
        } catch (error) {
            console.error('[ExperiencesApiService] Error creating experience:', error);
            throw this.handleError(error);
        }
    }

    async updateExperience(id, experience) {
        try {
            if (!id) throw new Error('Experience ID is required');
            const payload = ExperienceAssembler.toRequestPayload(experience);
            const response = await http.put(`/experiences/${id}`, payload);
            return response;
        } catch (error) {
            console.error('[ExperiencesApiService] Error updating experience:', error);
            throw this.handleError(error);
        }
    }

    async deleteExperience(id) {
        try {
            if (!id) throw new Error('Experience ID is required');
            await http.delete(`/experiences/${id}`);
            return { success: true };
        } catch (error) {
            console.error('[ExperiencesApiService] Error deleting experience:', error);
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
                return new Error('Experience not found');
            case 500:
                return new Error('Server error');
            default:
                return error;
        }
    }
}
