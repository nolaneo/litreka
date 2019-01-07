import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  gameState: service(),

  actions: {
    completeMove() {
      this.get('gameState').completeMove();
    }
  }
});
