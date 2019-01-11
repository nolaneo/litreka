import Service from '@ember/service';
import BoardLayout from '../data/board-layout';
import Letters from '../data/letters';
import Cell from '../models/cell';
import Move from '../models/move';
import { getOwner }  from '@ember/application';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';
import { computed }  from '@ember/object';

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
    let playerId =  this.get('connectionService.peer.id');
    let opponentId = this.get('connectionService.connection.peer');

    this.set('playerId', playerId);
    this.set('opponentId', opponentId);

    this.set('moves', []);
    if (this.get('connectionService.isMaster')) {
      if (localStorage.getItem(LS_KEY)) {
        if (confirm('Resume ongoing game?')) {
          let game = JSON.parse(localStorage.getItem(LS_KEY));
          this.setStateFromLocalStorage(game);
        } else {
          this.newGame();
        }
      } else {
        this.newGame();
      }
      this.syncState(500);
      this.syncState(2000);
    } else {
      console.log('NOT MASTER');
    }
  },

  playerMoves: computed('moves.@each.uniqId', function() {
    return this.get('moves').filter(m => m.get('playerId') === this.get('playerId'));
  }),

  opponentMoves: computed('moves.@each.uniqId', function() {
    return this.get('moves').filter(m => m.get('playerId') === this.get('opponentId'));
  }),

  syncState(delay = 200) {
    later(this, () => {
      console.log('syncState');
      this.get('connectionService.connection').send(this.dataSyncPacket());
      localStorage.setItem(LS_KEY, this.localStorageSync());
    }, delay);
  },

  setStateFromLocalStorage(game) {
    this.setStateFromJSON(game);
    this.get('moves').forEach(move => {
      if (move.get('playerId') === move.playerId) {
        move.set('playerId', this.get('playerId'));
      } else {
        move.set('playerId', this.get('opponentId'));
      }
    })
  },

  setStateFromJSON(game) {
    console.log('State received!');
    if (game.letterBag) this.set('letterBag', game.letterBag);
    if (game.playerLetters) this.set('playerLetters', game.playerLetters);
    if (game.opponentLetters) this.set('opponentLetters', game.opponentLetters);
    if (game.cells) this.set('cells', game.cells.map(cellData => this.deserializeCell(cellData)));
    if (game.moves) this.set('moves', game.moves.map(m => this.deserializeMove(m)));
    if (game.isPlayerMove) this.set('isPlayerMove', game.isPlayerMove);
    localStorage.setItem(LS_KEY, this.localStorageSync());
  },

  deserializeCell(cellData) {
    return Cell.create(cellData, { container: getOwner(this) });
  },

  deserializeMove(moveData) {
    let move = Move.create(moveData, { container: getOwner(this) });
    move.cells = moveData.cells.map(cell => this.cellAt(cell.x, cell.y));
    return move;
  },

  newGame() {
    let letterBag = Object.keys(Letters).map(letter => {
      return new Array(Letters[letter].tiles).fill(letter.toUpperCase());
    }).flat();
    this.set('isPlayerMove', Math.random() > 0.5);
    letterBag = shuffle(letterBag);
    this.set('letterBag', letterBag);
    this.set('cells', BoardLayout.map(cellData => Cell.create(cellData, { container: getOwner(this) })));
    this.set('playerLetters', this.takeLetters(7));
    this.set('opponentLetters', this.takeLetters(7));
    this.set('moves', [Move.create({ playerId: this.get('isPlayerMove') ? this.get('playerId') : this.get('opponentId'), container: getOwner(this) })]);
  },

  localStorageSync() {
    return JSON.stringify({
      playerId: this.get('playerId'),
      opponentId: this.get('opponentId'),
      letterBag: this.get('letterBag'),
      playerLetters: this.get('playerLetters'),
      opponentLetters: this.get('opponentLetters'),
      cells: this.get('cells').map(c => c.serialize()),
      moves: this.get('moves').map(m => m.serialize()),
      isPlayerMove: this.get('isPlayerMove'),
    });
  },

  dataSyncPacket() {
    return {
      letterBag: this.get('letterBag'),
      cells: this.get('cells').map(c => c.serialize()),
      moves: this.get('moves').map(m => m.serialize()),
      playerLetters: this.get('opponentLetters'),
      opponentLetters: this.get('playerLetters'),
      isPlayerMove: !this.get('isPlayerMove'),
    };
  },

  completeMove() {
    let activeMove = this.get('moves.lastObject');
    activeMove.set('completedAt', new Date().getTime());
    activeMove.get('cells').setEach('unpersisted', false);
    this.get('playerLetters').pushObjects(this.takeLetters(activeMove.get('cells.length')));
    this.get('moves').pushObject(new Move({ container: getOwner(this), playerId: this.get('opponentId') }));
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
