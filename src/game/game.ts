import { bind } from 'bind-decorator';
import Vector from '../geometry/vector';
import Camera from './camera';
import Player from './player';
import Renderer from './renderer';
import TaskManager from './tasks/index';
import Ticker from './ticker';
import Entity from './world/entity';
import Grid from './world/grid';

export default class Game {

    delta = 0;
    deltaSeconds = 0;
    tileSize = Vector.of(16, 16);

    player: Player;
    renderer: Renderer;
    tasks = new TaskManager();
    ticker = new Ticker(this.onTick);
    grid = new Grid(this, Vector.of(100, 100), this.tileSize);
    camera = new Camera(this, Vector.ZERO, Vector.ZERO);

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

    getEntitiesAt(coords: Vector): Entity[] {
        return [...this.grid.getTileAt(coords).entities];
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
    }

}
