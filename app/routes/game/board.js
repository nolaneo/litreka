import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  gameState: service(),
  connectionService: service(),

  beforeModel() {
    if (this.get('connectionService.isNotConnected')) {
      this.transitionTo('game.waiting');
    }
  }
});
