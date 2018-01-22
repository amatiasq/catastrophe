import round from 'amq-tools/util/math/round';
import { DEBUG_PATHFINDING_PERFORMANCE, DEV_MODE } from '../../constants';
import notNull from '../../meta/not-null';
import { IArea } from './i-area';
import { INode } from './i-node';
import { IPathfindingAlgorithm } from './i-pathfinding-algorithm';

export default class AStar<T extends INode> implements IPathfindingAlgorithm {
    private pool: AStarNodePool<T>;

    constructor(closerModifier: number) {
        this.pool = new AStarNodePool<T>(closerModifier);
    }

    getCost(start: T, path: T[]): number {
        let cost = 0;
        let prev = null;

        for (const step of path) {
            if (prev) {
                cost += prev.getCostTo(step);
            }

            prev = step;
        }

        return round(cost);
    }

    getPath(start: T, end: T, area?: IArea): T[] | null {
        if (start === end) {
            return [end];
        }

        if (!DEBUG_PATHFINDING_PERFORMANCE) {
            return this.getPathInternal(start, end, area);
        }

        const before = performance.now();
        const result = this.getPathInternal(start, end, area);
        const after = performance.now();
        AStar.log(after - before, result && result.length);
        return result;
    }

    private getPathInternal(start: T, end: T, area?: IArea): T[] | null {
        const open = new Set<AStarNode<T>>();
        const closed = new Set<AStarNode<T>>();

        let current: AStarNode<T>;
        open.add(this.pool.getNode(start));

        while (open.size) {
            current = this.getNext(open, closed);

            if (current.child === end) {
                return this.retrace(start, current);
            }

            for (const [child, relation] of current.child.getNeighbors(area)) {
                const neighbor = this.pool.getNode(child as T);
                const movement = (current.pathCost || 0) + relation.cost;

                if (child.isObstacle) {
                    throw new Error('No obstacle tiles should make it to A* algorithm');
                }

                if (closed.has(neighbor)) {
                    continue;
                }

                if (movement < (neighbor.pathCost as number) || !open.has(neighbor)) {
                    neighbor.pathCost = movement;
                    neighbor.estimatedCost = child.estimateDistanceTo(end);
                    neighbor.parent = current;

                    if (!open.has(neighbor)) {
                        open.add(neighbor);
                    }
                }

                if (!open.has(neighbor)) {
                    neighbor.dispose();
                }
            }
        }

        for (const node of closed) {
            node.dispose();
        }

        return null;
    }

    /*
     * Helpers
     */

    getNext(open: NodeSet<T>, closed: NodeSet<T>): AStarNode<T> {
        let best: AStarNode<T> | null = null;

        for (let item of open) {
            if (!best || (item.cost < best.cost || (item.cost === best.cost && item.cost < best.cost))) {
                best = item;
            }
        }

        // open always have at least one item
        const final = notNull(best);

        open.delete(final);
        closed.add(final);
        return final;
    }

    retrace(start: T, end: AStarNode<T>): T[] {
        const path: T[] = [];
        let current = end;

        while (current.child !== start) {
            path.push(current.child);
            current = notNull(current.parent);
        }

        return path.reverse();
    }

    /*
     * PERFORMANCE
     */
    private static logs: number[] = [];

    private static log(time: number, steps: number | null) {
        this.logs.push(time);
        const total = this.logs.reduce((sum, current) => sum + current);
        const average = total / this.logs.length;
        console.log(`[A*] ${this.round(time)}ms for ${steps || 'no'} steps (avg ${this.round(average)}ms)`);
    }

    private static round(value: number) {
        return Math.round(value * 100) / 100;
    }
}

class AStarNode<T> {
    public parent: AStarNode<T> | null;
    public pathCost: number | null;
    public estimatedCost: number | null;
    private _isDisposed = false;

    constructor(
        private _child: T,
        private closerModifier: number,
    ) { }

    get child(): T {
        if (DEV_MODE) {
            this.checkDisposed();
        }

        return this._child;
    }

    get cost(): number {
        if (DEV_MODE) {
            this.checkDisposed();
        }

        return (this.pathCost || 0) + (this.estimatedCost || 0) * this.closerModifier;
    }

    get isDisposed(): boolean {
        return this._isDisposed;
    }

    init() {
        this._isDisposed = false;
    }

    dispose() {
        this.pathCost = null;
        this.estimatedCost = null;
        this.parent = null;
        this._isDisposed = true;
    }

    private checkDisposed() {
        if (this.isDisposed) {
            throw new DisposedInstanceInvocationError(`Instance of ${this.constructor.name} is disposed!`);
        }
    }
}

class AStarNodePool<T extends object> {
    private pool = new WeakMap<T, AStarNode<T>>();
    private using = new Set<AStarNode<T>>();

    constructor(
        private closerModifier: number,
    ) { }

    get liveInstancesCount() {
        return this.using.size;
    }

    getNode(tile: T): AStarNode<T> {
        let instance;

        if (this.pool.has(tile)) {
            instance = notNull(this.pool.get(tile));
        } else {
            instance = new AStarNode<T>(tile, this.closerModifier);
        }

        this.pool.set(tile, instance);
        this.using.add(instance);
        instance.init();
        return instance;
    }

    dispose(node: AStarNode<T> | AStarNode<T>[]) {
        if (Array.isArray(node)) {
            node.forEach(entry => this.dispose(entry));
            return;
        }

        this.using.delete(node);
        node.dispose();
    }
}

interface NodeSet<T> extends Set<AStarNode<T>> { }
class DisposedInstanceInvocationError extends Error { }
