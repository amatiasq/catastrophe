import { highest } from '../../meta/best-of';
import notNull from '../../meta/not-null';
import Game from '../game';
import Tile from '../world/tile';
import WorkArea from '../world/work-area';
import { Task, Worker } from './index';

const MAX_DISTANCE = 1000;

export default abstract class AreaWork implements Task {

    readonly priority = 0;
    protected TICKS_PER_TILE = 60;
    private readonly remaining = new WeakMap<Tile, number>();
    private readonly complete = new Set<{ tile: Tile, worker: Worker }>();

    get isCompleted() {
        return this.area.isCompleted;
    }

    constructor(
        private readonly game: Game,
        protected readonly area: WorkArea
    ) {
        for (const tile of this.area) {
            tile.isBlueprint = true;
        }
    }

    isValidWorker(worker: Worker): number {
        const closestTile = this.area.getTargetFrom(notNull(worker.tile));
        return MAX_DISTANCE - closestTile.estimateDistanceTo(worker.pos);
    }

    needsWorkers(): boolean {
        return this.area.needsWorkers;
    }

    getTargetForWorker(worker: Worker): Tile {
        const tile = this.area.getTargetFrom(notNull(worker.tile));
        this.area.reserveTile(tile);
        return tile;
    }

    step(worker: Worker): boolean {
        if (this.isCompleted) {
            return true;
        }

        const tile = notNull(worker.tile);

        if (!this.area.isReserved(tile)) {
            throw new Error('Working on a tile not in the work :D');
        }

        let remaining = this.remaining.get(tile);

        if (remaining == null) {
            remaining = this.TICKS_PER_TILE;
        }

        remaining -= this.game.delta;

        if (remaining < 0) {
            remaining = 0;
        }

        this.remaining.set(tile, remaining);

        if (remaining !== 0) {
            return false;
        }

        this.complete.add({ tile, worker });
        this.area.completeTile(tile);
        return this.isCompleted;
    }

    apply() {
        this.complete.forEach(({ tile, worker }) => {
            this.onTileCompleted(tile, worker);

            tile.isBlueprint = false;
            worker.task = null;

            if (tile.isObstacle) {
                this.moveEntities(tile);
            }
        });

        this.complete.clear();
    }

    protected moveEntities(tile: Tile) {
        const { grid } = this.game;
        const { entities } = tile;

        const to = (
            this.getBestNeighborTile(grid.getAdjacent(tile)) ||
            this.getBestNeighborTile(grid.getDiagonals(tile)) ||
            grid.getNeighbors(tile).filter(entry => !entry.isObstacle)[0]
        );

        if (!to) {
            throw new Error('Entity has no place to go after work');
        }

        entities.forEach(entity => entity.tile = to);
    }

    private getBestNeighborTile(neighbors: Tile[]) {
        const { area, game: { grid }} = this;
        const valid = neighbors.filter(entry => !entry.isObstacle && area.has(entry));

        if (!valid.length) {
            return null;
        }

        return highest(valid, tile => {
            return grid
                .getNeighbors(tile)
                .filter(entry => area.has(entry))
                .length;
        });
    }

    protected abstract onTileCompleted(tile: Tile, worker: Worker): void;

}
