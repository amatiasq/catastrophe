import { DEBUG_PATHFINDING_CLUSTERS_NODES, DEBUG_PATHFINDING_CLUSTERS_ROUTES, DEV_MODE } from '../../constants';
import Color from '../../geometry/color';
import { Side } from '../../geometry/side';
import Vector from '../../geometry/vector';
import notNull from '../../meta/not-null';
import { IArea } from './i-area';
import { INode } from './i-node';
import { IPathfindingAlgorithm } from './i-pathfinding-algorithm';

// Debug only
const COLORS = [ Color.GREEN, Color.GRAY ];
// 'green', 'orange', 'gray', 'cyan', 'pink', 'purple' ];
let index = 0;

export class Cluster {
    private entrances: Set<INode>;
    private paths = new WeakMap<INode, Path>();

    constructor(
        private readonly world: IArea,
        private readonly algorithm: IPathfindingAlgorithm,
        public readonly pos: Vector,
        public readonly area: IArea,
    ) {
        if (DEV_MODE && area.size.x === 0 || area.size.y === 0) {
            throw new Error('Cluster with empty area');
        }
    }

    resolve(start: INode, end: INode): INode[] | null {
        if (this.paths.has(start)) {
            const cache = notNull(this.paths.get(start));

            if (cache.has(end)) {
                return notNull(cache.get(end));
            }
        }

        return this.algorithm.getPath(start, end, this.area);
    }

    processEntrances(): INode[] {
        this.entrances = new Set<INode>([
            ...this.processSideEntrances(Side.NORTH),
            ...this.processSideEntrances(Side.SOUTH),
            ...this.processSideEntrances(Side.EAST),
            ...this.processSideEntrances(Side.WEST),
            // this.processSideEntrances(world, Side.UP);
            // this.processSideEntrances(world, Side.DOWN);
        ]);

        this.resolveEntrancesPaths();
        return this.getEntrances();
    }

    private resolveEntrancesPaths(): void {
        const paths = this.paths = new WeakMap();

        for (const entrance of this.entrances) {
            for (const other of this.entrances) {
                if (entrance !== other && (!paths.has(other) || !paths.get(other).has(entrance))) {
                    this.addPathsToCache(entrance, other);
                }
            }
        }
    }

    getEntrances(): INode[] {
        return [...this.entrances];
    }

    getConnections(node: INode): Path {
        if (!this.paths.has(node)) {
            for (const entrance of this.entrances) {
                this.addPathsToCache(node, entrance);
            }
        }

        return notNull(this.paths.get(node));
    }

    addPathsToCache(start: INode, end: INode) {
        const paths = this.paths;
        const path = this.resolve(start, end);

        if (!path) {
            return;
        }

        if (!paths.has(start)) {
            paths.set(start, new Map());
        }

        if (!paths.has(end)) {
            paths.set(end, new Map());
        }

        path.unshift(start);
        notNull(paths.get(start)).set(end, path);
        notNull(paths.get(end)).set(start, [...path].reverse());

        if (DEBUG_PATHFINDING_CLUSTERS_ROUTES) {
            const color = COLORS[index++ % COLORS.length];

            for (const step of path) {
                if (!step.debugColor) {
                    step.debugColor = color;
                }
            }
        }
    }

    private processSideEntrances(direction: Side) {
        const tiles = this.getSideTiles(direction);
        const entrances = [];

        for (const tile of tiles) {
            const neighbor = this.world.getNeighbor(tile, direction);

            if (neighbor && !tile.isObstacle && !neighbor.isObstacle) {
                entrances.push(tile);
            }
        }

        return this.reduceEntrances(entrances, direction);
    }

    private reduceEntrances(entrances: INode[], direction: Side): INode[] {
        const result: INode[] = [];

        for (const tile of entrances) {
            let neighborsCount = 0;

            for (const other of entrances) {
                if (tile !== other && tile.isNeighbor(other)) {
                    neighborsCount++;
                }
            }

            if (neighborsCount === 0 || neighborsCount === 1) {
                if (DEBUG_PATHFINDING_CLUSTERS_NODES) {
                    tile.debugColor = Color.BLUE;
                }

                result.push(tile);
            }
        }

        return result;
    }

    private getSideTiles(direction: Side) {
        switch (direction) {
            case Side.NORTH:
                return notNull(this.area.getRow(0));

            case Side.SOUTH:
                return notNull(this.area.getRow(-1));

            case Side.EAST:
                return notNull(this.area.getCol(-1));

            case Side.WEST:
                return notNull(this.area.getCol(0));

            default:
                throw new Error(`Unknown side: [${direction}]`);
        }
    }
}

type Path = Map<INode, INode[]>;
