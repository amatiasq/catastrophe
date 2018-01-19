import { DEMOLISH_WALL_SECONDS_PER_WALL, TICKS_PER_SECOND } from '../../constants';
import Game from '../game';
import Area from '../world/area';
import Tile from '../world/tile';
import AreaWork from './area-work';

export default class TaskWallBuild extends AreaWork {

    protected TICKS_PER_TILE = DEMOLISH_WALL_SECONDS_PER_WALL * TICKS_PER_SECOND;

    constructor(game: Game, area: Area) {
        super(game, area.toWorkArea(tile => tile.isEnabled));
    }

    protected onTileCompleted(tile: Tile) {
        tile.isEnabled = false;
    }

}
