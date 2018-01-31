import * as defaults from './parameters';
const vars = getVars();

export default env;

function env(variable: string): number;
function env(variable: string, type: 'string'): string;
function env(variable: string, type: 'number'): number;
function env(variable: string, type: 'boolean'): boolean;
function env(variable: string, type: 'string' | 'number' | 'boolean' = 'number') {
    const value = vars[variable] || defaults[variable] || null;

    if (!value || type === 'string' || typeof value === type) {
        return value;
    } else if (type === 'number') {
        return parseInt(value, 10);
    } else if (type === 'boolean') {
        return value === 'true';
    } else {
        throw new Error('meh');
    }
}

function getVars() {
    if (typeof process !== 'undefined') {
        return process.env;
    }

    if (typeof location !== 'undefined') {
        return location.search.slice(1).split('&').reduce((query, entry) => {
            const [ name, value ] = entry.split('=');
            query[decodeURIComponent(name)] = decodeURIComponent(value);
            return query;
        });
    }

    return {};
}
