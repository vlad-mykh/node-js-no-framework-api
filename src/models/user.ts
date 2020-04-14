/**
 * User class
 */
export class User {
    firstName: string;
    lastName: string;
    phone: string;
    hashedPassword: string;
    tosAgreement: boolean;
    

    constructor(firstName: string,
        lastName: string,
        phone: string,
        tosAgreement: boolean,
        hashedPassword?: string
    ) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.hashedPassword = hashedPassword;
        this.tosAgreement = tosAgreement;
    }
}
