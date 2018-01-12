import Color from '../../geometry/color';
import { TAU } from '../../geometry/math';
import Game from '../game';
import Sprite from '../sprite';
import TaskManager, { Task, TaskWorker } from '../tasks/index';

export default class Entity extends Sprite implements TaskWorker {

    task: Task;

    assignTask(task: Task): void {
        this.task = task;
    }

    update(tasks: TaskManager): void {
        if (this.task) {
            this.task.step(this);
        }
    }

    _render(context: Renderer2D, game: Game): void {
        const center = game.tileSize.divideValue(2);

        context.beginPath();
        context.strokeStyle = Color.GREEN.toString();
        context.arc(center.x, center.y, Math.min(center.x, center.y) - 3, 0, TAU);
        context.stroke();
        context.closePath();
    }

}