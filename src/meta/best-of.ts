export function lowest<T, U>(list: ForEacheable<T>, serializer: Serializer<T, U>): T | null {
    let best: T | null = null;
    let bestValue: U | null = null;

    list.forEach(entry => {
        const value = serializer(entry);

        if (!best || value < (bestValue as U)) {
            bestValue = value;
            best = entry;
        }
    });

    return best;
}

export function highest<T, U>(list: ForEacheable<T>, serializer: Serializer<T, U>): T | null {
    let best: T | null = null;
    let bestValue: U | null = null;

    list.forEach(entry => {
        const value = serializer(entry);

        if (!best || value > (bestValue as U)) {
            bestValue = value;
            best = entry;
        }
    });

    return best;
}

type Serializer<T, U> = (value: T) => U;

interface ForEacheable<T> {
    forEach(iterator: (value: T) => void): void;
}