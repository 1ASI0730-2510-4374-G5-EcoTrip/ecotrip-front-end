import { Experience } from '../Domain/experience.entity.js';
import { ExperienceRepository } from '../Infrastructure/experience.repository.js';
import { ExperienceAssembler } from './experience.assembler.js';
import { 
    ExperienceNotFoundError,
    InvalidExperienceDataError,
    ExperienceValidationError
} from '../Domain/experience.exceptions.js';

export class ExperienceService {
    constructor(experienceRepository = new ExperienceRepository()) {
        this.experienceRepository = experienceRepository;
    }

    async getAllExperiences() {
        try {
            console.log('[ExperienceService] Getting all experiences...');
            const experiences = await this.experienceRepository.findAll();
            console.log('[ExperienceService] Raw experiences from repo:', experiences);
            const assembledExperiences = experiences.map(exp => ExperienceAssembler.toEntityFromResource(exp));
            console.log('[ExperienceService] Assembled experiences:', assembledExperiences);
            return assembledExperiences;
        } catch (error) {
            console.error('Error getting experiences:', error);
            throw new Error('Failed to fetch experiences');
        }
    }

    async getExperienceById(id) {
        try {
            console.log('[ExperienceService] Getting experience by ID:', id, 'Type:', typeof id);
            // Asegurar que el ID es un string
            const stringId = String(id);
            console.log('[ExperienceService] String ID:', stringId);
            
            const experience = await this.experienceRepository.findById(stringId);
            if (!experience) {
                throw new ExperienceNotFoundError(stringId);
            }
            return ExperienceAssembler.toEntityFromResource(experience);
        } catch (error) {
            console.error(`Error getting experience with id ${id}:`, error);
            if (error instanceof ExperienceNotFoundError) {
                throw error;
            }
            throw new InvalidExperienceDataError(`Failed to fetch experience with id ${id}`);
        }
    }    async createExperience(experienceData) {
        try {
            const experience = new Experience(experienceData);
            try {
                experience.validate();
            } catch (validationError) {
                throw new ExperienceValidationError(validationError.message);
            }

            const savedExperience = await this.experienceRepository.save(
                ExperienceAssembler.toRequestPayload(experience)
            );
            return ExperienceAssembler.toEntityFromResource(savedExperience);
        } catch (error) {
            console.error('Error creating experience:', error);
            if (error instanceof ExperienceValidationError) {
                throw error;
            }
            throw new InvalidExperienceDataError('Failed to create experience: ' + error.message);
        }
    }    async updateExperience(id, experienceData) {
        try {
            const existingExperience = await this.experienceRepository.findById(id);
            if (!existingExperience) {
                throw new ExperienceNotFoundError(id);
            }
            
            const updatedExperience = new Experience({
                ...ExperienceAssembler.toEntityFromResource(existingExperience).toJSON(),
                ...experienceData
            });

            try {
                updatedExperience.validate();
            } catch (validationError) {
                throw new ExperienceValidationError(validationError.message);
            }
            
            const saved = await this.experienceRepository.update(
                id, 
                ExperienceAssembler.toRequestPayload(updatedExperience)
            );
            return ExperienceAssembler.toEntityFromResource(saved);
        } catch (error) {
            console.error(`Error updating experience with id ${id}:`, error);
            if (error instanceof ExperienceNotFoundError || 
                error instanceof ExperienceValidationError) {
                throw error;
            }
            throw new InvalidExperienceDataError(`Failed to update experience: ${error.message}`);
        }
    }

    async deleteExperience(id) {
        try {
            const experience = await this.experienceRepository.findById(id);
            if (!experience) {
                throw new Error('Experience not found');
            }
            await this.experienceRepository.delete(id);
            return true;
        } catch (error) {
            console.error(`Error deleting experience with id ${id}:`, error);
            if (error.message === 'Experience not found') {
                throw error;
            }
            throw new Error('Failed to delete experience');
        }
    }

    async getExperiencesByAgency(agencyId) {
        try {
            const experiences = await this.experienceRepository.findByAgencyId(agencyId);
            return experiences.map(exp => ExperienceAssembler.toEntityFromResource(exp));
        } catch (error) {
            console.error(`Error getting experiences for agency ${agencyId}:`, error);
            throw new Error('Failed to fetch agency experiences');
        }
    }

    async addReview(experienceId, userId, rating, comment) {
        try {
            const experience = await this.getExperienceById(experienceId);
            if (!experience) {
                throw new Error('Experience not found');
            }

            experience.addReview(userId, rating, comment);
            const saved = await this.experienceRepository.save(
                ExperienceAssembler.toRequestPayload(experience)
            );
            return ExperienceAssembler.toEntityFromResource(saved);
        } catch (error) {
            console.error(`Error adding review to experience ${experienceId}:`, error);
            if (error.message === 'Experience not found') {
                throw error;
            }
            throw new Error('Failed to add review');
        }
    }
}
