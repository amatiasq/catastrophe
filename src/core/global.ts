const value = getGlobal();

export default value;

function getGlobal(): Window | NodeJS.Global | null {
    if (typeof window !== 'undefined') {
        return window;
    }

    if (typeof self !== 'undefined') {
        return self;
    }

    if (typeof global !== 'undefined') {
        return global;
    }

    return null;
}