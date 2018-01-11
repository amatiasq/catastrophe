import Rectangle from '../../geometry/rectangle';
import Vector from '../../geometry/vector';
import Tile from './tile';

export default class Grid {

    private tiles = {} as { [id: string]: Tile };

    constructor(
        public size: Vector,
        public tileSize: Vector
    ) {
        for (const coords of this.size) {
            this.tiles[coords.toString()] = new Tile(coords.multiply(tileSize), tileSize, coords);
        }
    }

    getAllTiles() {
        return Object.values(this.tiles);
    }

    getTileAt(coords: Vector) {
        return this.tiles[coords.toString()];
    }

    pointToCoordinates(point: Vector, ceil = false) {
        return point.divide(this.tileSize).map(ceil ? Math.ceil : Math.floor);
    }

    getPositionsAt(range: Rectangle) {
        const start = range.pos.divide(this.tileSize).map(Math.floor);
        const end = range.end.divide(this.tileSize).map(Math.ceil).clamp(this.size);

        // console.log(`getPositionsAt(${range}) => ${start}, ${end}`)
        return Vector.iterate(start, end);
    }

}