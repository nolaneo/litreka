import Service from '@ember/service';
import BoardLayout from '../data/board-layout';
import Letters from '../data/letters';
import Cell from '../models/cell';
import Move from '../models/move';
import { getOwner }  from '@ember/application';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';

const LS_KEY = 'ongoingGame';

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default Service.extend({
  connectionService: service(),

  initReceiver() {
    this.get('connectionService').on('received', (data) => this.setStateFromJSON(data));
  },

  initialize() {
    if (this.get('connectionService.isMaster')) {
      if (localStorage.getItem(LS_KEY)) {
        if (confirm('Resume ongoing game?')) {
          let game = JSON.parse(localStorage.getItem(LS_KEY));
          this.setStateFromJSON(game);
        } else {
          this.newGame();
        }
      } else {
        this.newGame();
      }
      this.syncState();
    } else {
      console.log('NOT MASTER');
    }
  },

  syncState() {
    later(this, () => {
      console.log('syncState');
      this.get('connectionService.connection').send(this.dataSyncPacket());
      localStorage.setItem(LS_KEY, this.localStorageSync());
    }, 1000);
  },

  setStateFromJSON(game) {
    console.log('State received!');
    if (game.letterBag) this.set('letterBag', game.letterBag);
    if (game.playerLetters) this.set('playerLetters', game.playerLetters);
    if (game.opponentLetters) this.set('opponentLetters', game.opponentLetters);
    if (game.cells) this.set('cells', game.cells.map(cellData => this.deserializeCell(cellData)));
    if (game.playerMoves) this.set('playerMoves', game.playerMoves.map(m => this.deserializeMove(m)));
    if (game.opponentMoves) this.set('opponentMoves', game.opponentMoves.map(m => this.deserializeMove(m)));
    if (game.isPlayerMove) this.set('isPlayerMove', game.isPlayerMove);
    localStorage.setItem(LS_KEY, this.localStorageSync());
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
    this.set('opponentLetters', this.takeLetters(7));
    this.set('playerMoves', [Move.create({ container: getOwner(this) })]);
    this.set('opponentMoves', [Move.create({ container: getOwner(this) })]);
    this.set('isPlayerMove', Math.random() > 0.5)
  },

  localStorageSync() {
    return JSON.stringify({
      letterBag: this.get('letterBag'),
      playerLetters: this.get('playerLetters'),
      opponentLetters: this.get('opponentLetters'),
      cells: this.get('cells').map(c => c.serialize()),
      opponentMoves: this.get('opponentMoves').map(m => m.serialize()),
      playerMoves: this.get('playerMoves').map(m => m.serialize()),
      isPlayerMove: this.get('isPlayerMove'),
    });
  },

  dataSyncPacket() {
    return {
      letterBag: this.get('letterBag'),
      cells: this.get('cells').map(c => c.serialize()),
      opponentMoves: this.get('playerMoves').map(m => m.serialize()),
      playerMoves: this.get('opponentMoves').map(m => m.serialize()),
      playerLetters: this.get('opponentLetters'),
      opponentLetters: this.get('playerLetters'),
      isPlayerMove: !this.get('isPlayerMove'),
    };
  },

  completeMove() {
    let activeMove = this.get('playerMoves.lastObject');
    activeMove.set('completedAt', new Date().getTime());
    activeMove.get('cells').setEach('unpersisted', false);
    this.get('playerLetters').pushObjects(this.takeLetters(activeMove.get('cells.length')));
    this.get('playerMoves').pushObject(new Move({ container: getOwner(this) }));
    this.set('isPlayerMove', false);
    this.syncState();
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
