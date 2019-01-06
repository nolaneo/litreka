import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  gameState: service(),
  beforeModel() {
    this.get('gameState').initialize();
  }
});
