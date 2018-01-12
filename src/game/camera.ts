import Rectangle from '../geometry/rectangle';
import Vector from '../geometry/vector';
import Game from './game';
import Entity from './world/entity';

export default class Camera extends Rectangle {

    constructor(
        private game: Game,
        pos: Vector,
        size: Vector,
    ) {
        super(pos, size);
    }

    getVisibleTiles() {
        const { grid } = this.game;
        return grid.getTilesAt(grid.getCoordsFromArea(this));
    }

    getVisibleEntities(): Entity[] {
        const result: Entity[] = [];

        for (const tile of this.getVisibleTiles()) {
            const { entities } = tile;

            if (entities.size) {
                result.push(...entities);
            }
        }

        return result;
    }

}
