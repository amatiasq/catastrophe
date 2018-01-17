import { DEBUG_PATHFINDING_CLUSTERS } from '../../constants';
import Color from '../../geometry/color';
import Vector from '../../geometry/vector';
import notNull from '../../meta/not-null';
import { INode, INodeRelation } from './i-node';

export class Node implements INode {
    private static idCounter = 0;
    private readonly children = new Set<INode>();
    private readonly neighbors = new Map<Node, INodeRelation>();
    private dirty = true;
    private _travelCost: number;
    private sampleChild: INode;
    id: string;
    debugColor: Color;
    debugContent: string;

    constructor() {
        this.id = `${Node.idCounter++}`;
    }

    get pos(): Vector {
        return this.sampleChild ? this.sampleChild.pos : Vector.ZERO;
    }

    get travelCost(): number {
        if (this.dirty) {
            // TODO: Consider using the highest travelCost instead of an average
            //       To improve what isObstacle means
            this._travelCost = average(this.children, 'travelCost');
        }

        return this._travelCost;
    }

    get isObstacle(): boolean {
        return this.travelCost === 1;
    }

    addChild(child: INode): void {
        this.dirty = true;
        this.children.add(child);
        this.sampleChild = child;

        if (DEBUG_PATHFINDING_CLUSTERS) {
            child.debugColor = Color.BROWN;
            child.debugContent = this.id;
        }
    }

    hasChild(child: INode): boolean {
        if (this.children.has(child)) {
            return true;
        }

        for (const entry of this.children) {
            if (entry.isNeighbor(child)) {
                this.addChild(child);
                return true;
            }
        }

        return false;
    }

    setNeighbor(node: Node, relation: INodeRelation): void {
        const current = this.neighbors.get(node);

        if (!current ||  current.cost > relation.cost) {
            this.neighbors.set(node, relation);
        }
    }

    removeNeighbor(node: Node): void {
        this.neighbors.delete(node);
    }

    getNeighbors(): Map<Node, INodeRelation> {
        return this.neighbors;
    }

    getRelation(neighbor: Node): INodeRelation {
        if (!this.isNeighbor(neighbor)) {
            throw new Error('Argument should be a neighbor');
        }

        return notNull(this.neighbors.get(neighbor));
    }

    isNeighbor(node: Node): boolean {
        return this.neighbors.has(node);
    }

    getCostTo(neighbor: Node): number {
        return this.getRelation(neighbor).cost;
    }

    estimateDistanceTo(node: Node): number {
        return this.sampleChild.estimateDistanceTo(node.sampleChild);
    }
}

export class TemporalNode extends Node {
    reconnect(): this {
        for (const [neighbor, relation] of this.getNeighbors()) {
            neighbor.setNeighbor(this, relation);
        }

        return this;
    }

    disconnect() {
        for (const [neighbor] of this.getNeighbors()) {
            neighbor.removeNeighbor(this);
        }
    }
}

function average<T>(list: Set<T>, property: keyof T) {
    let sum = 0;

    for (const entry of list) {
        sum += entry[property] as any as number;
    }

    return sum / list.size;
}
