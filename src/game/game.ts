import { bind } from 'bind-decorator';
import { CLOSER_MODIFIER, CLUSTER_SIZE, DIAGONAL_MOVEMENT_COST, MAP_SIZE, TILE_SIZE } from '../constants';
import Vector from '../geometry/vector';
import notNull from '../meta/not-null';
import Camera from './camera';
import AStar from './pathfinding/a-star';
import { Pathfinding } from './pathfinding/pathfinding';
import Player from './player';
import Renderer from './renderer';
import TaskManager from './tasks/index';
import Ticker from './ticker';
import Entity from './world/entity';
import Grid from './world/grid';
import Tile from './world/tile';

export default class Game {

    delta = 0;
    deltaSeconds = 0;
    tileSize = Vector.of(TILE_SIZE, TILE_SIZE);

    player: Player;
    renderer: Renderer;
    tasks = new TaskManager();
    ticker = new Ticker(this.onTick);
    grid = new Grid(this, Vector.of(MAP_SIZE, MAP_SIZE), this.tileSize, DIAGONAL_MOVEMENT_COST);
    camera = new Camera(this, Vector.ZERO, Vector.ZERO);
    pathfinding = new Pathfinding(
        this.grid,
        new AStar<Tile>(CLOSER_MODIFIER),
        CLUSTER_SIZE
    );

    get isRunning()  {
        return this.ticker.isRunning;
    }

    constructor(
        canvas: Canvas,
        background: Canvas,
        foreground: Canvas,
    ) {
        this.renderer = new Renderer(this, canvas, background, foreground);
        this.player = new Player(this, foreground);
    }

    start() {
        this.ticker.start();
    }

    addEntity(entity: Entity) {
        this.grid.addEntity(entity);
        this.tasks.addIdle(entity);
    }

    removeEntity(entity: Entity) {
        this.grid.removeEntity(entity);
        this.tasks.removeIdle(entity);
    }

    getEntitiesAt(coords: Vector): Entity[] {
        return [...notNull(this.grid.getAt(coords)).entities];
    }

    moveEntity(entity: Entity, target: Vector) {
        this.grid.moveEntity(entity, target);
    }

    getVisibleTiles() {
        return this.camera.getVisibleTiles();
    }

    @bind
    private onTick(delta: number, seconds: number) {
        this.delta = delta;
        this.deltaSeconds = seconds;

        for (const entity of this.grid.getAllEntities()) {
            if (!entity.task) {
                this.tasks.addIdle(entity);
            }
        }

        this.tasks.assign();

        for (const entity of this.camera.getVisibleEntities()) {
            entity.update(this.tasks);
        }

        this.renderer.renderFrame();
        this.pathfinding.clearCache();
    }

}
