import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import ENV from 'litreka/config/environment';

export default Controller.extend({
  connectionService: service(),
  router: service(),
  url: computed('connectionService.peerId', function() {
    if (this.get('connectionService.peerId')) {
      let path = this.get('router').urlFor('game.connect', { id: this.get('connectionService.peerId') });
      let { protocol, host } = window.location;
      return `${protocol}//${host}${ENV.rootURL}${path}`;
    }
  }),

  letters: ['L', 'I', 'T', 'E', 'R', 'K', 'A', 'B', 'Y', 'N', 'O', 'L', 'A', 'N', 'E', 'O'],

  actions: {
    copied() {
      this.set('copied', true);
    }
  }
});
