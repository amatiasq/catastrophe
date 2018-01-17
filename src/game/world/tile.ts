import { DEFAULT_TRAVEL_COST } from '../../constants';
import Color from '../../geometry/color';
import Rectangle from '../../geometry/rectangle';
import Vector from '../../geometry/vector';
import property from '../../meta/property';
import Game from '../game';
import { IArea } from '../pathfinding/i-area';
import { INode, INodeRelation } from '../pathfinding/i-node';
import Sprite from '../sprite';
import Entity from './entity';

export default class Tile extends Sprite implements INode {

    onChange: () => void;
    entities = new Set<Entity>();
    view: Rectangle;
    debugColor: Color | null = null;
    debugContent: string | null = null;

    @property
    isEnabled = false;

    @property
    isHover = false;

    constructor(
        private game: Game,
        public pos: Vector,
        size: Vector,
        private diagonalMovementCost: number,
    ) {
        super(pos);

        this.view = new Rectangle(pos.multiply(size), size);
    }

    _render(context: Renderer2D): void {
        context.translate(this.view.x, this.view.y);
        this.drawTile(context);
        this.drawEntities(context);
    }

    private drawTile(context: Renderer2D) {
        let color = Color.BLACK;

        if (this.isHover) {
            color = this.isEnabled ? Color.RED : Color.BLUE;
        } else {
            color = this.isEnabled ? Color.WHITE : Color.BLACK;
        }

        context.strokeStyle = (this.debugColor || Color.GRAY).toString();
        context.fillStyle = color.toString();

        context.beginPath();
        context.rect(0, 0, this.view.width, this.view.height);
        context.fill();
        context.stroke();
        context.closePath();
    }

    private drawEntities(context: Renderer2D) {
        this.entities.forEach(entity => entity.render(context, this.game));
    }

    /***************
     * PATHFINDING *
     ***************/

    travelCost = DEFAULT_TRAVEL_COST;

    get isObstacle() {
        return this.isEnabled === true;
    }

    isAdjacent(other: Tile) {
        return Vector.diff(this.pos, other.pos).magnitude === 1;
    }

    isDiagonal(other: Tile) {
        return Vector.diff(this.pos, other.pos).magnitude === Vector.round(Math.SQRT2);
    }

    getCostTo(neighbor: Tile): number {
        const tile = neighbor as Tile;

        if (this === neighbor) {
            return 0;
        }

        if (this.isAdjacent(tile)) {
            return 1;
        }

        if (this.isDiagonal(tile)) {
            return this.diagonalMovementCost;
        }

        throw new Error('Argument should be a neighbor');
    }

    estimateDistanceTo(tile: INode | Vector): number {
        const point = 'pos' in tile ? (tile as INode).pos : tile as Vector;
        const diff = Vector.diff(this.pos, point).map(Math.abs);

        const layerMovement = diff.x > diff.y ?
            this.diagonalMovementCost * 10 * diff.y + 10 * (diff.x - diff.y) :
            this.diagonalMovementCost * 10 * diff.x + 10 * (diff.y - diff.x);

        return Vector.round(layerMovement); // + z * LAYER_CHANGE_COST;
    }

    isNeighbor(other: INode): boolean {
        if (!(other instanceof Tile)) {
            throw new Error(`Expected Tile but ${other.constructor.name} found`);
        }

        return this.isAdjacent(other) || this.isDiagonal(other);
    }

    getNeighbors(area: IArea = this.game.grid): Map<INode, INodeRelation> {
        const neighbors = area.getNeighbors(this) as Tile[];
        const result = new Map<INode, INodeRelation>();

        for (const neighbor of neighbors) {
          if (!neighbor.isObstacle || neighbor === this) {
            result.set(neighbor, {
                cost: this.isAdjacent(neighbor) ? 1 : this.diagonalMovementCost,
                childA: this,
                childB: neighbor,
            });
          }
        }

        return result;
    }

}
