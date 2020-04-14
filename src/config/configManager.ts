import { Config } from '../models/config';

/**
 * Create and export configuration variables.
 */
class ConfigManager {
    static getConfig(): Config {
        // Determine which environment was passed as a command-line argument.
        const currentEnvironment = typeof (process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.trim().toLowerCase() : '';
                
        // Check that the current environment is one of the environments above, if not, default to staging.
        return new Config(currentEnvironment);
    }
}

// Export the module.
export default ConfigManager.getConfig();