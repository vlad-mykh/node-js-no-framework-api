/**
 * Primary file for the API
 */

// Dependencies.
import {
    createServer as createHttpServer,
    IncomingMessage,
    ServerResponse
} from 'http';
import { createServer as createHttpsServer } from 'https';
import { StringDecoder } from 'string_decoder';
import { Map as ImmutableJsMap } from 'immutable';
import * as url from 'url';
import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';

import {
    flowAsync,
    parseJsonToObject
} from './utils/helpers';

import Config from './config/configManager';

/**
 * Main server class for the application.
 */
new class Server {
    /**
     * Class constructor.
     */
    constructor() {
        flowAsync(
            this.setupRouter,
            this.setupHandler,
            this.startServer
        )();
    }

    /**
     * Gathers routers for the applicaton.
     */
    private async setupRouter(): Promise<ImmutableJsMap<string, ImmutableJsMap<string, Function>>> {
        // Options for glob.
        const searchOptions = { nodir: true, };

        // Performing search of the Route files in the s
        const discoveredFiles = glob.sync('**/routes/**/*Router.js', searchOptions);

        return (await Promise.all(discoveredFiles.map(discoveredFile => 
            // Importing the discovered files.
            (import(path.join(process.cwd(), discoveredFile))))))
            // Getting the default imports that contain instances of BaseRouter class.
            .map(importedModule => importedModule['default'])
            // Forming handlers map to process server responses.
            // The resulting map will be the following:
            // Map: {
            //    "user": Map: {
            //        "get": Function,
            //        "post": Function,
            //        "put": Function,
            //        "delete": Function,
            //    },
            //    "products": Map: {
            //        "get": Function,
            //        "post": Function,
            //        "put": Function,
            //        "delete": Function,
            //    },
            // }
            .reduce((accumulator, currentValue) => {
                return accumulator.mergeWith((oldValue, newValue, key) => {
                    // The app does not support multiple handlers for a single http request.
                    // Therefore, if a duplicated handler is found, app execution
                    // has to be terminated until the Routes with duplicated 'basePath' property is resolved.
                    throw new Error(`Conflicting values found for the following key: '${key}'.`);
                }, currentValue.getRouteHandlers());
            }, ImmutableJsMap());
    }

    /**
     * Returns a function to handler server responses with the configured handlers.
     */
    private setupHandler(handlers: ImmutableJsMap<string, ImmutableJsMap<string, Function>>): Function {
        return (req: IncomingMessage, res: ServerResponse): void => {
            // Get the URL and parse it.
            const parsedUrl = url.parse(req.url, true);
    
            // Get the path from the URL.
            const path = parsedUrl.pathname;
            const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    
            // Get the query string as an object.
            const queryStringObject = parsedUrl.query;
    
            // Get the HTTP method.
            const method = req.method.toLowerCase();
    
            // Get the headers as an object.
            const headers = req.headers;
    
            // Get the payload if any.
            const decoder = new StringDecoder('utf-8');
            let buffer = '';
    
            req.on('data', (data) => {
                buffer += decoder.write(data);
            });
    
            req.on('end', async () => {
                buffer += decoder.end();
    
                // Choose the handler this request should go to. If one is not found, it should handle 404.
                // const chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : router['ping'];
                let chosenHandler = handlers.getIn([trimmedPath, method]);

                // Variable to hold data for the response.
                let data = {};

                // If there is no handler that matches the requested path and method,
                // send 404 response as the route is not found.
                if (!chosenHandler) {
                    chosenHandler = (): Promise<Array<number>> => {
                        return Promise.resolve([404]);
                    };
                } else {
                    // Preparing data for the response.
                    data = {
                        trimmedPath,
                        queryStringObject,
                        method,
                        headers,
                        payload: parseJsonToObject(buffer),
                    };
                }
    
                // Route the request to the handler specified in the router.
                const [statusCode, payload] = await chosenHandler(data);
                
                // Use the status code provided by the handler or default to 200.
                const statusCodeToSend = typeof (statusCode) === 'number' ? statusCode : 200;

                // Use the payload called back by the handler or use an empty object.
                const payloadToSend = typeof (payload) === 'object' ? payload : {};

                // Convert the payload to a string.
                const payloadString = JSON.stringify(payloadToSend);
    
                // Return the response.
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(statusCodeToSend);
                res.end(payloadString);
            });
        };
    }

    /**
     * Configure server.
     */
    private startServer(requestHandler: Function): void {
        // Instantiating the HTTP server.
        const httpServer = createHttpServer((req, res) => {
            requestHandler(req, res);
        });

        // Start the HTTP server.
        httpServer.listen(Config.httpPort, () => {
            console.info(`The server is listening on port ${Config.httpPort}.`);
        });

        const httpsServerOptions = {
            key: fs.readFileSync(path.join(__dirname, '../https/key.pem')),
            cert: fs.readFileSync(path.join(__dirname, '../https/cert.pem')),
        };

        
        // Instantiating the HTTPS server.
        const httpsServer = createHttpsServer(httpsServerOptions, (req: IncomingMessage, res: ServerResponse) => {
            requestHandler(req, res);
        });
        
        // Start the HTTPS server.
        httpsServer.listen(Config.httpsPort, () => {
            console.info(`The server is listening on port ${Config.httpsPort}.`);
        });
    }
}();
