import Service from '@ember/service';
import BoardLayout from '../data/board-layout';
import Letters from '../data/letters';
import Cell from '../models/cell';
import Move from '../models/move';
import { getOwner }  from '@ember/application';

const LS_KEY = 'ongoingGame';

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default Service.extend({
  initialize() {
    if (localStorage.getItem(LS_KEY)) {
      if(confirm('Resume ongoing game?')) {
        let game = JSON.parse(localStorage.getItem(LS_KEY));
        this.set('letterBag', game.letterBag);
        this.set('playerLetters', game.playerLetters);
        this.set('cells', game.cells.map(cellData => this.deserializeCell(cellData)));
        this.set('playerMoves', game.playerMoves.map(m => this.deserializeMove(m)));
        this.set('opponentMoves', game.opponentMoves.map(m => this.deserializeMove(m)));
        return
      }
    }
    this.newGame();
  },

  deserializeCell(cellData) {
    return Cell.create(cellData, { container: getOwner(this) });
  },

  deserializeMove(moveData) {
    let move = Move.create(moveData, { container: getOwner(this)});
    move.cells = moveData.cells.map(cell => this.cellAt(cell.x, cell.y));
    return move;
  },

  newGame() {
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

  localStorageSync() {
    return JSON.stringify({
      letterBag: this.get('letterBag'),
      playerLetters: this.get('playerLetters'),
      cells: this.get('cells').map(c => c.serialize()),
      opponentMoves: this.get('opponentMoves').map(m => m.serialize()),
      playerMoves: this.get('playerMoves').map(m => m.serialize()),
    });
  },

  dataSyncPacket() {
    return {
      letterBag: this.get('letterBag'),
      cells: this.get('cells').map(c => c.serialize()),
      opponentMoves: this.get('playerMoves').map(m => m.serialize()),
      playerMoves: this.get('opponentMoves').map(m => m.serialize()),
    };
  },

  completeMove() {
    let activeMove = this.get('playerMoves.lastObject');
    activeMove.set('completedAt', new Date().getTime());
    activeMove.get('cells').setEach('unpersisted', false);
    this.get('playerLetters').pushObjects(this.takeLetters(activeMove.get('cells.length')));
    this.get('opponentMoves').pushObject(new Move({ container: getOwner(this) }));
    localStorage.setItem(LS_KEY, this.localStorageSync());
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
