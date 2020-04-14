import * as fs from 'fs';
import { flow } from 'lodash';
import { promisify } from 'util';
import { createHmac } from 'crypto';
import Config from '../config/configManager';

/**
 * Wrapping provided funciton in promise to make sure that it works in async scope.
 * Returns a function that will be subsequently executed by Lodash flow.
 */
const _wrapFlowAsync = (fn) => (args): Promise<typeof args> => {
    return Promise.resolve(args).then((value) => {
        return fn(value);
    });
};

/**
 * Enhances lodash flow util to work with async functions.
 */
export const flowAsync = (...fns): Function => {
    const wrappedFns = fns.map(fn => _wrapFlowAsync(fn));

    return flow(wrappedFns);
};

/**
 * @description ### Returns Go / Lua like responses(data, err) 
 * when used with await
 *
 * - Example response [ data, undefined ]
 * - Example response [ undefined, Error ]
 *
 *
 * When used with Promise.all([req1, req2, req3])
 * - Example response [ [data1, data2, data3], undefined ]
 * - Example response [ undefined, Error ]
 *
 *
 * When used with Promise.race([req1, req2, req3])
 * - Example response [ data, undefined ]
 * - Example response [ undefined, Error ]
 *
 * @param {Promise} promise
 * @returns {Promise} [ data, undefined ]
 * @returns {Promise} [ undefined, Error ]
 */
export const handle = (promise): Array<unknown> => {
    return promise
        .then(data => ([data, undefined]))
        .catch(error => Promise.resolve([undefined, error]));
};

// Promisify the fs.readFile function to use async/await syntax.
export const fsReadFileAsync = promisify(fs.readFile);

// Promisify the fs.mkdir function to use async/await syntax.
export const fsMkdirDirAsync = promisify(fs.mkdir);

// Promisify the fs.exists function to use async/await syntax.
export const fsExistsAsync = promisify(fs.exists);

// Promisify the fs.open function to use async/await syntax.
export const fsOpenAsync = promisify(fs.open);

// Promisify the fs.writeFile function to use async/await syntax.
export const fsWriteFileAsync = promisify(fs.writeFile);

// Promisify the fs.close function to use async/await syntax.
export const fsCloseAsync = promisify(fs.close);

// Promisify the fs.unlink function to use async/await syntax.
export const fsUnlinkAsync = promisify(fs.unlink);

// Promisify the fs.ftruncate function to use async/await syntax.
export const fsFTruncateAsync = promisify(fs.ftruncate);

// Creates hashed string from the provided string.
export const hash = (str: string): string => {
    if (typeof(str) === 'string' && str.length > 0) {
        const hash = createHmac('sha256', Config.hashingSecret)
            .update(str)
            .digest('hex');

        return hash;
    }

    return '';
};

// Parces string to a JSON object.
export const parseJsonToObject = (str: string): object => {
    try {
        return JSON.parse(str);
    } catch {
        return {};
    }
};