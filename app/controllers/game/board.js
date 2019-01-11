import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  gameState: service(),

  actions: {
    completeMove() {
      if (this.get('gameState.isPlayerMove')) {
        this.get('gameState').completeMove();
      }
    },
    manualSync() {
      this.get('gameState').syncState();
    }
  }
});
