import Service from '@ember/service';
import BoardLayout from '../data/board-layout';
import Letters from '../data/letters';
import Cell from '../models/cell';
import Move from '../models/move';
import { getOwner }  from '@ember/application';

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default Service.extend({
  initialize() {
    let letterBag = Object.keys(Letters).map(letter => {
      return new Array(Letters[letter].tiles).fill(letter.toUpperCase());
    }).flat();
    letterBag = shuffle(letterBag);
    this.set('letterBag', letterBag);
    this.set('cells', BoardLayout.map(cellData => Cell.create(cellData, { container: getOwner(this) })));
    this.set('playerLetters', this.takeLetters(7));
    this.set('playerMoves', [new Move({ container: getOwner(this) })]);
    this.set('opponentMoves', []);
  },

  completeMove() {
    let activeMove = this.get('playerMoves.lastObject');
    activeMove.get('cells').setEach('unpersisted', false);
    this.get('playerLetters').pushObjects(this.takeLetters(activeMove.get('cells.length')));
    this.get('playerMoves').pushObject(new Move({ container: getOwner(this) }));
  },

  letterPoints(letter) {
    return Letters[letter].points;
  },

  takeLetters(n) {
    let array = [];
    for (let i = 0; i < Math.min(n, this.get('letterBag.length')); ++i) {
      array.pushObject(this.get('letterBag').pop());
    }
    return array;
  },

  cellAt(x, y) {
    let index = this.toFlatIndex(x, y);
    return this.get('cells').objectAt(index);
  },

  toFlatIndex(x, y) {
    return x + (y * 15);
  }
});
