import { ExperiencesApiService } from '../Application/experiences-api.service.js';
import { ExperienceAssembler } from '../Application/experience.assembler.js';

export class ExperienceRepository {
    constructor() {
        this.apiService = new ExperiencesApiService();
    }

    async findAll() {
        try {
            console.log('[ExperienceRepository] Finding all experiences...');
            const response = await this.apiService.getExperiences();
            console.log('[ExperienceRepository] API response:', response);
            const assembled = ExperienceAssembler.toEntitiesFromResponse(response);
            console.log('[ExperienceRepository] Assembled entities:', assembled);
            return assembled;
        } catch (error) {
            console.error('[ExperienceRepository] Error getting experiences:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            // Convertir el ID a string para evitar problemas con objetos
            const stringId = String(id);
            console.log('[ExperienceRepository] Finding experience by ID:', stringId);
            
            const response = await this.apiService.getById(stringId);
            return ExperienceAssembler.toEntityFromResource(response.data);
        } catch (error) {
            console.error(`[ExperienceRepository] Error getting experience with id ${id}:`, error);
            throw error;
        }
    }

    async save(experience) {
        try {
            const response = await this.apiService.createExperience(experience);
            return ExperienceAssembler.toEntityFromResource(response.data);
        } catch (error) {
            console.error('[ExperienceRepository] Error saving experience:', error);
            throw error;
        }
    }

    async update(id, experience) {
        try {
            const response = await this.apiService.updateExperience(id, experience);
            return ExperienceAssembler.toEntityFromResource(response.data);
        } catch (error) {
            console.error(`[ExperienceRepository] Error updating experience with id ${id}:`, error);
            throw error;
        }
    }

    async delete(id) {
        try {
            await this.apiService.deleteExperience(id);
            return true;
        } catch (error) {
            console.error(`[ExperienceRepository] Error deleting experience with id ${id}:`, error);
            throw error;
        }
    }

    async findByAgencyId(agencyId) {
        try {
            const experiences = await this.findAll();
            return experiences.filter(exp => exp.agencyId === agencyId);
        } catch (error) {
            console.error(`[ExperienceRepository] Error getting experiences for agency ${agencyId}:`, error);
            throw error;
        }
    }
}
