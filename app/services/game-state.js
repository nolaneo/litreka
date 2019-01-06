import Service from '@ember/service';
import BoardLayout from '../data/board-layout';
import Letters from '../data/letters';
import Cell from '../models/cell';
import Move from '../models/move';
import { getOwner }  from '@ember/application';

export default Service.extend({
  initialize() {
    this.set('cells', BoardLayout.map(cellData => Cell.create(cellData)));
    this.set('playerLetters', ['A', 'B', 'C', 'D', 'E', 'F', 'G' ])
    this.set('playerMoves', [new Move({ container: getOwner(this) })]);
    this.set('opponentMoves', []);
  },

  letterPoints(letter) {
    return Letters[letter].points;
  },

  cellAt(x, y) {
    let index = this.toFlatIndex(x, y);
    return this.get('cells').objectAt(index);
  },

  toFlatIndex(x, y) {
    return x + (y * 15);
  }
});
