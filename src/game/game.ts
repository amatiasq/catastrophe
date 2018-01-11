import { bind } from 'bind-decorator';
import Vector from '../geometry/vector';
import Camera from './camera';
import Player from './player';
import Renderer from './renderer';
import Entity from './world/entity';
import Grid from './world/grid';

export default class Game {

    renderer: Renderer;
    player: Player;
    isRunning = false;
    grid = new Grid(Vector.of(32, 32), Vector.of(16, 16));
    camera = new Camera(Vector.ZERO, Vector.ZERO);
    entities = {} as { [index: string]: Entity[] };

    constructor(
        canvas: Canvas,
        background: Canvas,
        foreground: Canvas,
    ) {
        this.renderer = new Renderer(this, canvas, background, foreground);
        this.player = new Player(this, foreground);
    }

    start() {
        this.isRunning = true;
        this.onTick();
    }

    // pointToCoordinates(point: Vector, ceil = false) {
    //     return this.grid.pointToCoordinates(point, ceil);
    // }

    // areaToCoordinates(area: Rectangle) {
    //     return new Rectangle(
    //         this.grid.pointToCoordinates(area.pos),
    //         this.grid.pointToCoordinates(area.size, true),
    //     );
    // }

    getEntitiesAt(coords: Vector): Entity[] {
        const map = this.entities[coords.toString()];
        return map ? Object.values(map) : [];
    }

    getVisibleTiles() {
        return this.grid
            .getPositionsAt(this.camera)
            .map(coords => this.grid.getTileAt(coords));
    }

    getVisibleEntitiesByDepth(): Entity[] {
        return this.grid
            .getPositionsAt(this.camera)
            .reduce((result, coords) => {
                const entries = this.getEntitiesAt(coords);
                return entries.length ? result.concat(entries) : result;
            }, []);
    }

    @bind
    private onTick() {
        this.renderer.renderFrame();

        if (this.isRunning) {
            requestAnimationFrame(this.onTick);
        }
    }

}
