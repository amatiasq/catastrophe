import { bind } from 'bind-decorator';
import MessageType from '../../core/message-type';
import messageType from '../../core/message-type';
import Ticker from '../../core/ticker';
import { Coords, EnvironmentVariableProvider } from '../../core/types';
import WorkerMessaging from '../../core/worker-messaging';
import Vector from '../../geometry/vector';
import notNull from '../../meta/not-null';
import EntityLogic from '../entity/entity-logic';
import EntityState from '../entity/entity-state';
import MapLogic from '../map/map-logic';
import StageState from './stage-state';

export default class StageLogic {

    delta = 0;
    deltaSeconds = 0;

    // private readonly tasks = new Tasks();
    // private readonly grid = new Grid(
    //     this,
    //     Vector.of(this.getParam('MAP_SIZE'), this.getParam('MAP_SIZE')),
    //     this.getParam('DIAGONAL_MOVEMENT_COST'),
    // );
    // private readonly pathfinding = new Pathfinding(
    //     this.grid,
    //     new AStar<Tile>(this.getParam('CLOSER_MODIFIER')),
    //     this.getParam('CLUSTER_SIZE'),
    // );

    get isRunning()  {
        return this.ticker.isRunning;
    }

    private readonly entities = new WeakMap<EntityState, EntityLogic>();
    private readonly ticker = new Ticker(2, this.onTick);
    private readonly map = new MapLogic(
        this,
        Vector.of(this.getParam('MAP_SIZE'), this.getParam('MAP_SIZE')),
        this.getParam('DIAGONAL_MOVEMENT_COST'),
    );

    constructor(
        private readonly state: StageState,
        private readonly environment: EnvironmentVariableProvider,
        private readonly message: WorkerMessaging<MessageType>,
    ) {}

    getParam(key: string, type: 'string'): string;
    getParam(key: string, type?: 'number'): number;
    getParam(key: string, type: 'boolean'): boolean;
    getParam(key: string, type?: 'string' | 'number' | 'boolean') {
        return this.environment(key, type);
    }

    getTile({ x, y }: Coords) {
        return this.map.get(x, y);
    }

    getTileById(id: string) {
        const state = notNull(this.state.entities.get(id));
        return notNull(this.entities.get(state));
    }

    getEntityById(id: string) {
        const state = notNull(this.state.entities.get(id));
        return notNull(this.entities.get(state));
    }

    addEntity(state: EntityState) {
        this.state.entities.add(state);
        this.entities.set(state, new EntityLogic(this, state));
    }

    start() {
        this.ticker.start();
    }

    stop() {
        this.ticker.stop();
    }

    // addEntity(entity: Entity) {
    //     this.entities.add(entity);
    //     this.grid.addEntity(entity);
    //     this.tasks.addWorker(entity);
    // }

    // removeEntity(entity: Entity) {
    //     this.grid.removeEntity(entity);
    //     this.tasks.removeWorker(entity);
    // }

    // getEntitiesAt(coords: Vector): Entity[] {
    //     return [...notNull(this.grid.getAt(coords)).entities];
    // }

    // moveEntity(entity: Entity, target: Vector) {
    //     this.grid.moveEntity(entity, target);
    // }

    // isIdle(worker: WorkerEntity) {
    //     return this.tasks.isIdle(worker);
    // }

    // addIdleWorker(worker: WorkerEntity): any {
    //     return this.tasks.addWorker(worker);
    // }

    @bind
    private onTick(deltaTicks: number, seconds: number) {
        for (const entity of this.entities) {
            entity.update();
        }

        this.message.send(messageType.UPDATE, this.getChanges());
    }
    //     this.delta = deltaTicks;
    //     this.deltaSeconds = seconds;

    //     this.tasks.assignAll();

    //     for (const entity of this.entities) {
    //         entity.update(this.tasks);
    //     }

    //     this.tasks.applyChanges();
    //     this.pathfinding.clearCache();

    //     const { changedTiles } = this.grid;

    //     if (changedTiles.size) {
    //         changedTiles.forEach(tile => this.pathfinding.recalculate(tile));
    //         changedTiles.clear();
    //     }
    // }

}
