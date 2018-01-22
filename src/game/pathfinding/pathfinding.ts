import { bind } from 'bind-decorator';
import { DEBUG_PATHFINDING_CLUSTERS_NODES } from '../../constants';
import Vector from '../../geometry/vector';
import notNull from '../../meta/not-null';
import { Cluster } from './cluster';
import { IArea } from './i-area';
import { INode, ITile } from './i-node';
import { IPathfindingAlgorithm } from './i-pathfinding-algorithm';
import { Node, TemporalNode } from './node';

export class Pathfinding {
    private readonly nodes = []  as Node[];
    private readonly clusters: Cluster[][];
    private readonly tempNodes = new WeakMap<INode, TemporalNode>();
    private readonly cache = new Map<string, PathfindingResult | null>();
    public readonly size: Vector;

    constructor(
        world: IArea,
        private readonly algorithm: IPathfindingAlgorithm,
        public readonly clusterSize: number,
    ) {
        if (clusterSize < 3) {
            throw new Error('Cluster size has to be an integer bigger than 2');
        }

        this.size = new Vector(world.size.x / clusterSize, world.size.y / clusterSize);
        this.clusters = [];
        const areaSize = new Vector(clusterSize, clusterSize);

        for (let j = 0; j < this.size.y; j++) {
            this.clusters[j] = [];

            for (let i = 0; i < this.size.x; i++) {
                const range = world.getRange(areaSize.multiply({ x: i, y: j }), areaSize);
                this.clusters[j][i] = new Cluster(world, algorithm, new Vector(i, j), range);
            }
        }

        this.processConnections();
    }

    getCost(start: ITile, end: ITile) {
        const path = this.resolve(start, end);
        this.cache.set(this.getCacheKey(start, end), path);

        return path ?
            path.tiles.reduce((sum, tile) => sum + tile.travelCost, 0) :
            null;
    }

    clearCache() {
        this.cache.clear();
    }

    private getCacheKey(start: ITile, end: ITile) {
        return `${start.pos.x},${start.pos.y},${end.pos.x},${end.pos.y}`;
    }

    resolve(start: ITile, end: ITile): PathfindingResult | null {
        const cacheKey = this.getCacheKey(start, end);

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey) || null;
        }

        if (start.isObstacle || end.isObstacle) {
            return null;
        }

        const startCluster = this.getClusterFor(start);

        if (startCluster === this.getClusterFor(end)) {
            const path = startCluster.resolve(start, end);

            if (path) {
                return { levels: [], tiles: path };
            }
        }

        const startNode = this.getTempNodeFor(start);
        const endNode = this.getTempNodeFor(end);
        const result = this.resolveInternal(startNode, endNode);
        startNode.disconnect();
        endNode.disconnect();
        return result;
    }

    private resolveInternal(startNode: TemporalNode, endNode: TemporalNode) {
        const path = this.algorithm.getPath(startNode, endNode) as Node[];

        if (!path) {
            return null;
        }

        const tiles: INode[][] = [];
        let prev: Node = startNode;

        for (const step of path) {
            const between = this.fixBridges(
                last(tiles),
                this.getTilesBetween(prev, step),
            );

            tiles.push(between);
            prev = step;
        }

        return {
            levels: [path],
            tiles: ([] as ITile[]).concat(...tiles),
        };
    }

    private fixBridges(prev: INode[], current: INode[]): INode[] {
        if (!prev) {
            return current;
        }

        const lastTile = last(prev);
        const firstTile = current[0];

        if (lastTile.isNeighbor(firstTile)) {
            return current;
        }

        return [
            ...notNull(this.algorithm.getPath(lastTile, current[0])),
            ...current.slice(1),
        ];
    }

    private getTilesBetween(start: Node, end: Node): INode[] {
        const { childA, childB } = start.getRelation(end);
        const isSorted = start.hasChild(childA);
        const startTile = isSorted ? childA : childB;
        const endTile = isSorted ? childB : childA;
        const cluster = this.getClusterFor(startTile);

        if (this.getClusterFor(endTile) !== cluster) {
            throw new Error('Tiles are from different clusters');
        }

        return notNull(cluster.resolve(startTile, endTile));
    }

    processConnections() {
        this.forEach(this.processCluster);

        if (DEBUG_PATHFINDING_CLUSTERS_NODES) {
            this.nodes.map(node => {
                let message = '';

                for (let [ neighbor, relation ] of node.getNeighbors()) {
                    message += `${node.id} - ${neighbor.id} = ${relation.cost}\n`;
                }

                console.log(message);
            });
        }
    }

    recalculate(tile: ITile) {
        this.processCluster(this.getClusterFor(tile));
    }

    @bind
    private processCluster(cluster: Cluster) {
        for (const entrance of cluster.processEntrances()) {
            const node = this.getNodeFor(entrance);

            for (const [connection, path] of cluster.getConnections(entrance)) {
                const connectionNode = this.getNodeFor(connection);
                const relation = {
                    cost: this.algorithm.getCost(entrance, path),
                    childA: entrance,
                    childB: connection,
                };

                node.setNeighbor(connectionNode, relation);
                connectionNode.setNeighbor(node, relation);
            }
        }

    }

    private findNode(child: INode) {
        return this.nodes.find(node => node.hasChild(child));
    }

    private getNodeFor(child: INode) {
        let node = this.findNode(child);

        if (!node) {
            node = new Node();
            node.addChild(child);
            this.nodes.push(node);
        }

        return node;
    }

    private getTempNodeFor(child: INode) {
        if (this.tempNodes.has(child)) {
            return notNull(this.tempNodes.get(child)).reconnect();
        }

        const cluster = this.getClusterFor(child);
        const node = new TemporalNode();
        node.addChild(child);

        for (const [connection, path] of cluster.getConnections(child)) {
            node.setNeighbor(this.getNodeFor(connection), {
                cost: this.algorithm.getCost(child, path),
                childA: child,
                childB: connection,
            });
        }

        const overlappingNode = this.findNode(child);
        if (overlappingNode) {
            node.setNeighbor(overlappingNode, {
                cost: 0,
                childA: child,
                childB: child,
            });
        }

        this.tempNodes.set(child, node);
        return node.reconnect();
    }

    private getClusterFor(child: INode) {
        const index = child.pos
            .divideValue(this.clusterSize)
            .map(Math.floor);

        return this.clusters[index.y][index.x];
    }

    forEach(iterator: (cluster: Cluster, pathfinding: Pathfinding) => void) {
        for (let row of this.clusters) {
            for (let cluster of row) {
                iterator(cluster, this);
            }
        }
    }
}

function last<T>(list: T[]): T {
    return list[list.length - 1];
}

interface PathfindingResult {
    levels: Node[][];
    tiles: ITile[];
}
