import Object from '@ember/object';
import Letters from '../data/letters';
import { computed }  from '@ember/object';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { TYPES } from '../data/board-layout';
import { isNone }  from '@ember/utils';

export default Object.extend({
  gameState: service(),

  init() {
    if (isNone(this.get('cells'))) {
      this.set('cells', A());
    }
  },

  cells: null,
  completedAt: null,

  serialize() {
    return {
      cells: this.get('cells').map(c => c.serialize()),
      completedAt: this.get('completedAt'),
    };
  },

  isHorizontal: computed('cells.[]', function() {
    let cells = this.get('cells');
    let firstCell = this.get('cells.firstObject');
    let yLocations = cells.mapBy('y');
    return yLocations.uniq().length === 1 && firstCell.furthestLetterLeft() !== firstCell.furthestLetterRight();
  }),

  isVertical: computed('cells.[]', function() {
    let cells = this.get('cells');
    let firstCell = this.get('cells.firstObject');
    let xLocations = cells.mapBy('x');
    return xLocations.uniq().length === 1 && firstCell.furthestLetterUp() !== firstCell.furthestLetterDown();
  }),

  isValidMove: computed('hasValidPlacement', 'isHorizontallyValid', 'isVerticallyValid', function() {
    return this.get('hasValidPlacement') && (this.get('isHorizontallyValid') || this.get('isVerticallyValid'));
  }),

  hasValidPlacement: computed('cells.[]', function() {
    return (this.get('cells').some(cell => cell.get('isStartingPoint')) || this.get('cells').some(cell => cell.adjacentToPersistedCell()));
  }),

  horizontalCells: computed('isHorizontal', 'cells.[]', function() {
    if (this.get('isHorizontal')) {
      let cell = this.get('cells.firstObject');
      let leftmostCell = cell.furthestLetterLeft();
      let rightmostCell = cell.furthestLetterRight();
      return this.cellsBetween(leftmostCell, rightmostCell);
    }
  }),

  verticalCells: computed('isVertical', 'cells.[]', function() {
    if (this.get('isVertical')) {
      let cell = this.get('cells.firstObject');
      let upmostCell = cell.furthestLetterUp();
      let downmostCell = cell.furthestLetterDown();
      return this.cellsBetween(upmostCell, downmostCell);
    }
  }),

  cellsBetween(cell1, cell2) {
    let isVertical = cell1.get('x') === cell2.get('x');
    let cellsBetween = A();
    let x = cell1.get('x'), y = cell1.get('y');
    while(x <= cell2.get('x') && y <= cell2.get('y')) {
      cellsBetween.pushObject(this.get('gameState').cellAt(x, y));
      if (isVertical) {
        ++y;
      } else {
        ++x;
      }
    }
    return cellsBetween;
  },

  isHorizontallyValid: computed('isHorizontal', 'horizontalCells', function() {
    if (this.get('isHorizontal')) {
      return this.get('horizontalCells').every(cell => cell.get('notEmpty'));
    } else {
      return false;
    }
  }),

  isVerticallyValid: computed('isVertical', 'verticalCells', function() {
    if (this.get('isVertical')) {
      return this.get('verticalCells').every(cell => cell.get('notEmpty'));
    } else {
      return false;
    }
  }),

  mainScorableWord: computed('cells.[]', function() {
    return this.get('isHorizontal') ? this.get('horizontalCells') : this.get('verticalCells');
  }),

  additionalScorableWords: computed('isValidMove', 'cells.[]', function() {
    if (!this.get('isValidMove')) {
      return [];
    }
    let scorableWords = A();
    this.get('cells').forEach(cell => {
      let cell1 = this.get('isHorizontal') ? cell.furthestLetterUp() : cell.furthestLetterLeft();
      let cell2 = this.get('isHorizontal') ? cell.furthestLetterDown() : cell.furthestLetterRight();
      if (cell1 !== cell2) {
        scorableWords.push(this.cellsBetween(cell1, cell2));
      }
    });
    return scorableWords;
  }),

  generateScore(cells, options) {
    let letters = cells.map(cell => {
      let letterPoints = Letters[cell.get('letter').toLowerCase()].points;
      let playerPlacedCell = this.get('cells').includes(cell);
      if (cell.get('isDoubleLetter') && playerPlacedCell) {
        return { letter: cell.get('letter'), points: letterPoints * 2, special: TYPES.doubleLetter}
      } else if (cell.get('isTripleLetter') && playerPlacedCell) {
        return { letter: cell.get('letter'), points: letterPoints * 3, special: TYPES.tripleLetter }
      } else if (cell.get('isDoubleWord') && playerPlacedCell) {
        return { letter: cell.get('letter'), points: letterPoints, special: TYPES.doubleWord }
      } else if (cell.get('isTripleWord') && playerPlacedCell) {
        return { letter: cell.get('letter'), points: letterPoints, special: TYPES.tripleWord }
      } else {
        return { letter: cell.get('letter'), points: letterPoints , special: 0 }
      }
    });
    let score = { doubleWords: [], tripleWords: [], bonus: false, letters };
    let points = letters.reduce((total, element) => total += element.points, 0);

    cells.filterBy('isDoubleWord').forEach(() => points *= 2);
    cells.filterBy('isTripleWord').forEach(() => points *= 3);

    if (this.get('cells.length') === 7 && options.canPlace) {
      points += 50;
      score.bonus = true;
    }
    score.points = points;
    return score;
  },

  scores: computed('mainScorableWord', 'additionalScorableWords.[]', function() {
    let scores = A();
    if (this.get('mainScorableWord')) {
      scores.pushObject(this.generateScore(this.get('mainScorableWord')));
    }
    this.get('additionalScorableWords').forEach(sw => scores.pushObject(this.generateScore(sw)));
    return scores;
  }),
});
