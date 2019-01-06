import Object from '@ember/object';
import Letters from '../data/letters';
import { computed }  from '@ember/object';
import { inject as service } from '@ember/service';

export default Object.extend({
  gameState: service(),

  init() {
    this._super(...arguments);
    this.set('cells', []);
  },

  cells: null,

  isHorizontal: computed('cells.[]', function() {
    let cells = this.get('cells');
    let yLocations = cells.mapBy('y');
    console.log(`yLocations.uniq(): ${yLocations.uniq()}`);
    return yLocations.uniq().length === 1;
  }),

  isVertical: computed('cells.[]', function() {
    let cells = this.get('cells');
    let xLocations = cells.mapBy('x');
    return xLocations.uniq().length === 1;
  }),

  isValidMove: computed('isHorizontallyValid', 'isVerticallyValid', function() {
    return this.get('isHorizontallyValid') || this.get('isVerticallyValid');
  }),

  isHorizontallyValid: computed('isHorizontal', 'cells.[]', function() {
    if (this.get('isHorizontal')) {
      let cells = this.get('cells');
      let xLocations = cells.mapBy('x').sort((a,b) => a - b)
      let y = cells.mapBy('y').uniq().firstObject;
      let result = true;
      console.log(`xLocations.firstObject ${xLocations.firstObject} xLocations.lastObject ${xLocations.lastObject}`);
      for (let x = xLocations.firstObject; x <= xLocations.lastObject; ++x) {
        console.log(`Checking ${x}, ${y}`);
        console.log(`cell: ${JSON.stringify(this.get('gameState').cellAt(x, y).getProperties(['x', 'y']))}`);
        result = result && this.get('gameState').cellAt(x, y).get('notEmpty');
      }
      return result;
    } else {
      return false;
    }
  }),

  isVerticallyValid: computed('isVertical', 'cells.[]', function() {
    if (this.get('isVertical')) {
      let cells = this.get('cells');
      let yLocations = cells.mapBy('y').sort((a,b) => a - b)
      let x = cells.mapBy('x').uniq().firstObject;
      let result = true;
      for (let y = yLocations.firstObject; y <= yLocations.lastObject; ++y) {
        result = result && this.get('gameState').cellAt(x, y).get('notEmpty');
      }
      return result;
    } else {
      return false;
    }
  }),

  score: computed('cells.[]', function() {
    let points = this.get('cells').reduce((total, cell) => {
      let letterPoints = Letters[cell.get('letter').toLowerCase()].points;
      if (cell.get('isDoubleLetter')) {
        letterPoints *= 2;
      }
      if (cell.get('isTripleLetter')) {
        letterPoints *= 3;
      }
      return letterPoints;
    }, 0);
    if (this.get('cells.count'))
    this.get('cells').forEach(cell => {

    });
  }),
});
