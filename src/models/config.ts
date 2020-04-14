import { Environment } from './environment';

/**
 * Config class for Production / Staging environmetn.
 */
class Config {
    constructor(environment: string) {

        // If the provided parameter matches Production - it is production mode.
        // Otherwise - launch the application in development mode.
        if (environment === Environment.Production) {
            this.httpPort = 5000;
            this.httpsPort = 5001;
            this.envName = Environment.Production;
            this.hashingSecret = 'thisIsAProductionSecret';
        } else {
            this.httpPort = 3000;
            this.httpsPort = 3001;
            this.envName = Environment.Staging;
            this.hashingSecret = 'thisIsAStagingSecret';
        }
    }

    httpPort: number;
    httpsPort: number;
    envName: string;
    hashingSecret: string;
}

export { Config };