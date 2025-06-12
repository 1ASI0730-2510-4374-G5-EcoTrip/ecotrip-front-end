import http from '@/Shared/Infrastructure/httpClient.js'

export class AgenciesApiService {
    async getProfile(agencyId) {
        return await http.get(`/agencies/${agencyId}`)
    }

    async createProfile(data) {
        return await http.post('/agencies', data)
    }

    async updateProfile(agencyId, data) {
        return await http.put(`/agencies/${agencyId}`, data)
    }

    async deleteProfile(agencyId) {
        return await http.delete(`/agencies/${agencyId}`)
    }

    async getAllAgencies() {
        return await http.get('/agencies')
    }
}

