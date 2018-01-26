import { TEST_ENTITIES } from '../constants';
import Game from '../game/game';
import Entity from '../game/world/entity';
import Vector from '../geometry/vector';

const game = new Game(
  document.getElementById('entities') as Canvas,
  document.getElementById('background') as Canvas,
  document.getElementById('foreground') as Canvas,
);

for (let i = 0; i < TEST_ENTITIES; i++) {
  game.addEntity(new Entity(game, Vector.random(game.grid.size.sustractValue(1))));
}

game.start();

export default game;
