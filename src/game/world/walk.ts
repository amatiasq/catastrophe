import { DEBUG_PATHFINDING_ROUTES } from '../../constants';
import Color from '../../geometry/color';
import notNull from '../../meta/not-null';
import Game from '../game';
import Entity from '../world/entity';
import Tile from '../world/tile';

export default class Walk {

    private readonly pathfinding = this.game.pathfinding;
    private route: Tile[] | null;
    private currentTile = 0;
    private remainingCost = 0;

    private _isCompleted = false;
    get isCompleted() {
        return this._isCompleted;
    }

    get isValid() {
        return Boolean(this.route);
    }

    constructor(
        private readonly game: Game,
        private readonly entity: Entity,
        private readonly target: Tile,
    ) {
        this.calculate();
    }

    private calculate() {
        const { entity, target, pathfinding } = this;
        const start = notNull(entity.tile);
        const {tiles} = notNull(pathfinding.resolve(start, target));

        if (!tiles) {
            console.warn(`Can't resolve path from ${start.pos} to ${target.pos}`);
            this.route = null;
            return;
        }

        this.route = tiles as Tile[];
        this.currentTile = 0;
        this.remainingCost = tiles[0].travelCost;
    }

    render(context: Renderer2D) {
        const { route } = this;

        if (!DEBUG_PATHFINDING_ROUTES || this.isCompleted || !route) {
            return;
        }

        const [{ center }, ...remaining ] = route.slice(this.currentTile - 1);

        context.save();
        context.strokeStyle = Color.WHITE.opacity(0.8).toString();
        context.beginPath();
        context.moveTo(center.x, center.y);
        remaining.forEach(({ center: { x, y }}) => context.lineTo(x, y));
        context.stroke();
        context.closePath();
        context.restore();
    }

    step(): boolean {
        if (this.isCompleted) {
            return true;
        }

        if (!this.route) {
            throw new Error('Requesting .step() on a not valid route');
        }

        const { game, currentTile, route } = this;
        const tile = route[currentTile];
        let { remainingCost } = this;
        let index = currentTile;

        // Tile might have become an obstacle since we started walking
        // In that case re-calculate and invoke .step() again
        // This recursion won't happen more than once per tick.
        if (tile.isObstacle) {
            this.calculate();
            return this.isValid ? this.step() : false;
        }

        remainingCost -= game.deltaSeconds;

        while (remainingCost <= 0) {
            index++;

            if (index === route.length) {
                this.complete();
                return true;
            }

            remainingCost += route[index].travelCost;
        }

        this.remainingCost = remainingCost;

        if (index !== currentTile) {
            this.currentTile = index;
            this.entity.tile = tile;
        }

        return false;
    }

    private complete() {
        this._isCompleted = true;
        const route = notNull(this.route);

        const lastTile = route[route.length - 1];

        if (lastTile) {
            this.entity.tile = lastTile;
        }
   }

}
