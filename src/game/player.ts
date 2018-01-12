import { bind } from 'bind-decorator';
import Rectangle from '../geometry/rectangle';
import Vector from '../geometry/vector';
import Game from './game';
import TaskWallBuild from './tasks/wall-build';
import Tile from './world/tile';

export default class Player {

    private dragStart: Vector = null;
    private isDragging = false;

    constructor(
        private game: Game,
        private element: HTMLElement,
    ) {
        element.addEventListener('mousedown', this.onMouseDown);
        element.addEventListener('mouseup', this.onMouseUp);
    }

    onClick(event: MouseEvent, point = Vector.from(event)) {
        const { grid, tasks } = this.game;
        const coords = grid.getCoordsFromPoint(point);

        tasks.addTask(new TaskWallBuild(this.game, new Rectangle(coords, Vector.ONE)));

        // const { grid } = this.game;
        // const tile = grid.getTileAt();
        // tile.isEnabled = !tile.isEnabled;
    }

    onDragEnd(area: Rectangle) {
        const { grid, tasks } = this.game;
        tasks.addTask(new TaskWallBuild(this.game, grid.getCoordsFromArea(area)));
    }

    @bind
    private onMouseDown(event: MouseEvent) {
        this.element.addEventListener('mousemove', this.onMouseMove);

        this.dragStart = Vector.from(event);
        this.isDragging = false;
    }

    @bind
    private onMouseUp(event: MouseEvent) {
        this.element.removeEventListener('mousemove', this.onMouseMove);

        const end = Vector.from(event);
        const area = new Rectangle(this.dragStart, end.sustract(this.dragStart));
        this.dragStart = null;

        if (this.isDragging) {
            this.resetHover();
            this.onDragEnd(area);
        } else {
            this.onClick(event, end);
        }
    }

    @bind
    private onMouseMove(event: MouseEvent) {
        this.isDragging = true;
        this.resetHover();

        const end = Vector.from(event);
        const area = new Rectangle(this.dragStart, end.sustract(this.dragStart));

        for (const tile of this.getTilesAtCoords(area)) {
            tile.isHover = true;
        }
    }

    private resetHover() {
        for (const tile of this.game.grid.getAllTiles()) {
            tile.isHover = false;
        }
    }

    private getTilesAtCoords(area: Rectangle): Tile[] {
        const { grid } = this.game;
        const result = [];

        for (const coords of grid.getCoordsFromArea(area)) {
            result.push(grid.getTileAt(coords));
        }

        return result;
    }

}