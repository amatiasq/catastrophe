import TileLogic from '../../components/tile/tile-logic';
import { lowest } from '../../meta/best-of';
import notNull from '../../meta/not-null';

export default class WorkArea {

    private readonly todo: Set<TileLogic>;
    private readonly reserved = new Set<TileLogic>();
    private readonly done = new Set<TileLogic>();

    get isCompleted() {
        return this.todo.size === 0 && this.reserved.size === 0;
    }

    get needsWorkers() {
        return this.todo.size > 0;
    }

    get size() {
        return this.todo.size + this.reserved.size + this.done.size;
    }

    constructor(iterable: Iterable<TileLogic>) {
        this.todo = new Set<TileLogic>(iterable);
    }

    getTargetFrom(tile: TileLogic): TileLogic {
        return notNull(lowest(this.todo, entry => entry.estimateDistanceTo(tile)));
    }

    getNeighbors(tile: TileLogic) {
        return [ ...this.todo ].filter(entry => entry.isNeighbor(tile));
    }

    has(tile: TileLogic) {
        return this.todo.has(tile) || this.reserved.has(tile) || this.done.has(tile);
    }

    isTodo(tile: TileLogic) {
        return this.todo.has(tile);
    }

    isPending(tile: TileLogic) {
        return this.reserved.has(tile) || this.todo.has(tile);
    }

    isReserved(tile: TileLogic) {
        return this.reserved.has(tile);
    }

    isDone(tile: TileLogic) {
        return this.done.has(tile);
    }

    reserveTileLogic(tile: TileLogic) {
        this.todo.delete(tile);
        this.reserved.add(tile);
    }

    completeTileLogic(tile: TileLogic) {
        this.reserved.delete(tile);
        this.done.add(tile);
    }

    [Symbol.iterator]() {
        return this.todo[Symbol.iterator]();
    }

}
