/**
 * LIbrary for storing and editing data.
 */

// Dependencies.
import * as path from 'path';

import {
    fsExistsAsync,
    handle,
    fsReadFileAsync,
    fsMkdirDirAsync,
    fsOpenAsync,
    fsWriteFileAsync,
    fsCloseAsync,
    fsUnlinkAsync,
    fsFTruncateAsync,
    parseJsonToObject
} from './helpers';

// Container for the module (to be exported).
class DataManager {
    // Base directory of the data folder.
    private static baseDir = path.join(__dirname, '/../../.data/');

    // Write data to a file.
    static async create(dir: string, file: string, data): Promise<[object, string?]> {
        // Target dir to save a new file.
        const targetDir = `${this.baseDir + dir}`;

        // Verifying if target folder exists.
        const targetDirExists = await fsExistsAsync(targetDir);

        // If target folder does not exist, it has to be created.
        if (!targetDirExists) {
            const [, mkdirError] = await handle(fsMkdirDirAsync(targetDir, { recursive: true, }));

            if (mkdirError) return [undefined, `Error creating '${targetDir}' directory`];
        }
    
        // Open file for writing.
        const [openFileDescriptor, openFileError] = (await handle(fsOpenAsync(`${targetDir}/${file}.json`, 'wx'))) as [number, string];

        // File could not be created.
        if (!openFileDescriptor && openFileError) {
            return [undefined, 'Could not create a new file, it may already exists.'];
        }

        // Convert data to string.
        const stringData = JSON.stringify(data);

        // Writing data to a file.
        const [, writeFileError] = await handle(fsWriteFileAsync(openFileDescriptor, stringData));

        // Error writing to a file.
        if (writeFileError) {
            return [undefined, 'Error writing to new file.'];
        }

        // Closing file.
        const [, closeFileError] = await handle(fsCloseAsync(openFileDescriptor));

        // Error closing the file.
        if (closeFileError) {
            return [undefined, 'Error closing new file.'];
        }

        // Operation succeeded.
        return [null, null];
    }

    // Read data from a file.
    static async read(dir: string, file: string): Promise<[(object|string), string?]> {
        const [data, readError] = (await handle(fsReadFileAsync(`${this.baseDir}${dir}/${file}.json`, 'utf8'))) as Array<string>;

        if (!readError && data) {
            const parsedData = parseJsonToObject(data);

            return [parsedData];
        }

        return [data, readError];
    }

    // Update data in a file.
    static async update(dir: string, file: string, data): Promise<[object, string?]> {
        const [openFileDescriptor, openFileError] = (await handle(fsOpenAsync(`${this.baseDir + dir}/${file}.json`, 'r+'))) as [number, string];

        // File could not be created.
        if (!openFileDescriptor && openFileError) {
            return [undefined, 'Could not open the file for updating, it may not exist yet.'];
        }
        
        // Convert data to string.
        const stringData = JSON.stringify(data);

        // Truncating the file.
        const [, truncateFileError] = await handle(fsFTruncateAsync(openFileDescriptor));

        // Error truncating file.
        if (truncateFileError) {
            return [undefined, 'Error truncating file.'];
        }

        // Writing to the file.
        const [, writeFileError] = await handle(fsWriteFileAsync(openFileDescriptor, stringData));

        // Error writing to the file.
        if (writeFileError) {
            return [undefined, 'Error writing to existing file.'];
        }

        // Closing file.
        const [, closeFileError] = await handle(fsCloseAsync(openFileDescriptor));

        // Error closing the file.
        if (closeFileError) {
            return [undefined, 'Error closing file.'];
        }

        // Operation succeeded.
        return [null, null];
    }

    // Delete a file.
    static async delete(dir: string, file: string): Promise<[object, string?]> {
        const [, unlinkError] = await handle(fsUnlinkAsync(`${this.baseDir + dir }/${ file }.json`));

        // Error deleting a file.
        if (unlinkError) {
            return [undefined, 'Error deleting a file.'];
        }
        
        // Operation succeeded.
        return [null, null];
    }
}

export default DataManager;