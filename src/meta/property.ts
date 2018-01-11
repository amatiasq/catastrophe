export default function property<T extends ChangeEmitter>(target: T, key: keyof T) {
    const internal = `_${key}`;

    if (!('onChange' in target)) {
        Object.defineProperty(target, 'onChange', {
            configurable: true,
            writable: true,
            value: noop,
        });
    }

    Object.defineProperty(target, key, {

        get() {
            return this[internal];
        },

        // tslint:disable-next-line:no-any
        set(value: any) {
            if (this[internal] !== value) {
                this[internal] = value;
                (this as T).onChange();
            }
        }
    });
}

// tslint:disable-next-line:no-empty
function noop() {}

interface ChangeEmitter {
    onChange(): void;
}
