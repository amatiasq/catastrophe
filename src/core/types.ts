export type EnvironmentVariableProvider = (
    key: string,
    type?: 'string' | 'number' | 'boolean'
) => string | number | boolean;

export interface Coords {
    x: number;
    y: number;
}

export interface StateContainer<T> {
    getChanges(): SwapState<T> | null;
}

export type SwapState<T> = Partial<T> & { id: number, type: string };
export type HashMap<T> = { [id: string]: T } & { [id: number]: T };
