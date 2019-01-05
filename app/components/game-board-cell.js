import Component from '@ember/component';

export default Component.extend({
  classNames: ['cell'],
  classNameBindings: [
    'cell.isDoubleWord:double-word-score',
    'cell.isTripleWord:triple-word-score',
    'cell.isDoubleLetter:double-letter-score',
    'cell.isTripleLetter:triple-letter-score',
    'cell.isStartingPoint:starting-point',
  ]
});
