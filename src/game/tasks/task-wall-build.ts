import Game from '../game';
import Area from '../world/area';
import Tile from '../world/tile';
import AreaWork from './area-work';

export default class TaskWallBuild extends AreaWork {

    protected readonly TICKS_PER_TILE = this.game.getParam('BUILD_WALL_TICKS_PER_WALL');

    constructor(game: Game, area: Area) {
        super(game, area.toWorkArea(tile => !tile.isEnabled));
    }

    protected onTileCompleted(tile: Tile) {
        tile.isEnabled = true;
    }

}
