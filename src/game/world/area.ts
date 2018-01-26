import Rectangle from '../../geometry/rectangle';
import { Side } from '../../geometry/side';
import Vector from '../../geometry/vector';
import { lowest } from '../../meta/best-of';
import notNull from '../../meta/not-null';
import { IArea } from '../pathfinding/i-area';
import { INode } from '../pathfinding/i-node';
import { Tiles } from './grid';
import Tile from './tile';
import WorkArea from './work-area';

export default class Area extends Rectangle implements IArea<Tile> {

    constructor(
        private readonly grid: Tiles
    ) {
        super(
            grid[0][0].pos,
            Vector.of(grid[0].length, grid.length),
        );
    }

    get(x: number, y: number) {
        const entry = this.grid[y];
        return entry ? entry[x] : null;
    }

    getAt(point: Vector) {
        const entry = this.grid[point.y];
        return entry ? entry[point.x] : null;
    }

    getRow(y: number): Tile[] | null {
        if (y < 0) {
            y = this.size.y + y;
        }

        return this.grid[y] || null;
    }

    getCol(x: number): Tile[] | null {
        if (x < 0) {
            x = this.size.x + x;
        }

        if (x < 0 || x >= this.size.x) {
            return null;
        }

        return this.grid.map(row => row[x]);
    }

    getRange(point: Vector, size: Vector): Area {
        const result: Tiles = [];

        for (let j = 0; j < size.y; j++) {
            result[j] = [];
            const row = this.grid[j + point.y];

            if (!row) {
                continue;
            }

            for (let i = 0; i < size.x; i++) {
                const tile = row[i + point.x];

                if (!tile) {
                    break;
                }

                result[j][i] = tile;
            }
        }

        return new Area(result);
    }

    getCorners(): Tile[] {
        return [
            notNull(this.getAt(Vector.ZERO)),
            notNull(this.get(this.width - 1, 0)),
            notNull(this.get(0, this.height - 1)),
            notNull(this.getAt(this.size.sustractValue(1))),
        ];
    }

    getClosestTo(point: Vector): Tile {
        const relative = point.sustract(this.pos);

        if (this.contains(point)) {
            return notNull(this.getAt(relative));
        }

        if (this.containsVertically(point)) {
            return notNull(this.get(relative.x, relative.y < 0 ? 0 : this.height - 1));
        }

        if (this.containsHorizontally(point)) {
            return notNull(this.get(relative.x < 0 ? 0 : this.width - 1, relative.y));
        }

        const corners = this.getCorners();
        return notNull(lowest(corners, corner => corner.pos.simpleDistance(point)));
    }

    getRangeFromRectangle(range: Rectangle): Area {
        return this.getRange(range.pos, range.size);
    }

    getNeighbor(tile: INode, direction: Side): Tile | null {
        const index = Vector.diff(tile.pos, this.pos);

        switch (direction) {
            case Side.NORTH:
            case Side.SOUTH:
                return this.get(index.x, index.y + (direction === Side.NORTH ? -1 : +1));

            case Side.EAST:
            case Side.WEST:
                return this.get(index.x + (direction === Side.WEST ? -1 : +1), index.y);

            default:
                throw new Error('WTF DUDE!');
        }
    }

    getAdjacent(tile: INode): Tile[] {
        const { x, y } = tile.pos.sustract(this.pos);

        return [
            this.get(x, y - 1),
            this.get(x - 1, y),
            this.get(x + 1, y),
            this.get(x, y + 1),
        ].filter(Boolean) as Tile[];
    }

    getDiagonals(tile: INode): Tile[] {
        const { x, y } = tile.pos.sustract(this.pos);

        return [
            this.get(x - 1, y - 1),
            this.get(x - 1, y + 1),
            this.get(x + 1, y - 1),
            this.get(x + 1, y + 1),
        ].filter(Boolean) as Tile[];
    }

    getNeighbors(tile: INode): Tile[] {
        return [
            ...this.getAdjacent(tile),
            ...this.getDiagonals(tile),
        ];
    }

    toWorkArea(filter?: (tile: Tile) => boolean): WorkArea {
        let list = ([] as Tile[]).concat(...this.grid);

        if (filter) {
            list = list.filter(filter);
        }

        return new WorkArea(list);
    }
}
