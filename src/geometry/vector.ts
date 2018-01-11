import { DEGREES_IN_PI_RADIANS, MAX_DEGREES } from 'amq-tools/util/math/constants';
import Round from 'amq-tools/util/math/round';

const round = Round.curry(2);

export default class Vector implements Vector, Iterable<Vector> {
    static ZERO = Vector.of(0, 0);
    static MAX = Vector.of(Infinity, Infinity);

    static from(value: object, xProp = 'x', yProp = 'y') {
        return Vector.of(value[xProp], value[yProp]);
    }

    static of(x: number, y: number): Vector {
        return new Vector(round(x), round(y));
    }

    static iterate(vectorA: Vector, vectorB: Vector = Vector.of(0, 0)) {
        const start = this.map(Math.min, vectorA, vectorB);
        const end = this.map(Math.max, vectorA, vectorB);
        const result = [];

        for (let { y } = start; y < end.y; y++) {
            for (let { x } = start; x < end.x; x++) {
                result.push(Vector.of(x, y));
            }
        }

        return result;
    }

    static map(action: (...values: number[]) => number, ...vectors: Vector[]) {
        return Vector.of(
            action(...vectors.map(vector => vector.x)),
            action(...vectors.map(vector => vector.y)),
        );
    }

    static merge(vectorA: Vector, vectorB: Vector, ...others: Vector[]): Vector {
        let x = vectorA.x + vectorB.x;
        let y = vectorA.y + vectorB.y;

        if (others.length) {
            for (const vector of others) {
                x += vector.x;
                y += vector.y;
            }
        }

        return Vector.of(x, y);
    }

    static diff(vectorA: Vector, vectorB: Vector, ...others: Vector[]): Vector {
        let x = vectorA.x - vectorB.x;
        let y = vectorA.y - vectorB.y;

        if (others.length) {
            for (const vector of others) {
                x -= vector.x;
                y -= vector.y;
            }
        }

        return Vector.of(x, y);
    }

    static range(...vectors: Vector[]) {
        return {
            min: this.map(Math.min, ...vectors),
            max: this.map(Math.max, ...vectors),
        };
    }

    constructor(readonly x: number, readonly y: number) { }

    get isZero(): boolean {
        return this.x === 0 && this.y === 0;
    }

    get radians(): number {
        if (this.isZero) {
            return 0;
        }

        let arctan = Math.atan(this.y / this.x);

        if (arctan < 0) {
            arctan += Math.PI;
        }

        if (this.y < 0 || (this.y === 0 && this.x < 0)) {
            arctan += Math.PI;
        }

        return arctan;
    }

    get degrees(): number {
        const degrees = (this.radians / Math.PI * DEGREES_IN_PI_RADIANS) % MAX_DEGREES;
        return degrees < 0 ? degrees + MAX_DEGREES : degrees;
    }

    get magnitude(): number {
        return this.isZero ? 0 : round(Math.hypot(this.x, this.y));
    }

    to(target: object, xProp = 'x', yProp = 'y') {
        target[xProp] = this.x;
        target[yProp] = this.y;
    }

    is({ x = this.x, y = this.y }: VectorSetter): boolean {
        return this.x === x && this.y === y;
    }

    isValue(x: number, y = x): boolean {
        return this.x === x && this.y === y;
    }

    set({ x = this.x, y = this.y }: VectorSetter): Vector {
        return Vector.of(x, y);
    }

    add({ x = 0, y = 0 }: VectorSetter): Vector {
        return Vector.of(this.x + x, this.y + y);
    }

    addValue(x: number, y = x): Vector {
        return Vector.of(this.x + x, this.y + y);
    }

    sustract({ x = 0, y = 0 }: VectorSetter): Vector {
        return Vector.of(this.x - x, this.y - y);
    }

    sustractValue(x: number, y = x): Vector {
        return Vector.of(this.x - x, this.y - y);
    }

    multiply({ x = 1, y = 1 }: VectorSetter): Vector {
        return Vector.of(this.x * x, this.y * y);
    }

    multiplyValue(x: number, y = x): Vector {
        return Vector.of(this.x * x, this.y * y);
    }

    divide({ x = 1, y = 1 }: VectorSetter): Vector {
        return Vector.of(this.x / x, this.y / y);
    }

    divideValue(x: number, y = x): Vector {
        return Vector.of(this.x / x, this.y / y);
    }

    clamp({ x = this.x, y = this.y }: VectorSetter) {
        return Vector.of(Math.min(this.x, x), Math.min(this.y, y));
    }

    clampValue(x: number, y = x) {
        return Vector.of(Math.min(this.x, x), Math.min(this.y, y));
    }

    map(operation: VectorMapper): Vector {
        return Vector.of(operation(this.x, 'x', this), operation(this.y, 'y', this));
    }

    every(operation: VectorTest): boolean {
        return operation(this.x, 'x', this) && operation(this.y, 'y', this);
    }

    some(operation: VectorTest): boolean {
        return operation(this.x, 'x', this) || operation(this.y, 'y', this);
    }

    copyTo(object: { x: number, y: number }) {
        object.x = this.x;
        object.y = this.y;
    }

    toString(): string {
        return `[Vector(${this.x},${this.y})]`;
    }

    toArray(): number[] {
        return [this.x, this.y];
    }

    toObject() {
        return { x: this.x, y: this.y };
    }

    toJSON(): string {
        return `{x:${this.x},y:${this.y}}`;
    }

    *[Symbol.iterator]() {
        for (const entry of Vector.iterate(this)) {
            yield entry;
        }
    }
}

export interface XSetter {
    x: number;
    y?: number;
}

export interface YSetter {
    x?: number;
    y: number;
}

export type VectorSetter = XSetter | YSetter;
export type VectorTest = (coord: number, key: 'x' | 'y', vector: Vector) => boolean;
export type VectorMapper = (coord: number, key: 'x' | 'y', vector: Vector) => number;
