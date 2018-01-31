import Color from '../../geometry/color';
import Rectangle from '../../geometry/rectangle';
import Vector from '../../geometry/vector';
import property from '../../meta/property';
import Game from '../game';
import { IArea } from '../pathfinding/i-area';
import { INode, INodeRelation } from '../pathfinding/i-node';
import Entity from './entity';

export default class Tile implements INode {

    readonly entities = new Set<Entity>();
    readonly view: Rectangle;
    readonly center: Vector;
    onChange: () => void;
    debugColor: Color | null = null;
    debugContent: string | null = null;
    isHover = false;
    isBlueprint = false;

    @property
    isEnabled = false;

    get x() {
        return this.pos.x;
    }
    set x(value: number) {
        this.pos = Vector.of(value, this.pos.y);
    }

    get y() {
        return this.pos.y;
    }
    set y(value: number) {
        this.pos = Vector.of(this.pos.x, value);
    }

    constructor(
        private game: Game,
        public pos: Vector,
        size: Vector,
        private diagonalMovementCost: number,
    ) {
        this.view = new Rectangle(pos.multiply(size), size);
        this.center = this.view.pos.add(size.divideValue(2));
    }

    renderTile(context: Renderer2D) {
        const { x, y, width, height } = this.view;
        let color = Color.BLACK;

        if (this.isHover || this.isBlueprint) {
            color = this.isEnabled ? Color.RED : Color.BLUE;
        } else {
            color = this.isEnabled ? Color.WHITE : Color.BLACK;
        }

        context.strokeStyle = Color.GRAY.toString();
        context.fillStyle = color.toString();

        context.beginPath();
        context.rect(x, y, width, height);
        context.fill();
        context.stroke();
        context.closePath();

        if (this.debugColor) {
            context.strokeStyle = this.debugColor.toString();
            context.beginPath();
            context.rect(x + 1, y + 1, width - 2, height - 2);
            context.stroke();
            context.closePath();
        }
    }

    renderEntities(context: Renderer2D) {
        this.entities.forEach(entity => entity.render(context, this.game));
    }

    /***************
     * PATHFINDING *
     ***************/

    travelCost = this.game.getParam('DEFAULT_TRAVEL_COST');

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
