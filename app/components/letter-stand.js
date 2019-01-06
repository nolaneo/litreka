import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  classNames: ['layout__box', 'o__has-columns', 'letter-stand'],
  gameState: service(),
  actions: {
    updateList(list) {
      this.set('gameState.playerLetters', list);
    }
  }
});
