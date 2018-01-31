import Entity from '../world/entity';
import Tile from '../world/tile';

export default class TaskManager {
    private readonly tasks: Task[] = [];
    private readonly idles = new Set<WorkerEntity>();

    get hasJobs(): boolean {
        return Boolean(this.tasks.length);
    }

    get hasWorkers(): boolean {
        return Boolean(this.idles.size);
    }

    addWorker(worker: WorkerEntity): void {
        this.idles.add(worker);
    }

    removeWorker(worker: WorkerEntity) {
        this.idles.delete(worker);
    }

    isIdle(worker: WorkerEntity) {
        return this.idles.has(worker);
    }

    addTask(task: Task): void {
        // TODO: usar un heap
        const index = getInsertionIndex(this.tasks, task, (entry) => entry.priority);
        this.tasks.splice(index, 0, task);
    }

    removeTask(task: Task) {
        const index = this.tasks.indexOf(task);
        this.tasks.splice(index, 1);
    }

    assign(task: Task, worker: WorkerEntity) {
        worker.task = task;
        this.removeWorker(worker);
    }

    assignAll() {
        if (!this.hasJobs || !this.hasWorkers) {
            return;
        }

        const abandoned: Task[] = [];

        for (const task of this.tasks) {
            const validities: number[] = [];
            const workers: WorkerEntity[] = [];

            if (task.isCompleted) {
                this.removeTask(task);
                continue;
            }

            if (!task.needsWorkers()) {
                continue;
            }

            for (const worker of this.idles) {
                const validity = task.isValidWorker(worker);

                if (validity > 0) {
                    // TODO: We need a { validity, worker } array sorted by validity
                    // rooom for optimization here
                    const index = getInsertionIndex(validities, validity, identity);
                    validities.splice(index, 0, validity);
                    workers.splice(index, 0, worker);
                }
            }

            if (!validities.length) {
                abandoned.push(task);
                continue;
            }

            for (let i = 0; i < validities.length; i++) {
                const worker = workers[i];

                if (task.needsWorkers()) {
                    this.assign(task, worker);
                }
            }
        }

        if (abandoned.length) {
            console.log(`No one can:\n\t${abandoned.join('\n\t')}`);
        }
    }

    applyChanges(): void {
        for (const task of this.tasks) {
            task.apply();
        }
    }

    [Symbol.iterator]() {
        return this.tasks[Symbol.iterator]();
    }

}

export interface Task {
    priority: number;
    readonly isCompleted: boolean;

    // Should return a value between 1 and 0.
    // 1 means the best worker for the job
    // 0 means he can't do it
    isValidWorker(worker: WorkerEntity): number;
    needsWorkers(): boolean;
    getTargetForWorker(worker: WorkerEntity): Tile;
    step(worker: WorkerEntity): boolean;
    apply(): void;
}

export interface WorkerEntity extends Entity {
    tile: Tile | null;
    assignTask(task: Task | null): void;
    update(tasks: TaskManager): void;
}

function getInsertionIndex<T>(array: T[], entry: T, getter: (value: T) => number) {
    const value = getter(entry);

    for (let i = 0; i < array.length; i++) {
        if (getter(array[i]) < value) {
            return i;
        }
    }

    return array.length;
}

function identity<T>(value: T): T {
    return value;
}
