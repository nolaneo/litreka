import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  classNames: ['cell'],
  classNameBindings: [
    'cell.isDoubleWord:double-word-score',
    'cell.isTripleWord:triple-word-score',
    'cell.isDoubleLetter:double-letter-score',
    'cell.isTripleLetter:triple-letter-score',
    'cell.isStartingPoint:starting-point',
    'cell.notEmpty:with-letter',
    'cell.unpersisted:unpersisted'
  ],

  gameState: service(),

  click() {
    if (this.get('gameState.isPlayerMove') && this.get('cell.unpersisted') && this.get('cell.notEmpty')) {
      this.get('gameState.playerLetters').pushObject(this.get('cell.letter'));
      this.get('gameState.moves.lastObject.cells').removeObject(this.get('cell'));
      this.get('gameState.moves.lastObject').generateAllScores();
      this.setProperties({
        'cell.letter': null,
        'cell.unpersisted': false
      });
    }
  },

  actions: {
    placeLetter(data) {
      if (this.get('gameState.isPlayerMove')) {
        this.setProperties({
          'cell.letter': data.letter,
          'cell.unpersisted': true
        });
        this.get('gameState.playerLetters').removeAt(data.index);
        this.get('gameState.moves.lastObject.cells').pushObject(this.get('cell'));
        this.get('gameState.moves.lastObject').generateAllScores();
        this.get('gameState').syncState();
      }
    }
  }
});
