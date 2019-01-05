import Object from '@ember/object';
import { TYPES } from '../data/board-layout';
import { equal }  from '@ember/object/computed';

export default Object.extend({
  isDoubleWord: equal('type', TYPES.doubleWord),
  isTripleWord: equal('type', TYPES.tripleWord),
  isDoubleLetter: equal('type', TYPES.doubleLetter),
  isTripleLetter: equal('type', TYPES.tripleLetter),
  isStartingPoint: equal('type', TYPES.startingPoint),
});
