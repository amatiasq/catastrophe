import { Coords } from '../../core/types';
import notNull from '../../meta/not-null';
import StageLogic from '../stage/stage-logic';
import TileLogic from '../tile/tile-logic';
import EntityState from './entity-state';

export default class EntityLogic {

    get tile() {
        return notNull(this.stage.getTile(this.state));
    }

    set tile(value: TileLogic) {
        this.moveTo(value.state);
    }

    constructor(
        private readonly stage: StageLogic,
        public readonly state: EntityState,
    ) {}

    moveTo({ x, y }: Coords) {
        this.state.x = x;
        this.state.y = y;
    }

    update() {

    }


    // extends Sprite implements WorkerEntity {
    // private walking: Walk | null = null;

    // get isIdle(): boolean {
    //     return this.game.isIdle(this);
    // }

    // get tile() {
    //     return this.game.grid.getAt(this.pos);
    // }
    // set tile(value: Tile | null) {
    //     if (value === this.tile) {
    //         return;
    //     }

    //     if (!value) {
    //         this.game.removeEntity(this);
    //     } else {
    //         this.game.moveEntity(this, value.pos);
    //     }
    // }

    // private _task: Task | null = null;
    // get task() {
    //     return this._task;
    // }
    // set task(value: Task | null) {
    //     if (value === this._task) {
    //         return;
    //     }

    //     this._task = value;

    //     if (!value) {
    //         this.walking = null;
    //         this.game.addIdleWorker(this);
    //         return;
    //     }

    //     const target = value.getTargetForWorker(this);

    //     if (!target || target === this.tile) {
    //         this.walking = null;
    //         return;
    //     }

    //     this.walking = new Walk(this.game, this, target);
    // }

    // constructor(
    //     private readonly game: Game,
    //     pos: Vector,
    // ) {
    //     super(pos);
    // }

    // assignTask(task: Task | null): void {
    //     this.task = task;
    // }

    // update(tasks: TaskManager): void {
    //     if (this.walk()) {
    //         return;
    //     }

    //     this.work();
    // }

    // protected walk() {
    //     const { walking } = this;

    //     if (!walking) {
    //         return false;
    //     }

    //     if (!walking.isValid) {
    //         // This will happen if suddently we can't reach our task
    //         this.walking = null;
    //         this.task = null;
    //         return false;
    //     }

    //     if (walking.step()) {
    //         this.walking = null;
    //     }

    //     return true;
    // }

    // protected work() {
    //     const { task } = this;

    //     if (!task) {
    //         return false;
    //     }

    //     if (task.step(this)) {
    //         this.task = null;
    //     }

    //     return true;
    // }

}
