import { bind } from 'bind-decorator';

const MILLISECONDS_PER_SECOND = 1000;
const FRAMES_PER_SECOND = 60;
const MILLISECONDS_PER_FRAME = MILLISECONDS_PER_SECOND / FRAMES_PER_SECOND;

export default class Ticker {

    public isRunning = false;
    private lastFrameTime = 0;

    constructor(
        private onTick: OnTickCallback,
    ) {}

    start() {
        this.isRunning = true;
        this.tick();
    }

    stop() {
        this.isRunning = false;
    }

    @bind
    tick() {
        const now = Date.now();
        let delta = 1;
        let seconds = MILLISECONDS_PER_FRAME / MILLISECONDS_PER_SECOND;

        if (this.lastFrameTime !== 0) {
            const millisecondsDelta = now - this.lastFrameTime;
            delta = millisecondsDelta / MILLISECONDS_PER_FRAME;
            seconds = millisecondsDelta / 1000;
        }

        this.onTick(delta, seconds);

        this.lastFrameTime = now;

        if (this.isRunning) {
            requestAnimationFrame(this.tick);
        }

    }
}

type OnTickCallback = (delta: number, seconds: number) => void;