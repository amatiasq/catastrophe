import SetBuffer, { SetBufferChange } from '../../core/set-buffer';
import EntityState from '../entity/entity-state';
import TileState from '../tile/tile-state';

export default class StageState {
    readonly tiles = new SetBuffer<TileState>((id: string, props: any) => {
        return TileState.fromId(id, props.x, props.y) as TileState;
    });
    readonly entities = new SetBuffer<EntityState>((id: string, props: any) => {
        return EntityState.fromId(id) as EntityState;
    });
}

export interface StageStateChange {
    tile?: SetBufferChange<TileState>;
    entity?: SetBufferChange<EntityState>;
}
