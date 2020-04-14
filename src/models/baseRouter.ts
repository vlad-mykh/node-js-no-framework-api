import { Map as ImmutableJsMap } from 'immutable';
import { RequestTypes } from './requestTypes';

/**
 * Base router class for Route components.
 */
export abstract class BaseRouter {
    // Path of a resource.
    basePath: string;

    private routeHandlers: ImmutableJsMap<string, ImmutableJsMap<string, Function>>;

    constructor() {
        this.routeHandlers = ImmutableJsMap();
    }

    private registerRouteWithMethod(method: string, path: string, handler: Function): void {
        const routePath = path !== '' ? `${this.basePath}/${ path}` : this.basePath;

        if (this.routeHandlers.has(routePath)) {
            this.routeHandlers = this.routeHandlers.setIn([routePath, method], handler);
        } else {
            this.routeHandlers = this.routeHandlers.set(routePath, ImmutableJsMap({ [method]: handler, }));
        }
    }
    
    /**
     * Registering Get endpoint for a route.
     */
    protected registerGet(path: string, handler: Function): void {
        this.registerRouteWithMethod(RequestTypes.Get, path, handler);
    }

    /**
     * Registering Post endpoint for a route.
     */
    protected registerPost(path: string, handler: Function): void {
        this.registerRouteWithMethod(RequestTypes.Post, path, handler);
    }

    /**
     * Registering Put endpoint for a route.
     */
    protected registerPut(path: string, handler: Function): void {
        this.registerRouteWithMethod(RequestTypes.Put, path, handler);
    }

    /**
     * Registering Delete endpoint for a route.
     */
    protected registerDelete(path: string, handler: Function): void {
        this.registerRouteWithMethod(RequestTypes.Delete, path, handler);
    }

    /**
     * Returns routeHandlers for the current set of 
     */
    public getRouteHandlers(): ImmutableJsMap<string, ImmutableJsMap<string, Function>> {
        return this.routeHandlers;
    }
}