import { lowest } from '../../meta/best-of';
import notNull from '../../meta/not-null';
import Tile from './tile';

export default class WorkArea {

    private readonly todo: Set<Tile>;
    private readonly reserved = new Set<Tile>();
    private readonly done = new Set<Tile>();

    get isCompleted() {
        return this.todo.size === 0 && this.reserved.size === 0;
    }

    get needsWorkers() {
        return this.todo.size > 0;
    }

    get size() {
        return this.todo.size + this.reserved.size + this.done.size;
    }

    constructor(iterable: Iterable<Tile>) {
        this.todo = new Set<Tile>(iterable);
    }

    getTargetFrom(tile: Tile): Tile {
        return notNull(lowest(this.todo, entry => entry.estimateDistanceTo(tile)));
    }

    getNeighbors(tile: Tile) {
        return [ ...this.todo ].filter(entry => entry.isNeighbor(tile));
    }

    has(tile: Tile) {
        return this.todo.has(tile) || this.reserved.has(tile) || this.done.has(tile);
    }

    isTodo(tile: Tile) {
        return this.todo.has(tile);
    }

    isPending(tile: Tile) {
        return this.reserved.has(tile) || this.todo.has(tile);
    }

    isReserved(tile: Tile) {
        return this.reserved.has(tile);
    }

    isDone(tile: Tile) {
        return this.done.has(tile);
    }

    reserveTile(tile: Tile) {
        this.todo.delete(tile);
        this.reserved.add(tile);
    }

    completeTile(tile: Tile) {
        this.reserved.delete(tile);
        this.done.add(tile);
    }

    [Symbol.iterator]() {
        return this.todo[Symbol.iterator]();
    }

}
