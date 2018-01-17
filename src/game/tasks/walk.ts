import { DEBUG_PATHFINDING_ROUTES } from '../../constants';
import Color from '../../geometry/color';
import notNull from '../../meta/not-null';
import Game from '../game';
import Tile from '../world/tile';
import { Task, TaskWorker } from './index';

const MAX_DISTANCE = 1000;

export default class TaskWalk implements Task {

    priority = 1;
    private pathfinding = this.game.pathfinding;
    private route: Tile[] | null = null;
    private worker: TaskWorker | null = null;
    private currentTile = 0;
    private remainingCost = 0;

    private _isCompleted = false;
    get isCompleted() {
        return this._isCompleted;
    }

    constructor(
        private readonly game: Game,
        public readonly target: Tile,
    ) {}

    isValidWorker(worker: TaskWorker): number {
        const cost = this.pathfinding.getCost(notNull(worker.tile), this.target);

        if (cost == null) {
            return 0;
        }

        return MAX_DISTANCE - cost;
    }

    assign(worker: TaskWorker): void {
        const {tiles} = notNull(this.pathfinding.resolve(notNull(worker.tile), this.target));

        console.log('assign', tiles);

        if (!tiles.length) {
            this.complete();
            return;
        }

        this.worker = worker;
        this.route = tiles as Tile[];
        this.currentTile = 0;
        this.remainingCost = tiles[0].travelCost;

        if (DEBUG_PATHFINDING_ROUTES) {
            tiles.map(tile => tile.debugColor = Color.RED);
        }
    }

    step(): void {
        if (this.isCompleted) {
            return;
        }

        const { game, currentTile } = this;
        const route = notNull(this.route);
        let { remainingCost } = this;
        let index = currentTile;

        remainingCost -= game.deltaSeconds;

        while (remainingCost <= 0) {
            index++;

            if (index === route.length) {
                this.complete();
                return;
            }

            remainingCost += route[index].travelCost;
        }

        this.remainingCost = remainingCost;

        if (index === currentTile) {
            return;
        }

        this.currentTile = index;
        const tile = route[currentTile];
        notNull(this.worker).tile = tile;
    }

    private complete() {
        this._isCompleted = true;
        const route = notNull(this.route);

        const lastTile = route[route.length - 1];

        if (lastTile) {
            notNull(this.worker).tile = lastTile;
        }

        if (DEBUG_PATHFINDING_ROUTES) {
            route.map(tile => tile.debugColor = null);
        }
   }

}
