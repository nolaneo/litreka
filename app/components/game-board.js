import Component from '@ember/component';
import BoardLayout from '../data/board-layout';
import Cell from '../models/cell';
import { computed }  from '@ember/object';

export default Component.extend({
  classNames: ['game-board'],
  boardLayout: computed(function() {
    return BoardLayout.map(cellData => Cell.create(cellData));
  }),
});
