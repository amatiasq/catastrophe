import Game from '../game';
import Area from '../world/area';
import Tile from '../world/tile';
import { Task, WorkerEntity } from './index';

const MAX_DISTANCE = 10000;

export default class TaskWalk implements Task {

    readonly priority = 0;
    private _isCompleted = false;
    private target: Tile;

    get isCompleted() {
        return this._isCompleted;
    }

    constructor(game: Game, area: Area) {
        this.target = area.getCorners()[0];
    }

    isValidWorker(worker: WorkerEntity): number {
        return MAX_DISTANCE - this.target.estimateDistanceTo(worker.pos);
    }

    needsWorkers(): boolean {
        return true;
    }

    getTargetForWorker(worker: WorkerEntity): Tile {
        return this.target;
    }

    step(worker: WorkerEntity): boolean {
        this._isCompleted = true;
        return true;
    }

    apply() {
        // NOOP
    }

}
