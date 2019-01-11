import Component from '@ember/component';
import { computed }  from '@ember/object';

export default Component.extend({
  classNames: ['layout__box', 'o__has-row', 'o__flexes-to-1'],
  total: computed('moves.[]', function() {
    return (this.get('moves') || []).reduce((total, move) => {
      return total + move.get('scores').reduce((t, s) => t + s.points, 0);
    }, 0);
  })
});
