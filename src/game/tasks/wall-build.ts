import { BUILD_WALL_SECONDS_PER_WALL } from '../../constants';
import Vector from '../../geometry/vector';
import notNull from '../../meta/not-null';
import Game from '../game';
import Area from '../world/area';
import Tile from '../world/tile';
import { Task, TaskWorker } from './index';
import TaskWalk from './walk';

const SECONDS_PER_WALL = BUILD_WALL_SECONDS_PER_WALL;
const MAX_DISTANCE = 1000;

export default class TaskWallBuild implements Task {

    priority = 0;
    private _isCompleted = false;
    private tileIterator: Iterator<Vector> | null = null;
    private workingCoords: Vector | null = null;
    private walking: TaskWalk | null = null;
    private worker: TaskWorker | null = null;
    private remaining = SECONDS_PER_WALL;

    get isCompleted() {
        return this._isCompleted;
    }

    constructor(
        private game: Game,
        private area: Area
    ) {}

    isValidWorker(worker: TaskWorker): number {
        const closestTile = this.area.getClosestTo(worker.pos);
        return MAX_DISTANCE - closestTile.estimateDistanceTo(worker.pos);
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

        if (this.walking && !this.walking.isCompleted) {
            this.walking.step();
            return;
        }

        this.remaining -= this.game.deltaSeconds;

        if (this.remaining > 0) {
            return;
        }

        const tile = notNull(this.game.grid.getAt(notNull(this.workingCoords)));
        tile.isEnabled = true;

        this.nextTile();
    }

    private nextTile() {
        const currentPos = notNull(this.worker).pos;

        // The worker should move to the tile closest to him

        if (this.area.contains(currentPos)) {
            const currentTile = notNull(this.game.grid.getAt(currentPos));
            const neighbors = this.area.getNeighbors(currentTile);

            for (const entry of neighbors) {
                if (this.moveTo(entry)) {
                    return;
                }
            }
        } else {
            const closestTile = this.area.getClosestTo(currentPos);

            if (this.moveTo(closestTile)) {
                return;
            }
        }

        this.iterateTiles();
    }

    private iterateTiles() {
        const { value, done } = notNull(this.tileIterator).next() as {
            value: Vector,
            done: boolean,
        };

        if (done) {
            this.workingCoords = null;
            this._isCompleted = true;
            notNull(this.worker).assignTask(null);
            return;
        }

        const tile = notNull(this.game.grid.getAt(value));

        if (this.moveTo(tile)) {
            return;
        }

        this.iterateTiles();
    }

    private moveTo(tile: Tile) {
        if (tile.isObstacle) {
            return false;
        }

        const worker = notNull(this.worker);
        const currentTile = notNull(worker.tile);

        if (currentTile.isObstacle) {
            if (currentTile.isNeighbor(tile)) {
                worker.tile = tile;
            } else {
                const neighbors = this.game.grid.getNeighbors(currentTile);
                const valid = neighbors.find(entry => !entry.isObstacle);

                if (!valid) {
                    throw Error('Trapped minion!');
                }

                worker.tile = valid;
            }
        }

        this.workingCoords = tile.pos;
        this.remaining = SECONDS_PER_WALL;
        this.walking = new TaskWalk(this.game, tile);
        this.walking.assign(worker);
        return true;
    }

}
