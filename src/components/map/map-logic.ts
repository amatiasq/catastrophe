import Area, { Tiles } from '../../game/world/area';
import Rectangle from '../../geometry/rectangle';
import Vector from '../../geometry/vector';
import StageLogic from '../stage/stage-logic';
import TileLogic from '../tile/tile-logic';
import TileState from '../tile/tile-state';

export default class MapLogic extends Area {

    readonly size: Vector;
    private readonly all: TileLogic[];
    private readonly tiles:
    private readonly area: Rectangle;
    private readonly tileSize: Vector;

    constructor(
        stage: StageLogic,
        size: Vector,
        diagonalMovementCost: number,
    ) {
        const tiles: Tiles = [];
        let row: TileLogic[] = [];

        for (const coords of size) {
            if (coords.x === 0) {
                row = tiles[coords.y] = [];
            }

            const state = new TileState(coords.x, coords.y);
            const tile = new TileLogic(stage, state, diagonalMovementCost);
            row[coords.x] = tile;
        }

        super(tiles);

        this.size = size;
        this.all = ([] as TileLogic[]).concat(...tiles);
        this.area = new Rectangle(Vector.ZERO, size);
    }

    getAllTiles() {
        return this.all;
    }

    getTilesAt(area: Rectangle) {
        const tiles: TileLogic[] = [];

        for (const coords of area) {
            const tile = this.getAt(coords);

            if (tile) {
                tiles.push(tile);
            }
        }

        return tiles;
    }

    getCoordsFromPoint(point: Vector, ceil = false) {
        return point.divide(this.tileSize).map(ceil ? Math.ceil : Math.floor);
    }

    getCoordsFromArea(range: Rectangle): Rectangle {
        const start = this.getCoordsFromPoint(range.pos);
        const trim = start.multiply(this.tileSize);
        const size = this.getCoordsFromPoint(range.end.sustract(trim), true);
        const result = new Rectangle(start, size);

        result.clamp(this.area);
        return result;
    }

}
