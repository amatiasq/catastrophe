import ModelBuffer from './model-buffer';
import { HashMap, SwapState } from './types';

export default class SetBuffer<T extends ModelBuffer> {

    private readonly content = new Map<string, T>();
    private readonly changes = new Map<string, T | null>();

    get size() {
        return this.content.size;
    }

    constructor(
        private readonly creator: ModelBufferCreator<T>,
    ) {}

    has(value: T) {
        return this.content.has(value.id);
    }

    get(id: string) {
        return this.content.get(id);
    }

    add(value: T) {
        const { id } = value;
        const existing = this.content.get(id);
        const isChange = existing !== value;

        if (isChange) {
            this.changes.set(value.id, value);
        } else if (this.changes.has(value.id)) {
            this.changes.delete(value.id);
        }

        return isChange;
    }

    delete(value: T) {
        const { id } = value;
        const existing = this.content.get(id);
        const isChange = existing !== value;

        if (isChange) {
            this.changes.set(value.id, null);
        } else if (this.changes.has(value.id)) {
            this.changes.delete(value.id);
        }

        return isChange;
    }

    swap(): SetBufferChange<T> | null {
        const { content, changes } = this;
        const result = {};
        let hasChanges = false;

        this.content.forEach((entry: T, id: string) => {
            const diff = entry.swap();

            if (diff) {
                result[id] = diff;
                hasChanges = true;
            }
        });

        if (changes.size) {
            hasChanges = true;

            changes.forEach((entry: T | null, id: string) => {
                result[id] = entry;

                if (entry == null) {
                    content.delete(id);
                } else {
                    content.set(id, entry);
                }
            });

            changes.clear();
        }

        return hasChanges ? result : null;
    }

    apply(diff: SetBufferChange<T> | null) {
        if (!diff) {
            return;
        }

        const { content } = this;

        Object.keys(diff).forEach(key => {
            const value = diff[key];

            if (value == null) {
                content.delete(key);
                return;
            }

            const current = content.get(key);

            if (current) {
                current.apply(value);
            } else {
                content.set(key, this.creator(key, value));
            }
        });
    }

}

export type ModelBufferCreator<T extends ModelBuffer> = (id: string, props: object) => T;
export type SetBufferChange<T extends ModelBuffer> = HashMap<SwapState<T>>;
