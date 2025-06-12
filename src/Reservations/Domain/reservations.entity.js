export class Reservation {
    constructor({
        id = "",
        experienceId = "",
        userId = "",
        date = new Date(),
        numberOfPeople = 1,
        status = "pending",
        totalPrice = 0.0,
        experience = {
            name: "",
            image: ""
        },
        tourist = {
            name: "",
            avatar: ""
        },
        agency = {
            id: "",
            name: "",
            avatar: ""
        }
    }) {
        this.id = id;
        this.experienceId = experienceId;
        this.userId = userId;
        this.date = new Date(date);
        this.numberOfPeople = numberOfPeople;
        this.status = status;
        this.totalPrice = totalPrice;
        this.experience = experience;
        this.tourist = tourist;
        this.agency = agency;
    }

    get formattedDate() {
        return this.date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    get statusColor() {
        switch (this.status) {
            case 'confirmed': return 'var(--green-500)';
            case 'cancelled': return 'var(--red-500)';
            default: return 'var(--yellow-500)';
        }
    }

    get statusText() {
        switch (this.status) {
            case 'confirmed': return 'Confirmada';
            case 'cancelled': return 'Cancelada';
            default: return 'Pendiente';
        }
    }
}
