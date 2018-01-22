import { DEV_MODE } from '../constants';

export default function notNull<T>(value: T | null | undefined): T {
    if (DEV_MODE && value == null) {
        throw new Error('unexpected null');
    }

    return value as T;
}
