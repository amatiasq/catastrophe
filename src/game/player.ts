import { bind } from 'bind-decorator';
import Rectangle from '../geometry/rectangle';
import Vector from '../geometry/vector';
import notNull from '../meta/not-null';
import Game from './game';
import Tile from './world/tile';

export default class Player {

    private dragStart: Vector | null = null;
    private isDragging = false;

    constructor(
        private game: Game,
        private element: HTMLElement,
    ) {
        element.addEventListener('mousedown', this.onMouseDown);
        element.addEventListener('mouseup', this.onMouseUp);
    }

    get task() {
        return (window as any).tool.class;
    }

    onClick(event: MouseEvent, point = Vector.from(event)) {
        const { grid, tasks } = this.game;
        const coords = grid.getCoordsFromPoint(point);

        tasks.addTask(new this.task(this.game, grid.getRange(coords, Vector.ONE)));
    }

    onDragEnd(area: Rectangle) {
        const { grid, tasks } = this.game;
        const rectangle = grid.getCoordsFromArea(area);
        const range = grid.getRangeFromRectangle(rectangle);

        tasks.addTask(new this.task(this.game, range));
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

        const start = notNull(this.dragStart);
        const end = Vector.from(event);
        const area = new Rectangle(start, end.sustract(start));
        this.dragStart = null;

        if (this.isDragging && !area.size.isZero) {
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

        const start = notNull(this.dragStart);
        const end = Vector.from(event);
        const area = new Rectangle(start, end.sustract(start));

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
        const result: Tile[] = [];

        for (const coords of grid.getCoordsFromArea(area)) {
            const tile = grid.getAt(coords);

            if (tile) {
                result.push(tile);
            }
        }

        return result;
    }

}
