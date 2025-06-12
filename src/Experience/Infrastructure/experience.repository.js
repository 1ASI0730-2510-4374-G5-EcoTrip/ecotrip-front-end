import { ExperiencesApiService } from '../Application/experiences-api.service.js';
import { ExperienceAssembler } from '../Application/experience.assembler.js';

export class ExperienceRepository {
    constructor() {
        this.apiService = new ExperiencesApiService();
    }

    async findAll() {
        try {
            const response = await this.apiService.getExperiences();
            return ExperienceAssembler.toEntitiesFromResponse(response);
        } catch (error) {
            console.error('[ExperienceRepository] Error getting experiences:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            const response = await this.apiService.getById(id);
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
