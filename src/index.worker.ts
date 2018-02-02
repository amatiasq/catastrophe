import StageLogic from './components/stage/stage-logic';
import StageState from './components/stage/stage-state';
import MessageType from './core/message-type';
import WorkerMessaging from './core/worker-messaging';
import env from './env';

console.log('I\'m a worker');

const mainThread = new WorkerMessaging<MessageType>(self);
const state = new StageState();
const stage = new StageLogic(state, env, mainThread);

mainThread.addHandler(MessageType.BASIC, payload => {
    console.log('WORKER', payload);
    mainThread.send(MessageType.BASIC, { patata: 1 });
});

stage.start();

// We have to do this so FUCKING TYPESCRIPT doesn't FUCKING COMPLAIN!!!
export default 0;
