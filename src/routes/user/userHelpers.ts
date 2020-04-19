import { Token } from '../../models/token';
import DataManager from '../../utils/dataManager';

// Verifies if a provided token is valid for a user.
export const verifyUserToken = async (id: string, phone: string): Promise<boolean> => {
    const [tokenData, tokenError] = await DataManager.read('tokens', id) as [Token, string];

    // Token exists, matches the provided user and is not expired.
    if (!tokenError
        && tokenData
        && tokenData.phone === phone
        && tokenData.expires > Date.now()
    ) {
        return true;
    }

    // Token does not exist or does not match the provided user.
    return false;
};