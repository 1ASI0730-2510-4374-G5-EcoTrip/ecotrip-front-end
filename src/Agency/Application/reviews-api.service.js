import http from '@/Shared/Infrastructure/httpClient.js'

export class ReviewsApiService {
    async getReviewsByAgencyId(agencyId) {
        return await http.get(`/reviews?agencyId=${agencyId}`)
    }
}
