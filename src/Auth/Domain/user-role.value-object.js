export class UserRole {
    static TOURIST = 'tourist';
    static AGENCY = 'agency';

    static validate(role) {
        return [this.TOURIST, this.AGENCY].includes(role);
    }
}
