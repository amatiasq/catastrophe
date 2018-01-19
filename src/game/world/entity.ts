import Color from '../../geometry/color';
import { TAU } from '../../geometry/math';
import Vector from '../../geometry/vector';
import notNull from '../../meta/not-null';
import Game from '../game';
import Sprite from '../sprite';
import TaskManager, { Task, Worker } from '../tasks/index';
import Tile from './tile';
import Walk from './walk';

export default class Entity extends Sprite implements Worker {

    private walking: Walk | null = null;

    get isIdle(): boolean {
        return this.game.tasks.isIdle(this);
    }

    get tile() {
        return this.game.grid.getAt(this.pos);
    }
    set tile(value: Tile | null) {
        if (value === this.tile) {
            return;
        }

        if (!value) {
            this.game.removeEntity(this);
        } else {
            this.game.moveEntity(this, value.pos);
        }
    }

    private _task: Task | null = null;
    get task() {
        return this._task;
    }
    set task(value: Task | null) {
        if (value === this._task) {
            return;
        }

        this._task = value;

        if (!value) {
            this.walking = null;
            this.game.tasks.addWorker(this);
            return;
        }

        const target = value.getTargetForWorker(this);

        if (!target || target === this.tile) {
            this.walking = null;
            return;
        }

        this.walking = new Walk(this.game, this, target);
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
        if (this.walk()) {
            return;
        }

        this.work();
    }

    protected walk() {
        const { walking } = this;

        if (!walking) {
            return false;
        }

        if (!walking.isValid) {
            // This will happen if suddently we can't reach our task
            this.walking = null;
            this.task = null;
            return false;
        }

        if (walking.step()) {
            this.walking = null;
        }

        return true;
    }

    protected work() {
        const { task } = this;

        if (!task) {
            return false;
        }

        if (task.step(this)) {
            this.task = null;
        }

        return true;
    }

    _render(context: Renderer2D): void {
        if (this.walking) {
            if (this.walking.isValid) {
                this.walking.render(context);
            } else {
                // This will happen if suddently we can't reach our task
                this.walking = null;
                this.task = null;
            }
        }

        const { center: { x, y }, view: { width, height }} = notNull(this.tile);

        context.beginPath();
        context.fillStyle = Color.GREEN.toString();
        context.strokeStyle = Color.GREEN.toString();
        context.arc(x, y, Math.min(width / 2, height / 2) - 3, 0, TAU);
        context.fill();
        context.stroke();
        context.closePath();
    }

}
