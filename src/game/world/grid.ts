import Rectangle from '../../geometry/rectangle';
import Vector from '../../geometry/vector';
import Game from '../game';
import Entity from './entity';
import Tile from './tile';

export default class Grid {

    private all: Tile[] = [];
    private tiles: Tiles = [];
    private allEntities: Entity[] = [];
    private area = new Rectangle(Vector.ZERO, this.size);

    constructor(
        private game: Game,
        public size: Vector,
        public tileSize: Vector
    ) {
        let row: Tile[] = null;

        for (const coords of this.size) {
            if (coords.x === 0) {
                if (row) {
                    this.all.push(...row);
                }

                row = this.tiles[coords.y] = [];
            }

            row[coords.x] = new Tile(this.game, coords, tileSize);
        }
    }

    addEntity(entity: Entity) {
        const tile = this.getTileAt(entity.pos);
        tile.entities.add(entity);
        this.allEntities.push(entity);
    }

    moveEntity(entity: Entity, target: Vector) {
        const oldTile = this.getTileAt(entity.pos);

        if (oldTile) {
            oldTile.entities.delete(entity);
        }

        entity.pos = target;
        this.addEntity(entity);
    }

    getAllEntities() {
        return this.allEntities;
    }

    getAllTiles() {
        return this.all;
    }

    getTileAt(coords: Vector) {
        return this.tiles[coords.y][coords.x];
    }

    getTilesAt(area: Rectangle) {
        const tiles: Tile[] = [];

        for (const coords of area) {
            tiles.push(this.getTileAt(coords));
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

export type Tiles = Tile[][];
