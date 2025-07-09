import http from '@/Shared/Infrastructure/httpClient.js'

export class ReservationsApiService {
    async createReservation(data) {
        try {
            const response = await http.post('/reservations', data)
            return response
        } catch (error) {
            console.error('[ReservationsApiService] Error creating reservation:', error)
            // No relanzar el error para evitar bloquear la navegación
            return { data: [], error: error.message }
        }
    }

    async getReservationsByTouristId(touristId) {
        try {
            const response = await http.get(`/reservations?userId=${touristId}`)
            return response
        } catch (error) {
            console.error('[ReservationsApiService] Error fetching tourist reservations:', error)
            // Devolver estructura vacía en lugar de error
            return { data: [], error: error.message }
        }
    }

    async getReservationsByAgencyId(agencyId) {
        try {
            const response = await http.get(`/reservations?agencyId=${agencyId}`)
            return response
        } catch (error) {
            console.error('[ReservationsApiService] Error fetching agency reservations:', error)
            // Devolver estructura vacía en lugar de error
            return { data: [], error: error.message }
        }
    }

    async updateReservationStatus(reservationId, status) {
        try {
            const response = await http.patch(`/reservations/${reservationId}`, { status })
            return response
        } catch (error) {
            console.error('[ReservationsApiService] Error updating reservation status:', error)
            return { data: null, error: error.message }
        }
    }

    async getReservationDetails(reservationId) {
        try {
            const response = await http.get(`/reservations/${reservationId}`)
            return response
        } catch (error) {
            console.error('[ReservationsApiService] Error fetching reservation details:', error)
            return { data: null, error: error.message }
        }
    }
}
