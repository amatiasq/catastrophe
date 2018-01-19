import Rectangle from '../../geometry/rectangle';
import Vector from '../../geometry/vector';
import notNull from '../../meta/not-null';
import Game from '../game';
import Area from './area';
import Entity from './entity';
import Tile from './tile';

export default class Grid extends Area {

    private all: Tile[];
    private allEntities: Set<Entity>;
    private area: Rectangle;
    private tileSize: Vector;
    public size: Vector;

    constructor(
        game: Game,
        size: Vector,
        tileSize: Vector,
        diagonalMovementCost: number,
    ) {
        const tiles: Tiles = [];
        let row: Tile[] = [];

        for (const coords of size) {
            if (coords.x === 0) {
                row = tiles[coords.y] = [];
            }

            const tile = new Tile(game, coords, tileSize, diagonalMovementCost);
            tile.onChange = () => game.pathfinding.recalculate(tile);
            row[coords.x] = tile;
        }

        super(tiles);

        this.all = ([] as Tile[]).concat(...tiles);
        this.allEntities = new Set();
        this.area = new Rectangle(Vector.ZERO, size);
        this.tileSize = tileSize;
        this.size = size;
    }

    addEntity(entity: Entity) {
        const tile = notNull(this.getAt(entity.pos));
        tile.entities.add(entity);
        this.allEntities.add(entity);
    }

    removeEntity(entity: Entity) {
        const tile = notNull(this.getAt(entity.pos));
        tile.entities.delete(entity);
        this.allEntities.delete(entity);
    }

    moveEntity(entity: Entity, target: Vector) {
        const oldTile = this.getAt(entity.pos);

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

    getTilesAt(area: Rectangle) {
        const tiles: Tile[] = [];

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

export type Tiles = Tile[][];
