import { createRandomString } from '../utils/helpers';

/**
 * Token class
 */
export class Token {
    phone: string;
    id: string;
    expires: number

    constructor(phone: string) {
        this.phone = phone;
        this.expires = Date.now() + 1000 * 60 * 60;
        this.id = createRandomString(20);
    }
}
