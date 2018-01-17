import Color from '../../geometry/color';
import { TAU } from '../../geometry/math';
import Vector from '../../geometry/vector';
import Game from '../game';
import Sprite from '../sprite';
import TaskManager, { Task, TaskWorker } from '../tasks/index';
import Tile from './tile';

export default class Entity extends Sprite implements TaskWorker {

    task: Task | null = null;

    get tile() {
        return this.game.grid.getAt(this.pos);
    }
    set tile(value: Tile | null) {
        if (!value) {
            this.game.removeEntity(this);
        } else {
            this.game.moveEntity(this, value.pos);
        }
    }

    constructor(
        private readonly game: Game,
        pos: Vector,
    ) {
        super(pos);
    }

    assignTask(task: Task | null): void {
        this.task = task;
    }

    update(tasks: TaskManager): void {
        if (this.task) {
            this.task.step(this);
        }
    }

    _render(context: Renderer2D): void {
        const center = this.game.tileSize.divideValue(2);

        context.beginPath();
        context.strokeStyle = Color.GREEN.toString();
        context.arc(center.x, center.y, Math.min(center.x, center.y) - 3, 0, TAU);
        context.stroke();
        context.closePath();
    }

}