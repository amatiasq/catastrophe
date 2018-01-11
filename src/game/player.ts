import { bind } from 'bind-decorator';
import Rectangle from '../geometry/rectangle';
import Vector from '../geometry/vector';
import Game from './game';

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
        const { grid } = this.game;
        const tile = grid.getTileAt(grid.pointToCoordinates(point));
        tile.isEnabled = !tile.isEnabled;
    }

    onDragEnd(area: Rectangle) {
        this.resetHover();

        for (const tile of this.getTilesAtCoords(area)) {
            tile.isEnabled = !tile.isEnabled;
        }
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

    private getTilesAtCoords(area: Rectangle) {
        const { grid } = this.game;

        return grid
            .getPositionsAt(area)
            .map(coords => grid.getTileAt(coords));
    }

}