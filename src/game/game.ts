import { bind } from 'bind-decorator';
import Ticker from '../core/ticker';
import Vector from '../geometry/vector';
import notNull from '../meta/not-null';
import Camera from './camera';
import AStar from './pathfinding/a-star';
import { Pathfinding } from './pathfinding/pathfinding';
import Player from './player';
import Renderer from './renderer';
import TaskManager, { WorkerEntity } from './tasks/index';
import Entity from './world/entity';
import Grid from './world/grid';
import Tile from './world/tile';

export default class Game {

    delta = 0;
    deltaSeconds = 0;
    readonly player: Player;
    private readonly tileSize = Vector.of(this.getParam('TILE_SIZE'), this.getParam('TILE_SIZE'));

    readonly tasks = new TaskManager();
    readonly camera = new Camera(this, Vector.ZERO, Vector.ZERO);
    readonly grid = new Grid(
        this,
        Vector.of(this.getParam('MAP_SIZE'), this.getParam('MAP_SIZE')),
        this.tileSize,
        this.getParam('DIAGONAL_MOVEMENT_COST'),
    );
    readonly pathfinding = new Pathfinding(
        this.grid,
        new AStar<Tile>(this.getParam('CLOSER_MODIFIER')),
        this.getParam('CLUSTER_SIZE'),
    );

    private readonly renderer: Renderer;
    private readonly ticker = new Ticker(60, this.onTick);

    get isRunning()  {
        return this.ticker.isRunning;
    }

    constructor(
        private environment: EnvironmentVariableProvider,
        canvas: Canvas,
        background: Canvas,
        foreground: Canvas,
    ) {
        this.renderer = new Renderer(this, canvas, background, foreground);
        this.player = new Player(this, foreground);
    }

    getParam(key: string, type: 'string'): string;
    getParam(key: string, type?: 'number'): number;
    getParam(key: string, type: 'boolean'): boolean;
    getParam(key: string, type?: 'string' | 'number' | 'boolean') {
        return this.environment(key, type);
    }

    start() {
        this.ticker.start();
    }

    addEntity(entity: Entity) {
        this.grid.addEntity(entity);
        this.tasks.addWorker(entity);
    }

    removeEntity(entity: Entity) {
        this.grid.removeEntity(entity);
        this.tasks.removeWorker(entity);
    }

    getEntitiesAt(coords: Vector): Entity[] {
        return [...notNull(this.grid.getAt(coords)).entities];
    }

    moveEntity(entity: Entity, target: Vector) {
        this.grid.moveEntity(entity, target);
    }

    isIdle(worker: WorkerEntity) {
        return this.tasks.isIdle(worker);
    }

    addIdleWorker(worker: WorkerEntity): any {
        return this.tasks.addWorker(worker);
    }

    getVisibleTiles() {
        return this.camera.getVisibleTiles();
    }

    @bind
    private onTick(delta: number, seconds: number) {
        this.delta = delta;
        this.deltaSeconds = seconds;

        this.tasks.assignAll();

        for (const entity of this.camera.getVisibleEntities()) {
            entity.update(this.tasks);
        }

        this.tasks.applyChanges();
        this.renderer.renderFrame();
        this.pathfinding.clearCache();

        const { changedTiles } = this.grid;

        if (changedTiles.size) {
            changedTiles.forEach(tile => this.pathfinding.recalculate(tile));
            changedTiles.clear();
        }
    }

}

type EnvironmentVariableProvider = (key: string, type?: 'string' | 'number' | 'boolean') => string | number | boolean;
