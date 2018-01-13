import Rectangle from '../../geometry/rectangle';
import Vector from '../../geometry/vector';
import Game from '../game';
import { Task, TaskWorker } from './index';

const SECONDS_PER_WALL = 0.5;

export default class TaskWallBuild implements Task {

    priority = 0;
    private _isCompleted = false;
    private tileIterator: Iterator<Vector> = null;
    private workingTile: Vector = null;
    private remaining = SECONDS_PER_WALL;
    private worker: TaskWorker = null;

    get isCompleted() {
        return this._isCompleted;
    }

    constructor(
        private game: Game,
        private area: Rectangle
    ) {}

    isValidWorker(worker: TaskWorker): number {
        return 1;
    }

    assign(worker: TaskWorker): void {
        this.worker = worker;
        this.tileIterator = this.area[Symbol.iterator]();
        this.nextTile();
    }

    step(): void {
        if (this.isCompleted) {
            return;
        }

        this.remaining -= this.game.deltaSeconds;

        if (this.remaining > 0) {
            return;
        }

        const tile = this.game.grid.getTileAt(this.workingTile);
        tile.isEnabled = true;

        this.nextTile();
    }

    private nextTile() {
        const { value, done } = this.tileIterator.next() as {
            value: Vector,
            done: boolean,
        };

        if (done) {
            this.workingTile = null;
            this._isCompleted = true;
            this.worker.assignTask(null);
            return;
        }

        const tile = this.game.grid.getTileAt(value);

        if (tile.isEnabled) {
            this.nextTile();
            return;
        }

        this.workingTile = value;
        this.remaining = SECONDS_PER_WALL;
        this.game.moveEntity(this.worker, value);
    }

}
