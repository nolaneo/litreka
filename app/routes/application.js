import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  connectionService: service(),
  gameState: service(),

  beforeModel(transition) {
    window.LitrekaRoute = this;
    this.get('connectionService').initialize();
    this.get('gameState').initReceiver();
    this.get('connectionService').on('connected', () => {
      this.get('gameState').initialize();
    })
    if (transition.intent.url == "/") {
      this.transitionTo('game.waiting');
    }
  }
});
