import DataManager from '../../utils/dataManager';
import { BaseRouter } from '../../models/baseRouter';
import { User } from '../../models/user';
import { hash } from '../../utils/helpers';

/**
 * User router class.
 */
class UserRouter extends BaseRouter {
    constructor() {
        super();

        this.basePath = 'users';

        /**
         * Required data: phone.
         * Optional data: none.
         */
        this.registerGet('', async (data): Promise<[number, object?]> => {
            // Checking if the provided phone number is valid.
            const phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim();

            if (phone) {
                const [user, error] = await DataManager.read('users', phone) as [User, string];

                if (!error && user) {
                    delete user.hashedPassword;

                    return [200, user];

                } else {
                    // User not found.
                    return [404];
                }
            }

            // User validation failed.
            return [400, { Error: 'Missing required fields.', }];
        });

        /**
         * Required data: firstName, lastName, phone, password, tosAgreement.
         * Optional data: none.
         */
        this.registerPost('', async (data): Promise<[number, object?]> => {
            const firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim();
            const lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim();
            const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim();
            const password = typeof(data.payload.password) === 'string' && data.payload.password.trim();
            const tosAgreement = Boolean(data.payload.tosAgreement);
            
            if (firstName && lastName && phone && password && tosAgreement) {
                const [userData, userError] = (await DataManager.read('users', phone)) as [User, string];

                // If the response comes with an error - it means that the user
                // does not exist and we are free to proceed with adding a new user.
                if (userError && !userData) {
                    // Hash the password.
                    const hashedPassword = hash(password);

                    // If password was hashed successfully.
                    if (hashedPassword) {
                        // Creating new user.
                        const user = new User(firstName, lastName, phone, tosAgreement, hashedPassword);

                        // Saving user to a file.
                        const [, createFileError] = await DataManager.create('users', phone, user);

                        // If there is no error, return status 200;
                        // otherwise - response status 500 and propagate the error to the paren level.1
                        if (!createFileError) {
                            return [200];
                        } else {
                            return [500, { Error: createFileError, }];
                        }
                    } else {
                        // Hashing password operation failed.
                        return [500, { Error: 'Could not hash the user\'s password.', }];
                    }
                } else {
                    // User already exists.
                    return [400, { Error: 'A user with that phone number already exists.', }];
                }
            } else {
                // User validation failed.
                return [400, { Error: 'Missing required fields.', }];
            }
        });

        /**
         * Required data: phone.
         * Optional data: firstName, lastName, password.
         */
        this.registerPut('', async (data): Promise<[number, object?]> => {
            // Checking if the provided phone number is valid.
            const firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim();
            const lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim();
            const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim();
            const password = typeof(data.payload.password) === 'string' && data.payload.password.trim();

            if (phone) {
                if (firstName || lastName || password) {
                    const [userToUpdate, error] = (await DataManager.read('users', phone)) as [User, string];
                    
                    // If user exists and there is no error.
                    if (!error && userToUpdate) {
                        // If firstName has to be updated.
                        if (firstName) {
                            userToUpdate.firstName = firstName;
                        }

                        // If lastName has to be updated.
                        if (lastName) {
                            userToUpdate.lastName = lastName;
                        }

                        // If password has to be updated.
                        if (password) {
                            userToUpdate.hashedPassword = hash(password);
                        }

                        const [, updateError] = (await DataManager.update('users', phone, userToUpdate)) as [unknown, string];

                        // If failed to update the user.
                        if (updateError) {
                            return [500, { Error: 'Could not update the user.', }];
                        }
    
                        // Updated successfully.
                        return [200];
    
                    } else {
                        // User not found.
                        return [400, { Error: 'The spceified user does not exist.',}];
                    }
                }
            }

            // User validation failed.
            return [400, { Error: 'Missing required fields.', }];
        });

        /**
         * Required data: phone.
         */
        this.registerDelete('', async (data): Promise<[number, object?]> => {
            // Getting phone number from query string.
            const phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim();

            // Proceed only if the phone number is provided.
            if (phone) {
                // Check
                const [userToDelete, readError] = (await DataManager.read('users', phone)) as [User, string];

                // If there is no error and user exists.
                if (!readError && userToDelete) {
                    // Perform user deletion.
                    const [, error] = await DataManager.delete('users', phone) as [unknown, string];

                    // User deleted successfully.
                    if (!error) {
                        return [200];
                    } else {
                        // User cannot be deleted.
                        return [500, { Error: 'Could not delete the specified user.',}];
                    }
                } else {
                    // User not found.
                    return [400, { Error: 'Could not find the specified user.',}];
                }
            }

            // User validation failed.
            return [400, { Error: 'Missing required fields.', }];
        });
    }
}

export default new UserRouter();