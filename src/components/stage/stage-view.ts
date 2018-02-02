import { bind } from 'bind-decorator';
import MessageType from '../../core/message-type';
import { Coords, EnvironmentVariableProvider } from '../../core/types';
import WorkerMessaging from '../../core/worker-messaging';
import Vector from '../../geometry/vector';
import TileState from '../tile/tile-state';
import TileView from '../tile/tile-view';
import StageState, { StageStateChange } from './stage-state';

export default class StageView {

    private readonly halfTileSize = this.tileSize.divideValue(2);
    private readonly tiles: TileView[][] = [];

    constructor(
        private readonly state: StageState,
        private readonly environment: EnvironmentVariableProvider,
        private readonly message: WorkerMessaging<MessageType>,
        private readonly tileSize: Vector,
    ) {
        const { tiles } = this;

        this.state.tile.forEach(tile => {
            const { x, y } = tile;

            if (!tiles[y]) {
                tiles[y] = [];
            }

            tiles[y][x] = new TileView(tile, tileSize);
        });

        message.send(MessageType.HAND_SHAKE, null);
        message.addHandler(MessageType.UPDATE, this.onUpdate);
    }

    getParam(key: string, type: 'string'): string;
    getParam(key: string, type?: 'number'): number;
    getParam(key: string, type: 'boolean'): boolean;
    getParam(key: string, type?: 'string' | 'number' | 'boolean') {
        return this.environment(key, type);
    }

    getTileCenter(tile: TileState) {
        return this.tileSize.multiply(tile).add(this.halfTileSize);
    }

    getTile({ x, y }: Coords) {
        return this.tiles[y][x] || null;
    }

    @bind
    onUpdate(changes: StageStateChange) {
        this.state.apply(changes);
        this.render();
    }

    render() {
        this.state.entity.forEach(entity => entity.render
    }

}
