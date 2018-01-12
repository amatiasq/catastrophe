import Entity from '../world/entity';

export default class TaskManager {
    protected tasks = [] as Array<Task>;
    protected idles = new Set<TaskWorker>();

    get hasJobs(): boolean {
        return Boolean(this.tasks.length);
    }

    get hasWorkers(): boolean {
        return Boolean(this.idles.size);
    }

    addIdle(worker: TaskWorker): void {
        this.idles.add(worker);
    }

    addTask(task: Task): void {
        // TODO: usar un heap
        let i;

        for (i = 0; i < this.tasks.length; i++) {
            if (this.tasks[i].priority < task.priority) {
                break;
            }
        }

        this.tasks.splice(i, 0, task);
    }

    assign() {
        if (!this.hasJobs || !this.hasWorkers) {
            return;
        }

        const remove = new Set<Task>();

        for (const task of this.tasks) {
            let chosen;
            let bestValidity = 0;

            for (const worker of this.idles) {
                const validity = task.isValidWorker(worker);

                if (validity > bestValidity) {
                    chosen = worker;
                    bestValidity = validity;
                }
            }

            if (chosen) {
                task.assign(chosen);
                chosen.assignTask(task);
                this.idles.delete(chosen);
                remove.add(task);
            }
        }

        this.tasks = this.tasks.filter(task => !remove.has(task));

        if (!this.tasks.length) {
            return;
        }

        const message = this.tasks.map(task => task.toString());
        console.log(`No one can:\n\t${message.join('\n\t')}`);
    }
}

export interface Task {
    priority: number;
    readonly isCompleted: boolean;

    // Should return a value between 1 and 0.
    // 1 means the best worker for the job
    // 0 means he can't do it
    isValidWorker(worker: TaskWorker): number;

    assign(worker: TaskWorker): void;
    step(worker: TaskWorker): void;
}

export interface TaskWorker extends Entity {
    assignTask(task: Task): void;
    update(tasks: TaskManager): void;
}
