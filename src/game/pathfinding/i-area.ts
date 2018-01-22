import { Side } from '../../geometry/side';
import Vector from '../../geometry/vector';
import { INode } from './i-node';

export interface IArea<T extends INode = INode> {
    readonly size: Vector;
    getRange(position: Vector, size: Vector): IArea;
    getNeighbor(tile: T, direction: Side): T | null;
    getNeighbors(tile: T): T[];
    getRow(y: number): T[] | null;
    getCol(x: number): T[] | null;
}
