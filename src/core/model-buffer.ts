let _id = 0;

export default abstract class ModelBuffer {

    private static creator: (state: ModelBuffer) => ModelBufferWrapper;

    readonly id = String(_id++);
    readonly type = this.constructor.name;
    readonly hasChanged = false;
    private wrapper: ModelBufferWrapper;
    private readonly props: KeyDoubleBuffer[];

    static fromId(id: string, ...args: any[]): ModelBuffer {
        const instance = new (this as any)(...args);
        instance.id = id;
        return instance;
    }

    static setWrapper(creator: (state: ModelBuffer) => ModelBufferWrapper) {
        this.creator = creator;
    }

    wrap() {
        if (!this.wrapper) {
            this.wrapper = (this.constructor as typeof ModelBuffer).creator(this);
        }

        return this.wrapper;
    }

    swap(): object | null {
        let diff: object | null = null;

        this.props.forEach(({ key, current, incoming, changed }) => {
            if (this[changed]) {
                if (!diff) {
                    diff = { type: this.type, id: this.id };
                }

                this[incoming] = diff[key] = this[current];
                this[changed] = false;
            }
        });

        return diff;
    }

    apply(diff: object): void {
        this.props.forEach(({ key, current, incoming, changed }) => {
            this[current] = diff[key];
            this[incoming] = null;
            this[changed] = false;
        });
    }

}

export function buffer<T>(target: T, key: string): void {
    const proto = target as any;
    const current = `${key}_current`;
    const incoming = `${key}_incoming`;
    const changed = `${key}_hasChanged`;
    const get = new Function(`return this.${incoming}`);
    const set = new Function('value', `
        if (value !== this.${current}) {
            this.${current} = value;
            this.${changed} = value !== this.${incoming};
            this.hasChanged = this.hasChanged || this.${changed};
        }
    `);

    if (!proto.props) {
        proto.props = [];
    }

    proto.props.push({
        key,
        current,
        incoming,
        changed,
    });

    Object.defineProperties(target, {

        [current]: { writable: true },
        [incoming]: { writable: true },
        [changed]: { writable: true, value: false },
        [key]: {
            enumerable: true,
            get: get as () => any,
            set: set as (value: any) => void,
        }
    });
}

interface KeyDoubleBuffer {
    key: string;
    current: string;
    incoming: string;
    changed: string;
}

interface ModelBufferWrapper {
    state: ModelBuffer;
}
