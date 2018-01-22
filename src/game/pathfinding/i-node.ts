import Color from '../../geometry/color';
import Vector from '../../geometry/vector';
import { IArea } from './i-area';

export interface INode {
    readonly pos: Vector;
    readonly travelCost: number;
    readonly isObstacle: boolean;
    getCostTo(neighbor: INode): number;
    isNeighbor(node: INode): boolean;
    getNeighbors(area?: IArea): Map<INode, INodeRelation>;
    estimateDistanceTo(node: INode): number;

    // debug only
    debugColor: Color | null;
    debugContent: string | null;
}

export interface ITile extends INode {}

export interface INodeRelation {
    cost: number;
    childA: INode;
    childB: INode;
}
