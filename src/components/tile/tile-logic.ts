import { IArea } from '../../game/pathfinding/i-area';
import { INode, INodeRelation } from '../../game/pathfinding/i-node';
import Color from '../../geometry/color';
import Vector from '../../geometry/vector';
import StageLogic from '../stage/stage-logic';
import TileState from './tile-state';

export default class TileLogic implements INode {

    readonly pos: Vector;

    set debugColor(value: Color | null) {
        this.state.debugColor = value;
    }
    set debugContent(value: string) {
        this.state.debugContent = value;
    }

    get travelCost() {
        return this.state.travelCost;
    }

    get isObstacle() {
        return !this.state.hasWall;
    }

    constructor(
        private readonly stage: StageLogic,
        readonly state: TileState,
        private readonly diagonalMovementCost: number,
    ) {
        this.pos = Vector.of(this.state.x, this.state.y);
    }

    isAdjacent(other: TileLogic) {
        return Vector.diff(this.pos, other.pos).magnitude === 1;
    }

    isDiagonal(other: TileLogic) {
        return Vector.diff(this.pos, other.pos).magnitude === Vector.round(Math.SQRT2);
    }

    getCostTo(neighbor: INode): number {
        const tile = neighbor as TileLogic;

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

    isNeighbor(node: INode): boolean {
        if (!(node instanceof TileLogic)) {
            throw new Error(`Expected Tile but ${node.constructor.name} found`);
        }

        return this.isAdjacent(node) || this.isDiagonal(node);
    }

    getNeighbors(area: IArea<INode> = this.stage.map): Map<INode, INodeRelation> {
        const neighbors = area.getNeighbors(this) as TileLogic[];
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

    estimateDistanceTo(node: INode | Vector): number {
        const point = 'pos' in node ? (node as INode).pos : node as Vector;
        const diff = Vector.diff(this.pos, point).map(Math.abs);

        const layerMovement = diff.x > diff.y ?
            this.diagonalMovementCost * 10 * diff.y + 10 * (diff.x - diff.y) :
            this.diagonalMovementCost * 10 * diff.x + 10 * (diff.y - diff.x);

        return Vector.round(layerMovement); // + z * LAYER_CHANGE_COST;
    }

}
