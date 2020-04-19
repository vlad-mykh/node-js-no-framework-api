import DataManager from '../../utils/dataManager';
import { BaseRouter } from '../../models/baseRouter';
import { Token } from '../../models/token';
import { User } from '../../models/user';
import { hash } from '../../utils/helpers';

/**
 * Token router class.
 */
class TokensRouter extends BaseRouter {
    constructor() {
        super();

        this.basePath = 'tokens';

        /**
         * Required data: phone, password.
         * Optional data: none.
         */
        this.registerPost('', async (data): Promise<[number, object?]> => {
            const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim();
            const password = typeof(data.payload.password) === 'string' && data.payload.password.trim();
            
            if (phone && password) {
                const [userData, userError] = (await DataManager.read('users', phone)) as [User, string];

                // If user exists and there is no error.
                if (!userError && userData) {
                    // Hash the password.
                    const hashedPassword = hash(password);

                    // Verifying user password.
                    if (hashedPassword === userData.hashedPassword) {
                        const token = new Token(phone);

                        // Store the token.
                        const [, storeTokenError] = await DataManager.create('tokens', token.id, token);

                        // If there is no error, send the token info in response.
                        if (!storeTokenError) {
                            return [200, token];
                        } else {
                            return [500, { Error: 'Could not create the new token.', }];
                        }
                    } else {
                        // Hashing password operation failed.
                        return [400, { Error: 'User phone and/or password is not correct.', }];
                    }
                } else {
                    // User not found.
                    return [400, { Error: 'A user with that phone number does not exist.', }];
                }
            } else {
                // Token validation failed.
                return [400, { Error: 'Missing required fields.', }];
            }
        });

        /**
         * Required data: id.
         * Optional data: none.
         */
        this.registerGet('', async (data): Promise<[number, object?]> => {
            // Checking if the provided id number is valid.
            const id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim();

            if (id) {
                const [token, error] = await DataManager.read('tokens', id) as [Token, string];

                if (!error && token) {
                    return [200, token];

                } else {
                    // Token not found.
                    return [404];
                }
            }

            // Token validation failed.
            return [400, { Error: 'Missing required fields.', }];
        });

        /**
         * Required data: id, extend.
         * Optional data: none.
         */
        this.registerPut('', async (data): Promise<[number, object?]> => {
            const id = typeof(data.payload.id) === 'string' && data.payload.id.trim();
            const extend = Boolean(data.payload.extend);
            
            // Checking if the required data have been provided.
            if (id && extend) {
                const [tokenData, tokenError] = (await DataManager.read('tokens', id)) as [Token, string];

                // If there is an error, token does not exist.
                if (!tokenError && tokenData) {
                    // Verify token expiry.
                    if (tokenData.expires > Date.now()) {
                        tokenData.expires = Date.now() + 1000 * 60 * 60;

                        // Updating the token.
                        const [, updateError] = (await DataManager.update('tokens', id, tokenData)) as [unknown, string];

                        // If could not update the token.
                        if (updateError) {
                            return [500, { Error: 'Could not update the token\'s expiration.',}];
                        }


                        return [200];
                    } else {
                        return [400, { Error: 'The token has already expired and cannot be extended.',}];
                    }

                } else {
                    return [400, { Error: 'The specified token does not exist.',}];
                }
            } else {
                // Token validation failed.
                return [400, { Error: 'Missing required fields.', }];
            }
        });

        /**
         * Required data: id.
         */
        this.registerDelete('', async (data): Promise<[number, object?]> => {
            // Getting id from query string.
            const id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim();

            // Proceed only if an id is provided.
            if (id) {
                // Check if token exist before attempting to delete it.
                const [tokenToDelete, readError] = (await DataManager.read('tokens', id)) as [Token, string];

                // If there is no error and token exists.
                if (!readError && tokenToDelete) {
                    // Perform token deletion.
                    const [, error] = await DataManager.delete('tokens', id) as [unknown, string];

                    // Token deleted successfully.
                    if (!error) {
                        return [200];
                    } else {
                        // Token cannot be deleted.
                        return [500, { Error: 'Could not delete the specified token.',}];
                    }
                } else {
                    // Token not found.
                    return [400, { Error: 'Could not find the specified token.',}];
                }
            }

            // Token validation failed.
            return [400, { Error: 'Missing required fields.', }];
        });
    }
}

export default new TokensRouter();