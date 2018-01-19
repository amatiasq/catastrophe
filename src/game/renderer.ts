import { bind } from 'bind-decorator';
import Vector from '../geometry/vector';
import notNull from '../meta/not-null';
import Camera from './camera';
import Game from './game';

export default class Renderer {
    scale = 1;
    size = Vector.ZERO;
    camera: Camera;
    readonly context: Renderer2D;
    readonly background: Renderer2D;
    readonly foreground: Renderer2D;
    private shouldUpdateSize = false;

    constructor(
        private game: Game,
        private canvas: Canvas,
        private backcanvas: Canvas,
        private forecanvas: Canvas,
    ) {
        this.camera = game.camera;
        this.context = notNull(canvas.getContext('2d'));
        this.background = notNull(backcanvas.getContext('2d'));
        this.foreground = notNull(forecanvas.getContext('2d'));

        window.addEventListener('resize', this.onResize);
        this.onResize();
    }

    renderFrame() {
        if (this.shouldUpdateSize) {
            this.fillScreen();
        } else {
            this.clear(this.context);
        }

        this.context.save();
        // this.setCameraView(this.context);
        // this.drawAnimatedTiles();

        if (this.game.isRunning) {
            // this.drawSelectedCell();
            // this.drawTargetCell();
        }

        const tiles = this.game.getVisibleTiles();

        tiles.forEach(tile => tile.renderTile(this.background));
        tiles.forEach(tile => tile.renderEntities(this.context));

        // this.drawOccupiedCells();
        // this.drawPathingCells();
        // this.drawCombatInfo();
        // this.drawHighTiles(this.context);
        this.context.restore();
    }

    clear(context: Renderer2D) {
        context.clearRect(0, 0, this.size.x, this.size.y);
    }

    setCameraView(context: Renderer2D) {
        context.translate(-this.camera.x * this.scale, -this.camera.y * this.scale);
    }

    fillScreen() {
        this.size = Vector.from(window, 'innerWidth', 'innerHeight');
        this.size.to(this.camera, 'width', 'height');
        this.size.to(this.canvas, 'width', 'height');
        this.size.to(this.backcanvas, 'width', 'height');
        this.size.to(this.forecanvas, 'width', 'height');
        this.shouldUpdateSize = false;
    }

    @bind
    private onResize() {
        this.shouldUpdateSize = true;
    }
}
