import Rectangle from '../../geometry/rectangle';
import Vector from '../../geometry/vector';
import notNull from '../../meta/not-null';
import Game from '../game';
import { Task, TaskWorker } from './index';

const SECONDS_PER_WALL = 0.5;

export default class TaskWallDemolish implements Task {

    priority = 0;
    private _isCompleted = false;
    private tileIterator: Iterator<Vector> | null = null;
    private workingCoords: Vector | null = null;
    private worker: TaskWorker | null = null;
    private remaining = SECONDS_PER_WALL;

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

        const tile = notNull(this.game.grid.getAt(notNull(this.workingCoords)));
        tile.isEnabled = false;

        this.nextTile();
    }

    private nextTile() {
        const worker = notNull(this.worker);
        const { value, done } = (this.tileIterator as Iterator<Vector>).next() as {
            value: Vector,
            done: boolean,
        };

        if (done) {
            this.workingCoords = null;
            this._isCompleted = true;
            worker.assignTask(null);
            return;
        }

        const tile = notNull(this.game.grid.getAt(value));

        if (!tile.isEnabled) {
            this.nextTile();
            return;
        }

        this.workingCoords = value;
        this.remaining = SECONDS_PER_WALL;
        this.game.moveEntity(worker, value);
    }

}
