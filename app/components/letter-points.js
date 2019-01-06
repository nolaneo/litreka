import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  classNames: ['letter-score'],

  gameState: service(),

  didInsertElement() {
    this.set('points', this.get('gameState').letterPoints(this.get('letter').toLowerCase()));
  }
});
