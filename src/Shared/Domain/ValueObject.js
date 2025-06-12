export class ValueObject {
    equals(other) {
        if (other === null || other === undefined) {
            return false;
        }
        if (other.constructor !== this.constructor) {
            return false;
        }
        return JSON.stringify(this) === JSON.stringify(other);
    }
}
