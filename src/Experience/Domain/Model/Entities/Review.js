export class Review {
    constructor(userId, rating, comment) {
        if (rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }
        if (!comment || typeof comment !== 'string') {
            throw new Error('Comment must be a non-empty string');
        }
        this._userId = userId;
        this._rating = rating;
        this._comment = comment;
        this._date = new Date();
    }

    get userId() { return this._userId; }
    get rating() { return this._rating; }
    get comment() { return this._comment; }
    get date() { return new Date(this._date); }

    toJSON() {
        return {
            userId: this._userId,
            rating: this._rating,
            comment: this._comment,
            date: this._date.toISOString()
        };
    }
}
