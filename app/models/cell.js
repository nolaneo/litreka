import Object from '@ember/object';
import { TYPES } from '../data/board-layout';
import { equal, none, not }  from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { computed }  from '@ember/object';
import { isNone }  from '@ember/utils';

export default Object.extend({
  gameState: service(),

  isDoubleWord: equal('type', TYPES.doubleWord),
  isTripleWord: equal('type', TYPES.tripleWord),
  isDoubleLetter: equal('type', TYPES.doubleLetter),
  isTripleLetter: equal('type', TYPES.tripleLetter),
  isStartingPoint: equal('type', TYPES.startingPoint),

  x: null,
  y: null,
  letter: null,
  unpersisted: true,

  isEmpty: none('letter'),
  notEmpty: not('isEmpty'),

  serialize() {
    return this.getProperties(['x', 'y', 'letter', 'unpersisted', 'type']);
  },

  hasPersistedLetter: computed('unpersisted', 'notEmpty', function() {
    return this.get('notEmpty') && !this.get('unpersisted');
  }),

  persistedCellInDirection(deltaX, deltaY) {
    let x = this.get('x') + deltaX;
    let y = this.get('y') + deltaY;
    if (!this.isCoordinateInBounds(x, y)) {
      return null;
    }
    let cell = this.get('gameState').cellAt(x, y);
    if (cell.get('notEmpty')) {
      return cell;
    }
  },

  furthestLetterLeft() {
    return this.furthestLetterInDirection(-1, 0);
  },

  furthestLetterRight() {
    return this.furthestLetterInDirection(1, 0);
  },

  furthestLetterUp() {
    return this.furthestLetterInDirection(0, -1);
  },

  furthestLetterDown() {
    return this.furthestLetterInDirection(0, 1);
  },

  furthestLetterInDirection(deltaX, deltaY) {
    let cell = this;
    while(cell !== null) {
      let nextCell = cell.persistedCellInDirection(deltaX, deltaY);
      if (isNone(nextCell)) {
        break;
      }
      cell = nextCell;
    }
    return cell;
  },

  isCoordinateInBounds(x, y) {
    return x >= 0 && y >= 0 && x < 15 && y < 15;
  },

  adjacentToPersistedCell() {
    let x = this.get('x');
    let y = this.get('y');
    return [x - 1, x + 1].some(x => {
      return [y -1, y + 1].some(y => {
        return this.isCoordinateInBounds(x, y) && this.get('gameState').cellAt(x, y).get('hasPersistedLetter');
      });
    })
  }
});
