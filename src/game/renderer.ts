import { bind } from 'bind-decorator';
import Vector from '../geometry/vector';
import Camera from './camera';
import Game from './game';

export default class Renderer {
    scale = 1;
    size = Vector.ZERO;
    camera: Camera;
    context: Renderer2D;
    background: Renderer2D;
    foreground: Renderer2D;
    private shouldUpdateSize = false;

    constructor(
        private game: Game,
        private canvas: Canvas,
        private backcanvas: Canvas,
        private forecanvas: Canvas,
    ) {
        this.camera = game.camera;
        this.context = canvas.getContext('2d');
        this.background = backcanvas.getContext('2d');
        this.foreground = forecanvas.getContext('2d');

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

        // this.drawOccupiedCells();
        // this.drawPathingCells();
        this.drawTiles();
        this.drawEntities();
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

    drawTiles() {
        for (const tile of this.game.getVisibleTiles()) {
            tile.render(this.background, this, this.game);
        }
    }

    drawEntities() {
        for (const entity of this.game.getVisibleEntitiesByDepth()) {
            entity.render(this.context, this, this.game);
        }
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
