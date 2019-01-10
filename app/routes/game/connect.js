import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  connectionService: service(),
  gameState: service(),
  model(data) {
    this.get('connectionService').on('connected', () => {
      this.transitionTo('game.board');
    })
    this.get('connectionService').connect(data.id);
  }
});
