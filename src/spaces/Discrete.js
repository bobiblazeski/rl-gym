import { randInt, between } from '../util';

export default class Discrete {
    constructor(n) {
        this.n = n;
    }

    sample() {
        return randInt(this.n);
    }

    contains(x) {
        return Number.isInteger(x) && between(x, 0, this.n);
    }


}