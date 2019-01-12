'use strict';



;define("litreka/app", ["exports", "litreka/resolver", "ember-load-initializers", "litreka/config/environment"], function (_exports, _resolver, _emberLoadInitializers, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const App = Ember.Application.extend({
    modulePrefix: _environment.default.modulePrefix,
    podModulePrefix: _environment.default.podModulePrefix,
    Resolver: _resolver.default
  });
  (0, _emberLoadInitializers.default)(App, _environment.default.modulePrefix);
  var _default = App;
  _exports.default = _default;
});
;define("litreka/components/copy-button", ["exports", "ember-cli-clipboard/components/copy-button"], function (_exports, _copyButton) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _copyButton.default;
    }
  });
});
;define("litreka/components/draggable-object-target", ["exports", "ember-drag-drop/components/draggable-object-target"], function (_exports, _draggableObjectTarget) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = _draggableObjectTarget.default;
  _exports.default = _default;
});
;define("litreka/components/draggable-object", ["exports", "ember-drag-drop/components/draggable-object"], function (_exports, _draggableObject) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = _draggableObject.default;
  _exports.default = _default;
});
;define("litreka/components/game-board-cell", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend({
    classNames: ['cell'],
    classNameBindings: ['cell.isDoubleWord:double-word-score', 'cell.isTripleWord:triple-word-score', 'cell.isDoubleLetter:double-letter-score', 'cell.isTripleLetter:triple-letter-score', 'cell.isStartingPoint:starting-point', 'cell.notEmpty:with-letter', 'cell.unpersisted:unpersisted'],
    gameState: Ember.inject.service(),

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

  _exports.default = _default;
});
;define("litreka/components/game-board", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend({
    gameState: Ember.inject.service(),
    classNames: ['game-board']
  });

  _exports.default = _default;
});
;define("litreka/components/letter-points", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend({
    classNames: ['letter-score'],
    gameState: Ember.inject.service(),

    didInsertElement() {
      this.set('points', this.get('gameState').letterPoints(this.get('letter').toLowerCase()));
    }

  });

  _exports.default = _default;
});
;define("litreka/components/letter-stand", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend({
    classNames: ['layout__box', 'o__has-columns', 'letter-stand'],
    gameState: Ember.inject.service(),
    actions: {
      updateList(list) {
        this.set('gameState.playerLetters', list);
      }

    }
  });

  _exports.default = _default;
});
;define("litreka/components/object-bin", ["exports", "ember-drag-drop/components/object-bin"], function (_exports, _objectBin) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = _objectBin.default;
  _exports.default = _default;
});
;define("litreka/components/opponent-webcam", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend({
    tagName: 'video',
    attributeBindings: ['autoplay'],
    autoplay: true,
    connectionService: Ember.inject.service(),

    didInsertElement() {
      this._super(...arguments);

      Ember.run.next(this, this.setupStream);
      console.log('VIDYO');
      this.get('connectionService').on('reconnected', () => {
        this.get('call').close();
        console.log('reinstating webcam stream');
        this.setupStream();
      });
    },

    async setupStream() {
      let mediaStream = await this.get('mediaStream');

      if (this.get('connectionService.isMaster')) {
        let call = this.get('connectionService.peer').call(this.get('connectionService.connection.peer'), mediaStream);
        this.setupPeerVideo(call);
      } else {
        this.get('connectionService.peer').on('call', call => {
          call.answer(mediaStream);
          this.setupPeerVideo(call);
        });
      }
    },

    mediaStream: Ember.computed(function () {
      let settings = {
        video: {
          width: {
            exact: 640
          },
          height: {
            exact: 480
          }
        },
        audio: true
      };
      return navigator.mediaDevices.getUserMedia(settings).catch(error => {
        console.error(error);
        console.error('Returning blank stream');
        return new MediaStream();
      });
    }),

    setupPeerVideo(call) {
      this.set('call', call);
      call.on('stream', stream => {
        this.$()[0].srcObject = stream;
      });
    }

  });

  _exports.default = _default;
});
;define("litreka/components/scores-list", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend({
    classNames: ['layout__box', 'o__has-row', 'o__flexes-to-1'],
    total: Ember.computed('moves.[]', function () {
      return (this.get('moves') || []).reduce((total, move) => {
        return total + move.get('scores').reduce((t, s) => t + s.points, 0);
      }, 0);
    })
  });

  _exports.default = _default;
});
;define("litreka/components/sortable-group", ["exports", "ember-sortable/components/sortable-group"], function (_exports, _sortableGroup) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = _sortableGroup.default;
  _exports.default = _default;
});
;define("litreka/components/sortable-item", ["exports", "ember-sortable/components/sortable-item"], function (_exports, _sortableItem) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = _sortableItem.default;
  _exports.default = _default;
});
;define("litreka/components/sortable-objects", ["exports", "ember-drag-drop/components/sortable-objects"], function (_exports, _sortableObjects) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = _sortableObjects.default;
  _exports.default = _default;
});
;define("litreka/components/ui-accordion", ["exports", "semantic-ui-ember/components/ui-accordion"], function (_exports, _uiAccordion) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _uiAccordion.default;
    }
  });
});
;define("litreka/components/ui-checkbox", ["exports", "semantic-ui-ember/components/ui-checkbox"], function (_exports, _uiCheckbox) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _uiCheckbox.default;
    }
  });
});
;define("litreka/components/ui-dimmer", ["exports", "semantic-ui-ember/components/ui-dimmer"], function (_exports, _uiDimmer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _uiDimmer.default;
    }
  });
});
;define("litreka/components/ui-dropdown", ["exports", "semantic-ui-ember/components/ui-dropdown"], function (_exports, _uiDropdown) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _uiDropdown.default;
    }
  });
});
;define("litreka/components/ui-embed", ["exports", "semantic-ui-ember/components/ui-embed"], function (_exports, _uiEmbed) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _uiEmbed.default;
    }
  });
});
;define("litreka/components/ui-modal", ["exports", "semantic-ui-ember/components/ui-modal"], function (_exports, _uiModal) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _uiModal.default;
    }
  });
});
;define("litreka/components/ui-nag", ["exports", "semantic-ui-ember/components/ui-nag"], function (_exports, _uiNag) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _uiNag.default;
    }
  });
});
;define("litreka/components/ui-popup", ["exports", "semantic-ui-ember/components/ui-popup"], function (_exports, _uiPopup) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _uiPopup.default;
    }
  });
});
;define("litreka/components/ui-progress", ["exports", "semantic-ui-ember/components/ui-progress"], function (_exports, _uiProgress) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _uiProgress.default;
    }
  });
});
;define("litreka/components/ui-radio", ["exports", "semantic-ui-ember/components/ui-radio"], function (_exports, _uiRadio) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _uiRadio.default;
    }
  });
});
;define("litreka/components/ui-rating", ["exports", "semantic-ui-ember/components/ui-rating"], function (_exports, _uiRating) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _uiRating.default;
    }
  });
});
;define("litreka/components/ui-search", ["exports", "semantic-ui-ember/components/ui-search"], function (_exports, _uiSearch) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _uiSearch.default;
    }
  });
});
;define("litreka/components/ui-shape", ["exports", "semantic-ui-ember/components/ui-shape"], function (_exports, _uiShape) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _uiShape.default;
    }
  });
});
;define("litreka/components/ui-sidebar", ["exports", "semantic-ui-ember/components/ui-sidebar"], function (_exports, _uiSidebar) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _uiSidebar.default;
    }
  });
});
;define("litreka/components/ui-sticky", ["exports", "semantic-ui-ember/components/ui-sticky"], function (_exports, _uiSticky) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _uiSticky.default;
    }
  });
});
;define("litreka/components/welcome-page", ["exports", "ember-welcome-page/components/welcome-page"], function (_exports, _welcomePage) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _welcomePage.default;
    }
  });
});
;define("litreka/controllers/game/board", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Controller.extend({
    gameState: Ember.inject.service(),
    actions: {
      completeMove() {
        if (this.get('gameState.isPlayerMove')) {
          this.get('gameState').completeMove();
        }
      },

      manualSync() {
        this.get('gameState').syncState();
      }

    }
  });

  _exports.default = _default;
});
;define("litreka/controllers/game/waiting", ["exports", "litreka/config/environment"], function (_exports, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Controller.extend({
    connectionService: Ember.inject.service(),
    router: Ember.inject.service(),
    url: Ember.computed('connectionService.peerId', function () {
      if (this.get('connectionService.peerId')) {
        let path = this.get('router').urlFor('game.connect', {
          id: this.get('connectionService.peerId')
        });
        let {
          protocol,
          host
        } = window.location;
        return `${protocol}//${host}${_environment.default.rootURL}${path}`;
      }
    }),
    letters: ['L', 'I', 'T', 'E', 'R', 'K', 'A', 'B', 'Y', 'N', 'O', 'L', 'A', 'N', 'E', 'O'],
    actions: {
      copied() {
        this.set('copied', true);
      }

    }
  });

  _exports.default = _default;
});
;define("litreka/data/board-layout", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.TYPES = _exports.default = void 0;
  const TYPES = {
    standard: 0,
    doubleWord: 1,
    tripleWord: 2,
    doubleLetter: 3,
    tripleLetter: 4,
    startingPoint: 5
  };
  _exports.TYPES = TYPES;
  var _default = [{
    y: 0,
    x: 0,
    type: TYPES.tripleWord
  }, {
    y: 0,
    x: 1,
    type: TYPES.standard
  }, {
    y: 0,
    x: 2,
    type: TYPES.standard
  }, {
    y: 0,
    x: 3,
    type: TYPES.doubleLetter
  }, {
    y: 0,
    x: 4,
    type: TYPES.standard
  }, {
    y: 0,
    x: 5,
    type: TYPES.standard
  }, {
    y: 0,
    x: 6,
    type: TYPES.standard
  }, {
    y: 0,
    x: 7,
    type: TYPES.tripleWord
  }, {
    y: 0,
    x: 8,
    type: TYPES.standard
  }, {
    y: 0,
    x: 9,
    type: TYPES.standard
  }, {
    y: 0,
    x: 10,
    type: TYPES.standard
  }, {
    y: 0,
    x: 11,
    type: TYPES.doubleLetter
  }, {
    y: 0,
    x: 12,
    type: TYPES.standard
  }, {
    y: 0,
    x: 13,
    type: TYPES.standard
  }, {
    y: 0,
    x: 14,
    type: TYPES.tripleWord
  }, {
    y: 1,
    x: 0,
    type: TYPES.standard
  }, {
    y: 1,
    x: 1,
    type: TYPES.doubleWord
  }, {
    y: 1,
    x: 2,
    type: TYPES.standard
  }, {
    y: 1,
    x: 3,
    type: TYPES.standard
  }, {
    y: 1,
    x: 4,
    type: TYPES.standard
  }, {
    y: 1,
    x: 5,
    type: TYPES.tripleLetter
  }, {
    y: 1,
    x: 6,
    type: TYPES.standard
  }, {
    y: 1,
    x: 7,
    type: TYPES.standard
  }, {
    y: 1,
    x: 8,
    type: TYPES.standard
  }, {
    y: 1,
    x: 9,
    type: TYPES.tripleLetter
  }, {
    y: 1,
    x: 10,
    type: TYPES.standard
  }, {
    y: 1,
    x: 11,
    type: TYPES.standard
  }, {
    y: 1,
    x: 12,
    type: TYPES.standard
  }, {
    y: 1,
    x: 13,
    type: TYPES.doubleWord
  }, {
    y: 1,
    x: 14,
    type: TYPES.standard
  }, {
    y: 2,
    x: 0,
    type: TYPES.standard
  }, {
    y: 2,
    x: 1,
    type: TYPES.standard
  }, {
    y: 2,
    x: 2,
    type: TYPES.doubleWord
  }, {
    y: 2,
    x: 3,
    type: TYPES.standard
  }, {
    y: 2,
    x: 4,
    type: TYPES.standard
  }, {
    y: 2,
    x: 5,
    type: TYPES.standard
  }, {
    y: 2,
    x: 6,
    type: TYPES.doubleLetter
  }, {
    y: 2,
    x: 7,
    type: TYPES.standard
  }, {
    y: 2,
    x: 8,
    type: TYPES.doubleLetter
  }, {
    y: 2,
    x: 9,
    type: TYPES.standard
  }, {
    y: 2,
    x: 10,
    type: TYPES.standard
  }, {
    y: 2,
    x: 11,
    type: TYPES.standard
  }, {
    y: 2,
    x: 12,
    type: TYPES.doubleWord
  }, {
    y: 2,
    x: 13,
    type: TYPES.standard
  }, {
    y: 2,
    x: 14,
    type: TYPES.standard
  }, {
    y: 3,
    x: 0,
    type: TYPES.doubleLetter
  }, {
    y: 3,
    x: 1,
    type: TYPES.standard
  }, {
    y: 3,
    x: 2,
    type: TYPES.standard
  }, {
    y: 3,
    x: 3,
    type: TYPES.doubleWord
  }, {
    y: 3,
    x: 4,
    type: TYPES.standard
  }, {
    y: 3,
    x: 5,
    type: TYPES.standard
  }, {
    y: 3,
    x: 6,
    type: TYPES.standard
  }, {
    y: 3,
    x: 7,
    type: TYPES.doubleLetter
  }, {
    y: 3,
    x: 8,
    type: TYPES.standard
  }, {
    y: 3,
    x: 9,
    type: TYPES.standard
  }, {
    y: 3,
    x: 10,
    type: TYPES.standard
  }, {
    y: 3,
    x: 11,
    type: TYPES.doubleWord
  }, {
    y: 3,
    x: 12,
    type: TYPES.standard
  }, {
    y: 3,
    x: 13,
    type: TYPES.standard
  }, {
    y: 3,
    x: 14,
    type: TYPES.doubleLetter
  }, {
    y: 4,
    x: 0,
    type: TYPES.standard
  }, {
    y: 4,
    x: 1,
    type: TYPES.standard
  }, {
    y: 4,
    x: 2,
    type: TYPES.standard
  }, {
    y: 4,
    x: 3,
    type: TYPES.standard
  }, {
    y: 4,
    x: 4,
    type: TYPES.doubleWord
  }, {
    y: 4,
    x: 5,
    type: TYPES.standard
  }, {
    y: 4,
    x: 6,
    type: TYPES.standard
  }, {
    y: 4,
    x: 7,
    type: TYPES.standard
  }, {
    y: 4,
    x: 8,
    type: TYPES.standard
  }, {
    y: 4,
    x: 9,
    type: TYPES.standard
  }, {
    y: 4,
    x: 10,
    type: TYPES.doubleWord
  }, {
    y: 4,
    x: 11,
    type: TYPES.standard
  }, {
    y: 4,
    x: 12,
    type: TYPES.standard
  }, {
    y: 4,
    x: 13,
    type: TYPES.standard
  }, {
    y: 4,
    x: 14,
    type: TYPES.standard
  }, {
    y: 5,
    x: 0,
    type: TYPES.standard
  }, {
    y: 5,
    x: 1,
    type: TYPES.tripleLetter
  }, {
    y: 5,
    x: 2,
    type: TYPES.standard
  }, {
    y: 5,
    x: 3,
    type: TYPES.standard
  }, {
    y: 5,
    x: 4,
    type: TYPES.standard
  }, {
    y: 5,
    x: 5,
    type: TYPES.tripleLetter
  }, {
    y: 5,
    x: 6,
    type: TYPES.standard
  }, {
    y: 5,
    x: 7,
    type: TYPES.standard
  }, {
    y: 5,
    x: 8,
    type: TYPES.standard
  }, {
    y: 5,
    x: 9,
    type: TYPES.tripleLetter
  }, {
    y: 5,
    x: 10,
    type: TYPES.standard
  }, {
    y: 5,
    x: 11,
    type: TYPES.standard
  }, {
    y: 5,
    x: 12,
    type: TYPES.standard
  }, {
    y: 5,
    x: 13,
    type: TYPES.tripleLetter
  }, {
    y: 5,
    x: 14,
    type: TYPES.standard
  }, {
    y: 6,
    x: 0,
    type: TYPES.standard
  }, {
    y: 6,
    x: 1,
    type: TYPES.standard
  }, {
    y: 6,
    x: 2,
    type: TYPES.doubleLetter
  }, {
    y: 6,
    x: 3,
    type: TYPES.standard
  }, {
    y: 6,
    x: 4,
    type: TYPES.standard
  }, {
    y: 6,
    x: 5,
    type: TYPES.standard
  }, {
    y: 6,
    x: 6,
    type: TYPES.doubleLetter
  }, {
    y: 6,
    x: 7,
    type: TYPES.standard
  }, {
    y: 6,
    x: 8,
    type: TYPES.doubleLetter
  }, {
    y: 6,
    x: 9,
    type: TYPES.standard
  }, {
    y: 6,
    x: 10,
    type: TYPES.standard
  }, {
    y: 6,
    x: 11,
    type: TYPES.standard
  }, {
    y: 6,
    x: 12,
    type: TYPES.doubleLetter
  }, {
    y: 6,
    x: 13,
    type: TYPES.standard
  }, {
    y: 6,
    x: 14,
    type: TYPES.standard
  }, {
    y: 7,
    x: 0,
    type: TYPES.tripleWord
  }, {
    y: 7,
    x: 1,
    type: TYPES.standard
  }, {
    y: 7,
    x: 2,
    type: TYPES.standard
  }, {
    y: 7,
    x: 3,
    type: TYPES.doubleLetter
  }, {
    y: 7,
    x: 4,
    type: TYPES.standard
  }, {
    y: 7,
    x: 5,
    type: TYPES.standard
  }, {
    y: 7,
    x: 6,
    type: TYPES.standard
  }, {
    y: 7,
    x: 7,
    type: TYPES.startingPoint
  }, {
    y: 7,
    x: 8,
    type: TYPES.standard
  }, {
    y: 7,
    x: 9,
    type: TYPES.standard
  }, {
    y: 7,
    x: 10,
    type: TYPES.standard
  }, {
    y: 7,
    x: 11,
    type: TYPES.doubleLetter
  }, {
    y: 7,
    x: 12,
    type: TYPES.standard
  }, {
    y: 7,
    x: 13,
    type: TYPES.standard
  }, {
    y: 7,
    x: 14,
    type: TYPES.tripleWord
  }, {
    y: 8,
    x: 0,
    type: TYPES.standard
  }, {
    y: 8,
    x: 1,
    type: TYPES.standard
  }, {
    y: 8,
    x: 2,
    type: TYPES.doubleLetter
  }, {
    y: 8,
    x: 3,
    type: TYPES.standard
  }, {
    y: 8,
    x: 4,
    type: TYPES.standard
  }, {
    y: 8,
    x: 5,
    type: TYPES.standard
  }, {
    y: 8,
    x: 6,
    type: TYPES.doubleLetter
  }, {
    y: 8,
    x: 7,
    type: TYPES.standard
  }, {
    y: 8,
    x: 8,
    type: TYPES.doubleLetter
  }, {
    y: 8,
    x: 9,
    type: TYPES.standard
  }, {
    y: 8,
    x: 10,
    type: TYPES.standard
  }, {
    y: 8,
    x: 11,
    type: TYPES.standard
  }, {
    y: 8,
    x: 12,
    type: TYPES.doubleLetter
  }, {
    y: 8,
    x: 13,
    type: TYPES.standard
  }, {
    y: 8,
    x: 14,
    type: TYPES.standard
  }, {
    y: 9,
    x: 0,
    type: TYPES.standard
  }, {
    y: 9,
    x: 1,
    type: TYPES.tripleLetter
  }, {
    y: 9,
    x: 2,
    type: TYPES.standard
  }, {
    y: 9,
    x: 3,
    type: TYPES.standard
  }, {
    y: 9,
    x: 4,
    type: TYPES.standard
  }, {
    y: 9,
    x: 5,
    type: TYPES.tripleLetter
  }, {
    y: 9,
    x: 6,
    type: TYPES.standard
  }, {
    y: 9,
    x: 7,
    type: TYPES.standard
  }, {
    y: 9,
    x: 8,
    type: TYPES.standard
  }, {
    y: 9,
    x: 9,
    type: TYPES.tripleLetter
  }, {
    y: 9,
    x: 10,
    type: TYPES.standard
  }, {
    y: 9,
    x: 11,
    type: TYPES.standard
  }, {
    y: 9,
    x: 12,
    type: TYPES.standard
  }, {
    y: 9,
    x: 13,
    type: TYPES.tripleLetter
  }, {
    y: 9,
    x: 14,
    type: TYPES.standard
  }, {
    y: 10,
    x: 0,
    type: TYPES.standard
  }, {
    y: 10,
    x: 1,
    type: TYPES.standard
  }, {
    y: 10,
    x: 2,
    type: TYPES.standard
  }, {
    y: 10,
    x: 3,
    type: TYPES.standard
  }, {
    y: 10,
    x: 4,
    type: TYPES.doubleWord
  }, {
    y: 10,
    x: 5,
    type: TYPES.standard
  }, {
    y: 10,
    x: 6,
    type: TYPES.standard
  }, {
    y: 10,
    x: 7,
    type: TYPES.standard
  }, {
    y: 10,
    x: 8,
    type: TYPES.standard
  }, {
    y: 10,
    x: 9,
    type: TYPES.standard
  }, {
    y: 10,
    x: 10,
    type: TYPES.doubleWord
  }, {
    y: 10,
    x: 11,
    type: TYPES.standard
  }, {
    y: 10,
    x: 12,
    type: TYPES.standard
  }, {
    y: 10,
    x: 13,
    type: TYPES.standard
  }, {
    y: 10,
    x: 14,
    type: TYPES.standard
  }, {
    y: 11,
    x: 0,
    type: TYPES.doubleLetter
  }, {
    y: 11,
    x: 1,
    type: TYPES.standard
  }, {
    y: 11,
    x: 2,
    type: TYPES.standard
  }, {
    y: 11,
    x: 3,
    type: TYPES.doubleWord
  }, {
    y: 11,
    x: 4,
    type: TYPES.standard
  }, {
    y: 11,
    x: 5,
    type: TYPES.standard
  }, {
    y: 11,
    x: 6,
    type: TYPES.standard
  }, {
    y: 11,
    x: 7,
    type: TYPES.doubleLetter
  }, {
    y: 11,
    x: 8,
    type: TYPES.standard
  }, {
    y: 11,
    x: 9,
    type: TYPES.standard
  }, {
    y: 11,
    x: 10,
    type: TYPES.standard
  }, {
    y: 11,
    x: 11,
    type: TYPES.doubleWord
  }, {
    y: 11,
    x: 12,
    type: TYPES.standard
  }, {
    y: 11,
    x: 13,
    type: TYPES.standard
  }, {
    y: 11,
    x: 14,
    type: TYPES.doubleLetter
  }, {
    y: 12,
    x: 0,
    type: TYPES.standard
  }, {
    y: 12,
    x: 1,
    type: TYPES.standard
  }, {
    y: 12,
    x: 2,
    type: TYPES.doubleWord
  }, {
    y: 12,
    x: 3,
    type: TYPES.standard
  }, {
    y: 12,
    x: 4,
    type: TYPES.standard
  }, {
    y: 12,
    x: 5,
    type: TYPES.standard
  }, {
    y: 12,
    x: 6,
    type: TYPES.doubleLetter
  }, {
    y: 12,
    x: 7,
    type: TYPES.standard
  }, {
    y: 12,
    x: 8,
    type: TYPES.doubleLetter
  }, {
    y: 12,
    x: 9,
    type: TYPES.standard
  }, {
    y: 12,
    x: 10,
    type: TYPES.standard
  }, {
    y: 12,
    x: 11,
    type: TYPES.standard
  }, {
    y: 12,
    x: 12,
    type: TYPES.doubleWord
  }, {
    y: 12,
    x: 13,
    type: TYPES.standard
  }, {
    y: 12,
    x: 14,
    type: TYPES.standard
  }, {
    y: 13,
    x: 0,
    type: TYPES.standard
  }, {
    y: 13,
    x: 1,
    type: TYPES.doubleWord
  }, {
    y: 13,
    x: 2,
    type: TYPES.standard
  }, {
    y: 13,
    x: 3,
    type: TYPES.standard
  }, {
    y: 13,
    x: 4,
    type: TYPES.standard
  }, {
    y: 13,
    x: 5,
    type: TYPES.tripleLetter
  }, {
    y: 13,
    x: 6,
    type: TYPES.standard
  }, {
    y: 13,
    x: 7,
    type: TYPES.standard
  }, {
    y: 13,
    x: 8,
    type: TYPES.standard
  }, {
    y: 13,
    x: 9,
    type: TYPES.tripleLetter
  }, {
    y: 13,
    x: 10,
    type: TYPES.standard
  }, {
    y: 13,
    x: 11,
    type: TYPES.standard
  }, {
    y: 13,
    x: 12,
    type: TYPES.standard
  }, {
    y: 13,
    x: 13,
    type: TYPES.doubleWord
  }, {
    y: 13,
    x: 14,
    type: TYPES.standard
  }, {
    y: 14,
    x: 0,
    type: TYPES.tripleWord
  }, {
    y: 14,
    x: 1,
    type: TYPES.standard
  }, {
    y: 14,
    x: 2,
    type: TYPES.standard
  }, {
    y: 14,
    x: 3,
    type: TYPES.doubleLetter
  }, {
    y: 14,
    x: 4,
    type: TYPES.standard
  }, {
    y: 14,
    x: 5,
    type: TYPES.standard
  }, {
    y: 14,
    x: 6,
    type: TYPES.standard
  }, {
    y: 14,
    x: 7,
    type: TYPES.tripleWord
  }, {
    y: 14,
    x: 8,
    type: TYPES.standard
  }, {
    y: 14,
    x: 9,
    type: TYPES.standard
  }, {
    y: 14,
    x: 10,
    type: TYPES.standard
  }, {
    y: 14,
    x: 11,
    type: TYPES.doubleLetter
  }, {
    y: 14,
    x: 12,
    type: TYPES.standard
  }, {
    y: 14,
    x: 13,
    type: TYPES.standard
  }, {
    y: 14,
    x: 14,
    type: TYPES.tripleWord
  }];
  _exports.default = _default;
});
;define("litreka/data/letters", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = {
    "a": {
      "points": 1,
      "tiles": 9
    },
    "b": {
      "points": 3,
      "tiles": 2
    },
    "c": {
      "points": 3,
      "tiles": 2
    },
    "d": {
      "points": 2,
      "tiles": 4
    },
    "e": {
      "points": 1,
      "tiles": 12
    },
    "f": {
      "points": 4,
      "tiles": 2
    },
    "g": {
      "points": 2,
      "tiles": 3
    },
    "h": {
      "points": 4,
      "tiles": 2
    },
    "i": {
      "points": 1,
      "tiles": 9
    },
    "j": {
      "points": 8,
      "tiles": 1
    },
    "k": {
      "points": 5,
      "tiles": 1
    },
    "l": {
      "points": 1,
      "tiles": 4
    },
    "m": {
      "points": 3,
      "tiles": 2
    },
    "n": {
      "points": 1,
      "tiles": 6
    },
    "o": {
      "points": 1,
      "tiles": 8
    },
    "p": {
      "points": 3,
      "tiles": 2
    },
    "q": {
      "points": 10,
      "tiles": 1
    },
    "r": {
      "points": 1,
      "tiles": 6
    },
    "s": {
      "points": 1,
      "tiles": 4
    },
    "t": {
      "points": 1,
      "tiles": 6
    },
    "u": {
      "points": 1,
      "tiles": 4
    },
    "v": {
      "points": 4,
      "tiles": 2
    },
    "w": {
      "points": 4,
      "tiles": 2
    },
    "x": {
      "points": 8,
      "tiles": 1
    },
    "y": {
      "points": 4,
      "tiles": 2
    },
    "z": {
      "points": 10,
      "tiles": 1
    },
    "?": {
      "points": 0,
      "tiles": 2
    }
  };
  _exports.default = _default;
});
;define("litreka/helpers/and", ["exports", "ember-truth-helpers/helpers/and"], function (_exports, _and) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _and.default;
    }
  });
  Object.defineProperty(_exports, "and", {
    enumerable: true,
    get: function () {
      return _and.and;
    }
  });
});
;define("litreka/helpers/app-version", ["exports", "litreka/config/environment", "ember-cli-app-version/utils/regexp"], function (_exports, _environment, _regexp) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.appVersion = appVersion;
  _exports.default = void 0;

  function appVersion(_, hash = {}) {
    const version = _environment.default.APP.version; // e.g. 1.0.0-alpha.1+4jds75hf
    // Allow use of 'hideSha' and 'hideVersion' For backwards compatibility

    let versionOnly = hash.versionOnly || hash.hideSha;
    let shaOnly = hash.shaOnly || hash.hideVersion;
    let match = null;

    if (versionOnly) {
      if (hash.showExtended) {
        match = version.match(_regexp.versionExtendedRegExp); // 1.0.0-alpha.1
      } // Fallback to just version


      if (!match) {
        match = version.match(_regexp.versionRegExp); // 1.0.0
      }
    }

    if (shaOnly) {
      match = version.match(_regexp.shaRegExp); // 4jds75hf
    }

    return match ? match[0] : version;
  }

  var _default = Ember.Helper.helper(appVersion);

  _exports.default = _default;
});
;define("litreka/helpers/cancel-all", ["exports", "ember-concurrency/helpers/cancel-all"], function (_exports, _cancelAll) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _cancelAll.default;
    }
  });
});
;define("litreka/helpers/eq", ["exports", "ember-truth-helpers/helpers/equal"], function (_exports, _equal) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _equal.default;
    }
  });
  Object.defineProperty(_exports, "equal", {
    enumerable: true,
    get: function () {
      return _equal.equal;
    }
  });
});
;define("litreka/helpers/gt", ["exports", "ember-truth-helpers/helpers/gt"], function (_exports, _gt) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _gt.default;
    }
  });
  Object.defineProperty(_exports, "gt", {
    enumerable: true,
    get: function () {
      return _gt.gt;
    }
  });
});
;define("litreka/helpers/gte", ["exports", "ember-truth-helpers/helpers/gte"], function (_exports, _gte) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _gte.default;
    }
  });
  Object.defineProperty(_exports, "gte", {
    enumerable: true,
    get: function () {
      return _gte.gte;
    }
  });
});
;define("litreka/helpers/is-array", ["exports", "ember-truth-helpers/helpers/is-array"], function (_exports, _isArray) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isArray.default;
    }
  });
  Object.defineProperty(_exports, "isArray", {
    enumerable: true,
    get: function () {
      return _isArray.isArray;
    }
  });
});
;define("litreka/helpers/is-clipboard-supported", ["exports", "ember-cli-clipboard/helpers/is-clipboard-supported"], function (_exports, _isClipboardSupported) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isClipboardSupported.default;
    }
  });
  Object.defineProperty(_exports, "isClipboardSupported", {
    enumerable: true,
    get: function () {
      return _isClipboardSupported.isClipboardSupported;
    }
  });
});
;define("litreka/helpers/is-empty", ["exports", "ember-truth-helpers/helpers/is-empty"], function (_exports, _isEmpty) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isEmpty.default;
    }
  });
});
;define("litreka/helpers/is-equal", ["exports", "ember-truth-helpers/helpers/is-equal"], function (_exports, _isEqual) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isEqual.default;
    }
  });
  Object.defineProperty(_exports, "isEqual", {
    enumerable: true,
    get: function () {
      return _isEqual.isEqual;
    }
  });
});
;define("litreka/helpers/lt", ["exports", "ember-truth-helpers/helpers/lt"], function (_exports, _lt) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _lt.default;
    }
  });
  Object.defineProperty(_exports, "lt", {
    enumerable: true,
    get: function () {
      return _lt.lt;
    }
  });
});
;define("litreka/helpers/lte", ["exports", "ember-truth-helpers/helpers/lte"], function (_exports, _lte) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _lte.default;
    }
  });
  Object.defineProperty(_exports, "lte", {
    enumerable: true,
    get: function () {
      return _lte.lte;
    }
  });
});
;define("litreka/helpers/map-value", ["exports", "semantic-ui-ember/helpers/map-value"], function (_exports, _mapValue) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _mapValue.default;
    }
  });
  Object.defineProperty(_exports, "mapValue", {
    enumerable: true,
    get: function () {
      return _mapValue.mapValue;
    }
  });
});
;define("litreka/helpers/not-eq", ["exports", "ember-truth-helpers/helpers/not-equal"], function (_exports, _notEqual) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _notEqual.default;
    }
  });
  Object.defineProperty(_exports, "notEq", {
    enumerable: true,
    get: function () {
      return _notEqual.notEq;
    }
  });
});
;define("litreka/helpers/not", ["exports", "ember-truth-helpers/helpers/not"], function (_exports, _not) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _not.default;
    }
  });
  Object.defineProperty(_exports, "not", {
    enumerable: true,
    get: function () {
      return _not.not;
    }
  });
});
;define("litreka/helpers/or", ["exports", "ember-truth-helpers/helpers/or"], function (_exports, _or) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _or.default;
    }
  });
  Object.defineProperty(_exports, "or", {
    enumerable: true,
    get: function () {
      return _or.or;
    }
  });
});
;define("litreka/helpers/perform", ["exports", "ember-concurrency/helpers/perform"], function (_exports, _perform) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _perform.default;
    }
  });
});
;define("litreka/helpers/pluralize", ["exports", "ember-inflector/lib/helpers/pluralize"], function (_exports, _pluralize) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = _pluralize.default;
  _exports.default = _default;
});
;define("litreka/helpers/singularize", ["exports", "ember-inflector/lib/helpers/singularize"], function (_exports, _singularize) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = _singularize.default;
  _exports.default = _default;
});
;define("litreka/helpers/task", ["exports", "ember-concurrency/helpers/task"], function (_exports, _task) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _task.default;
    }
  });
});
;define("litreka/helpers/xor", ["exports", "ember-truth-helpers/helpers/xor"], function (_exports, _xor) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _xor.default;
    }
  });
  Object.defineProperty(_exports, "xor", {
    enumerable: true,
    get: function () {
      return _xor.xor;
    }
  });
});
;define("litreka/initializers/app-version", ["exports", "ember-cli-app-version/initializer-factory", "litreka/config/environment"], function (_exports, _initializerFactory, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  let name, version;

  if (_environment.default.APP) {
    name = _environment.default.APP.name;
    version = _environment.default.APP.version;
  }

  var _default = {
    name: 'App Version',
    initialize: (0, _initializerFactory.default)(name, version)
  };
  _exports.default = _default;
});
;define("litreka/initializers/container-debug-adapter", ["exports", "ember-resolver/resolvers/classic/container-debug-adapter"], function (_exports, _containerDebugAdapter) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = {
    name: 'container-debug-adapter',

    initialize() {
      let app = arguments[1] || arguments[0];
      app.register('container-debug-adapter:main', _containerDebugAdapter.default);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }

  };
  _exports.default = _default;
});
;define("litreka/initializers/coordinator-setup", ["exports", "litreka/models/coordinator"], function (_exports, _coordinator) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = {
    name: "setup coordinator",
    initialize: function () {
      let app = arguments[1] || arguments[0];
      app.register("drag:coordinator", _coordinator.default);
      app.inject("component", "coordinator", "drag:coordinator");
    }
  };
  _exports.default = _default;
});
;define("litreka/initializers/ember-concurrency", ["exports", "ember-concurrency/initializers/ember-concurrency"], function (_exports, _emberConcurrency) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _emberConcurrency.default;
    }
  });
});
;define("litreka/initializers/ember-data", ["exports", "ember-data/setup-container", "ember-data"], function (_exports, _setupContainer, _emberData) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /*
  
    This code initializes Ember-Data onto an Ember application.
  
    If an Ember.js developer defines a subclass of DS.Store on their application,
    as `App.StoreService` (or via a module system that resolves to `service:store`)
    this code will automatically instantiate it and make it available on the
    router.
  
    Additionally, after an application's controllers have been injected, they will
    each have the store made available to them.
  
    For example, imagine an Ember.js application with the following classes:
  
    ```app/services/store.js
    import DS from 'ember-data';
  
    export default DS.Store.extend({
      adapter: 'custom'
    });
    ```
  
    ```app/controllers/posts.js
    import { Controller } from '@ember/controller';
  
    export default Controller.extend({
      // ...
    });
  
    When the application is initialized, `ApplicationStore` will automatically be
    instantiated, and the instance of `PostsController` will have its `store`
    property set to that instance.
  
    Note that this code will only be run if the `ember-application` package is
    loaded. If Ember Data is being used in an environment other than a
    typical application (e.g., node.js where only `ember-runtime` is available),
    this code will be ignored.
  */
  var _default = {
    name: 'ember-data',
    initialize: _setupContainer.default
  };
  _exports.default = _default;
});
;define("litreka/initializers/export-application-global", ["exports", "litreka/config/environment"], function (_exports, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.initialize = initialize;
  _exports.default = void 0;

  function initialize() {
    var application = arguments[1] || arguments[0];

    if (_environment.default.exportApplicationGlobal !== false) {
      var theGlobal;

      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _environment.default.exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember.String.classify(_environment.default.modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;
        application.reopen({
          willDestroy: function () {
            this._super.apply(this, arguments);

            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  var _default = {
    name: 'export-application-global',
    initialize: initialize
  };
  _exports.default = _default;
});
;define("litreka/instance-initializers/ember-data", ["exports", "ember-data/initialize-store-service"], function (_exports, _initializeStoreService) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = {
    name: 'ember-data',
    initialize: _initializeStoreService.default
  };
  _exports.default = _default;
});
;define("litreka/mixins/base", ["exports", "semantic-ui-ember/mixins/base"], function (_exports, _base) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _base.default;
    }
  });
});
;define("litreka/models/cell", ["exports", "litreka/data/board-layout"], function (_exports, _boardLayout) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Object.extend({
    gameState: Ember.inject.service(),
    isDoubleWord: Ember.computed.equal('type', _boardLayout.TYPES.doubleWord),
    isTripleWord: Ember.computed.equal('type', _boardLayout.TYPES.tripleWord),
    isDoubleLetter: Ember.computed.equal('type', _boardLayout.TYPES.doubleLetter),
    isTripleLetter: Ember.computed.equal('type', _boardLayout.TYPES.tripleLetter),
    isStartingPoint: Ember.computed.equal('type', _boardLayout.TYPES.startingPoint),
    x: null,
    y: null,
    letter: null,
    unpersisted: true,
    isEmpty: Ember.computed.none('letter'),
    notEmpty: Ember.computed.not('isEmpty'),

    serialize() {
      return this.getProperties(['x', 'y', 'letter', 'unpersisted', 'type']);
    },

    hasPersistedLetter: Ember.computed('unpersisted', 'notEmpty', function () {
      return this.get('notEmpty') && !this.get('unpersisted');
    }),

    persistedCellInDirection(deltaX, deltaY) {
      let x = this.get('x') + deltaX;
      let y = this.get('y') + deltaY;

      if (!this.isCoordinateInBounds(x, y)) {
        return null;
      }

      let cell = this.get('gameState').cellAt(x, y);

      if (cell.get('notEmpty')) {
        return cell;
      }
    },

    furthestLetterLeft() {
      return this.furthestLetterInDirection(-1, 0);
    },

    furthestLetterRight() {
      return this.furthestLetterInDirection(1, 0);
    },

    furthestLetterUp() {
      return this.furthestLetterInDirection(0, -1);
    },

    furthestLetterDown() {
      return this.furthestLetterInDirection(0, 1);
    },

    furthestLetterInDirection(deltaX, deltaY) {
      let cell = this;

      while (cell !== null) {
        let nextCell = cell.persistedCellInDirection(deltaX, deltaY);

        if (Ember.isNone(nextCell)) {
          break;
        }

        cell = nextCell;
      }

      return cell;
    },

    isCoordinateInBounds(x, y) {
      return x >= 0 && y >= 0 && x < 15 && y < 15;
    },

    adjacentToPersistedCell() {
      let x = this.get('x');
      let y = this.get('y');
      return [x - 1, x + 1].some(x => {
        return [y - 1, y + 1].some(y => {
          return this.isCoordinateInBounds(x, y) && this.get('gameState').cellAt(x, y).get('hasPersistedLetter');
        });
      });
    }

  });

  _exports.default = _default;
});
;define("litreka/models/coordinator", ["exports", "litreka/models/obj-hash"], function (_exports, _objHash) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Object.extend(Ember.Evented, {
    objectMap: Ember.computed(function () {
      return _objHash.default.create();
    }),
    getObject: function (id, ops) {
      ops = ops || {};
      var payload = this.get('objectMap').getObj(id);

      if (payload.ops.source) {
        payload.ops.source.sendAction('action', payload.obj);
      }

      if (payload.ops.target) {
        payload.ops.target.sendAction('action', payload.obj);
      }

      this.trigger("objectMoved", {
        obj: payload.obj,
        source: payload.ops.source,
        target: ops.target
      });
      return payload.obj;
    },
    setObject: function (obj, ops) {
      ops = ops || {};
      return this.get('objectMap').add({
        obj: obj,
        ops: ops
      });
    }
  });

  _exports.default = _default;
});
;define("litreka/models/move", ["exports", "litreka/data/letters", "litreka/data/board-layout"], function (_exports, _letters, _boardLayout) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Object.extend({
    gameState: Ember.inject.service(),

    init() {
      if (Ember.isNone(this.get('cells'))) {
        this.set('cells', Ember.A());
      }

      if (Ember.isNone(this.get('scores'))) {
        this.set('scores', Ember.A());
      }
    },

    completedAt: null,

    serialize() {
      return {
        cells: this.get('cells').map(c => c.serialize()),
        completedAt: this.get('completedAt'),
        playerId: this.get('playerId'),
        scores: this.get('scores')
      };
    },

    isHorizontal: Ember.computed('cells.[]', function () {
      let cells = this.get('cells');
      let firstCell = this.get('cells.firstObject');
      let yLocations = cells.mapBy('y');
      return yLocations.uniq().length === 1 && firstCell.furthestLetterLeft() !== firstCell.furthestLetterRight();
    }),
    isVertical: Ember.computed('cells.[]', function () {
      let cells = this.get('cells');
      let firstCell = this.get('cells.firstObject');
      let xLocations = cells.mapBy('x');
      return xLocations.uniq().length === 1 && firstCell.furthestLetterUp() !== firstCell.furthestLetterDown();
    }),
    isValidMove: Ember.computed('hasValidPlacement', 'isHorizontallyValid', 'isVerticallyValid', function () {
      return this.get('hasValidPlacement') && (this.get('isHorizontallyValid') || this.get('isVerticallyValid'));
    }),
    hasValidPlacement: Ember.computed('cells.[]', function () {
      return this.get('cells').some(cell => cell.get('isStartingPoint')) || this.get('cells').some(cell => cell.adjacentToPersistedCell());
    }),
    horizontalCells: Ember.computed('isHorizontal', 'cells.[]', function () {
      if (this.get('isHorizontal')) {
        let cell = this.get('cells.firstObject');
        let leftmostCell = cell.furthestLetterLeft();
        let rightmostCell = cell.furthestLetterRight();
        return this.cellsBetween(leftmostCell, rightmostCell);
      }
    }),
    verticalCells: Ember.computed('isVertical', 'cells.[]', function () {
      if (this.get('isVertical')) {
        let cell = this.get('cells.firstObject');
        let upmostCell = cell.furthestLetterUp();
        let downmostCell = cell.furthestLetterDown();
        return this.cellsBetween(upmostCell, downmostCell);
      }
    }),

    cellsBetween(cell1, cell2) {
      let isVertical = cell1.get('x') === cell2.get('x');
      let cellsBetween = Ember.A();
      let x = cell1.get('x'),
          y = cell1.get('y');

      while (x <= cell2.get('x') && y <= cell2.get('y')) {
        cellsBetween.pushObject(this.get('gameState').cellAt(x, y));

        if (isVertical) {
          ++y;
        } else {
          ++x;
        }
      }

      return cellsBetween;
    },

    isHorizontallyValid: Ember.computed('isHorizontal', 'horizontalCells', function () {
      if (this.get('isHorizontal')) {
        return this.get('horizontalCells').every(cell => cell.get('notEmpty'));
      } else {
        return false;
      }
    }),
    isVerticallyValid: Ember.computed('isVertical', 'verticalCells', function () {
      if (this.get('isVertical')) {
        return this.get('verticalCells').every(cell => cell.get('notEmpty'));
      } else {
        return false;
      }
    }),
    mainScorableWord: Ember.computed('cells.[]', function () {
      return this.get('isHorizontal') ? this.get('horizontalCells') : this.get('verticalCells');
    }),
    additionalScorableWords: Ember.computed('isValidMove', 'cells.[]', function () {
      if (!this.get('isValidMove')) {
        return [];
      }

      let scorableWords = Ember.A();
      this.get('cells').forEach(cell => {
        let cell1 = this.get('isHorizontal') ? cell.furthestLetterUp() : cell.furthestLetterLeft();
        let cell2 = this.get('isHorizontal') ? cell.furthestLetterDown() : cell.furthestLetterRight();

        if (cell1 !== cell2) {
          scorableWords.push(this.cellsBetween(cell1, cell2));
        }
      });
      return scorableWords;
    }),

    generateScore(cells, options = {}) {
      let letters = cells.map(cell => {
        let letterPoints = _letters.default[cell.get('letter').toLowerCase()].points;

        let playerPlacedCell = this.get('cells').includes(cell);

        if (cell.get('isDoubleLetter') && playerPlacedCell) {
          return {
            letter: cell.get('letter'),
            points: letterPoints * 2,
            special: _boardLayout.TYPES.doubleLetter
          };
        } else if (cell.get('isTripleLetter') && playerPlacedCell) {
          return {
            letter: cell.get('letter'),
            points: letterPoints * 3,
            special: _boardLayout.TYPES.tripleLetter
          };
        } else if (cell.get('isDoubleWord') && playerPlacedCell) {
          return {
            letter: cell.get('letter'),
            points: letterPoints,
            special: _boardLayout.TYPES.doubleWord
          };
        } else if (cell.get('isTripleWord') && playerPlacedCell) {
          return {
            letter: cell.get('letter'),
            points: letterPoints,
            special: _boardLayout.TYPES.tripleWord
          };
        } else {
          return {
            letter: cell.get('letter'),
            points: letterPoints,
            special: 0
          };
        }
      });
      let doubleWordCells = cells.filter(cell => cell.get('isDoubleWord') && cell.get('unpersisted'));
      let tripleWordCells = cells.filter(cell => cell.get('isTripleWord') && cell.get('unpersisted'));
      let score = {
        doubleWords: new Array(doubleWordCells.length),
        tripleWords: new Array(tripleWordCells.length),
        bonus: false,
        letters
      };
      let points = letters.reduce((total, element) => total += element.points, 0);
      doubleWordCells.forEach(() => points *= 2);
      tripleWordCells.forEach(() => points *= 3);

      if (this.get('cells.length') === 7 && options.canBonus) {
        points += 50;
        score.bonus = true;
      }

      score.points = points;
      return score;
    },

    generateAllScores() {
      let scores = Ember.A();

      if (this.get('mainScorableWord')) {
        scores.pushObject(this.generateScore(this.get('mainScorableWord'), {
          canBonus: true
        }));
      }

      this.get('additionalScorableWords').forEach(sw => scores.pushObject(this.generateScore(sw)));
      this.set('scores', scores || []);
    }

  });

  _exports.default = _default;
});
;define("litreka/models/obj-hash", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Object.extend({
    contentLength: 0,
    length: Ember.computed.alias('contentLength'),
    init: function () {
      this._super();

      this.content = {};
    },
    add: function (obj) {
      var id = this.generateId();
      this.get('content')[id] = obj;
      this.incrementProperty("contentLength");
      return id;
    },
    getObj: function (key) {
      var res = this.get('content')[key];

      if (!res) {
        throw "no obj for key " + key;
      }

      return res;
    },
    generateId: function () {
      var num = Math.random() * 1000000000000.0;
      num = parseInt(num);
      num = "" + num;
      return num;
    },
    keys: function () {
      var res = [];

      for (var key in this.get('content')) {
        res.push(key);
      }

      return Ember.A(res);
    }
  });

  _exports.default = _default;
});
;define("litreka/resolver", ["exports", "ember-resolver"], function (_exports, _emberResolver) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = _emberResolver.default;
  _exports.default = _default;
});
;define("litreka/router", ["exports", "litreka/config/environment"], function (_exports, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const Router = Ember.Router.extend({
    location: _environment.default.locationType,
    rootURL: _environment.default.rootURL
  });
  Router.map(function () {
    this.route('game', function () {
      this.route('board');
      this.route('waiting');
      this.route('connect', {
        path: ':id'
      });
    });
  });
  var _default = Router;
  _exports.default = _default;
});
;define("litreka/routes/application", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Route.extend({
    connectionService: Ember.inject.service(),
    gameState: Ember.inject.service(),

    beforeModel(transition) {
      window.LitrekaRoute = this;
      this.get('connectionService').initialize();
      this.get('gameState').initReceiver();
      this.get('connectionService').on('connected', () => {
        this.get('gameState').initialize();
      });

      if (transition.intent.url == "/") {
        this.transitionTo('game.waiting');
      }
    }

  });

  _exports.default = _default;
});
;define("litreka/routes/game/board", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Route.extend({
    gameState: Ember.inject.service(),
    connectionService: Ember.inject.service(),

    beforeModel() {
      if (this.get('connectionService.isNotConnected')) {
        this.transitionTo('game.waiting');
      }
    }

  });

  _exports.default = _default;
});
;define("litreka/routes/game/connect", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Route.extend({
    connectionService: Ember.inject.service(),
    gameState: Ember.inject.service(),

    model(data) {
      this.get('connectionService').on('connected', () => {
        this.transitionTo('game.board');
      });
      this.get('connectionService').connect(data.id);
    }

  });

  _exports.default = _default;
});
;define("litreka/routes/game/waiting", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Route.extend({
    connectionService: Ember.inject.service(),

    activate() {
      this.get('connectionService').on('connected', () => this.transitionTo('game.board'));
    }

  });

  _exports.default = _default;
});
;define("litreka/services/ajax", ["exports", "ember-ajax/services/ajax"], function (_exports, _ajax) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _ajax.default;
    }
  });
});
;define("litreka/services/connection-service", ["exports", "peerjs", "ember-concurrency"], function (_exports, _peerjs, _emberConcurrency) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const PEER_SERVER_KEY = 'lwjd5qra8257b9';

  var _default = Ember.Service.extend(Ember.Evented, {
    gameState: Ember.inject.service(),
    hasInitialized: false,

    initialize(id = null) {
      if (this.get('peer')) {
        return;
      }

      let peer = new _peerjs.default(id, {
        key: PEER_SERVER_KEY
      });
      console.log('Initializing connection service');
      peer.on('open', id => {
        this.set('peerId', id);
        this.set('gameState.playerId', id);
        console.log('Peer id: ', id);
      });
      peer.on('connection', connection => this._setupConnection(connection, true));
      this.set('peer', peer);
    },

    initializeStreamingPeer() {
      let peer = new _peerjs.default({
        key: PEER_SERVER_KEY
      });
      this.set('streamingPeer', peer);
    },

    isNotConnected: Ember.computed.none('connection'),

    _setupConnection(connection, isMaster) {
      console.log('setup connection');
      this.set('remotePeerId', connection.peer);
      this.get('attemptReconnection').cancelAll();
      this.set('connectionClosed', false);
      this.set('isMaster', isMaster);
      this.set('connection', connection);
      connection.on('data', data => this.trigger('received', data));
      connection.on('close', () => {
        this.get('attemptReconnection').perform();
      });
      console.log('connected!');
      this.trigger('connected');

      if (this.get('hadPreviousConnection')) {
        this.trigger('reconnected');
      } else {
        this.set('hadPreviousConnection', true);
      }
    },

    attemptReconnection: (0, _emberConcurrency.task)(function* () {
      this.get('peer').destroy();
      yield (0, _emberConcurrency.timeout)(1000);
      this.initialize(this.get('peerId'));
      yield (0, _emberConcurrency.timeout)(1000);

      if (!this.get('isMaster')) {
        yield (0, _emberConcurrency.timeout)(1000);
      }

      console.log('attempting reconnection');
      this.reconnect();
      yield (0, _emberConcurrency.timeout)(5000);
      this.set('connectionClosed', true);
      this.trigger('closed');
    }),

    connect(peerId) {
      let connection = this.get('peer').connect(peerId);

      this._setupConnection(connection, false);
    },

    reconnect() {
      if (!this.get('isMaster')) {
        let connection = this.get('peer').connect(this.get('remotePeerId'));

        this._setupConnection(connection, this.get('isMaster'));
      } else {
        console.log('waiting for slave reconnection');
      }
    },

    forceReconnect() {
      this.get('connection').close();
    }

  });

  _exports.default = _default;
});
;define("litreka/services/drag-coordinator", ["exports", "ember-drag-drop/services/drag-coordinator"], function (_exports, _dragCoordinator) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = _dragCoordinator.default;
  _exports.default = _default;
});
;define("litreka/services/game-state", ["exports", "litreka/data/board-layout", "litreka/data/letters", "litreka/models/cell", "litreka/models/move"], function (_exports, _boardLayout, _letters, _cell, _move) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const LS_KEY = 'ongoingGame';

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
  }

  var _default = Ember.Service.extend({
    connectionService: Ember.inject.service(),

    initReceiver() {
      this.get('connectionService').on('received', data => this.setStateFromJSON(data));
    },

    initialize() {
      let playerId = this.get('connectionService.peer.id');
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

    playerMoves: Ember.computed('moves.@each.playerId', function () {
      return this.get('moves').filter(m => m.get('playerId') === this.get('playerId'));
    }),
    opponentMoves: Ember.computed('moves.@each.playerId', function () {
      return this.get('moves').filter(m => m.get('playerId') === this.get('opponentId'));
    }),

    syncState(delay = 200) {
      Ember.run.later(this, () => {
        console.log('syncState');
        this.get('connectionService.connection').send(this.dataSyncPacket());
        localStorage.setItem(LS_KEY, this.localStorageSync());
      }, delay);
    },

    setStateFromLocalStorage(game) {
      this.setStateFromJSON(game);
      this.get('moves').forEach(move => {
        if (game.playerId === move.playerId) {
          move.set('playerId', this.get('playerId'));
        } else {
          move.set('playerId', this.get('opponentId'));
        }
      });
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
      return _cell.default.create(cellData, {
        container: Ember.getOwner(this)
      });
    },

    deserializeMove(moveData) {
      let move = _move.default.create(moveData, {
        container: Ember.getOwner(this)
      });

      move.cells = moveData.cells.map(cell => this.cellAt(cell.x, cell.y));
      return move;
    },

    newGame() {
      let letterBag = Object.keys(_letters.default).map(letter => {
        return new Array(_letters.default[letter].tiles).fill(letter.toUpperCase());
      }).flat();
      this.set('isPlayerMove', Math.random() > 0.5);
      letterBag = shuffle(letterBag);
      this.set('letterBag', letterBag);
      this.set('cells', _boardLayout.default.map(cellData => _cell.default.create(cellData, {
        container: Ember.getOwner(this)
      })));
      this.set('playerLetters', this.takeLetters(7));
      this.set('opponentLetters', this.takeLetters(7));
      this.set('moves', [_move.default.create({
        playerId: this.get('isPlayerMove') ? this.get('playerId') : this.get('opponentId'),
        container: Ember.getOwner(this)
      })]);
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
        isPlayerMove: this.get('isPlayerMove')
      });
    },

    dataSyncPacket() {
      return {
        letterBag: this.get('letterBag'),
        cells: this.get('cells').map(c => c.serialize()),
        moves: this.get('moves').map(m => m.serialize()),
        playerLetters: this.get('opponentLetters'),
        opponentLetters: this.get('playerLetters'),
        isPlayerMove: !this.get('isPlayerMove')
      };
    },

    completeMove() {
      let activeMove = this.get('moves.lastObject');
      activeMove.set('completedAt', new Date().getTime());
      activeMove.get('cells').setEach('unpersisted', false);
      this.get('playerLetters').pushObjects(this.takeLetters(activeMove.get('cells.length')));
      this.get('moves').pushObject(new _move.default({
        container: Ember.getOwner(this),
        playerId: this.get('opponentId')
      }));
      this.set('isPlayerMove', false);
      this.syncState();
    },

    letterPoints(letter) {
      return _letters.default[letter].points;
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
      return x + y * 15;
    }

  });

  _exports.default = _default;
});
;define("litreka/templates/application", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "fDy1+vjn",
    "block": "{\"symbols\":[],\"statements\":[[1,[21,\"outlet\"],false],[0,\"\\n\"]],\"hasEval\":false}",
    "meta": {
      "moduleName": "litreka/templates/application.hbs"
    }
  });

  _exports.default = _default;
});
;define("litreka/templates/components/draggable-object-target", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "VnYdEOWY",
    "block": "{\"symbols\":[\"&default\"],\"statements\":[[4,\"if\",[[23,[\"enableClicking\"]]],null,{\"statements\":[[0,\"  \"],[7,\"a\"],[11,\"href\",\"#\"],[9],[0,\"\\n    \"],[14,1],[0,\"\\n  \"],[3,\"action\",[[22,0,[]],\"acceptForDrop\"]],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"  \"],[14,1],[0,\"\\n\"]],\"parameters\":[]}]],\"hasEval\":false}",
    "meta": {
      "moduleName": "litreka/templates/components/draggable-object-target.hbs"
    }
  });

  _exports.default = _default;
});
;define("litreka/templates/components/draggable-object", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "4k/gVrPF",
    "block": "{\"symbols\":[\"&default\"],\"statements\":[[4,\"if\",[[23,[\"enableClicking\"]]],null,{\"statements\":[[0,\"  \"],[7,\"a\"],[11,\"href\",\"#\"],[9],[0,\"\\n    \"],[14,1],[0,\"\\n  \"],[3,\"action\",[[22,0,[]],\"selectForDrag\"]],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"  \"],[14,1],[0,\"\\n\"]],\"parameters\":[]}]],\"hasEval\":false}",
    "meta": {
      "moduleName": "litreka/templates/components/draggable-object.hbs"
    }
  });

  _exports.default = _default;
});
;define("litreka/templates/components/game-board-cell", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "3lGUM2z6",
    "block": "{\"symbols\":[],\"statements\":[[4,\"if\",[[23,[\"cell\",\"isEmpty\"]]],null,{\"statements\":[[4,\"draggable-object-target\",null,[[\"action\"],[[27,\"action\",[[22,0,[]],\"placeLetter\"],null]]],{\"statements\":[],\"parameters\":[]},null]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[27,\"not-eq\",[[23,[\"cell\",\"letter\"]],\"?\"],null]],null,{\"statements\":[[0,\"    \"],[1,[23,[\"cell\",\"letter\"]],false],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"  \"],[1,[27,\"letter-points\",null,[[\"letter\"],[[23,[\"cell\",\"letter\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]}]],\"hasEval\":false}",
    "meta": {
      "moduleName": "litreka/templates/components/game-board-cell.hbs"
    }
  });

  _exports.default = _default;
});
;define("litreka/templates/components/game-board", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "n3dop/7u",
    "block": "{\"symbols\":[\"cell\"],\"statements\":[[4,\"each\",[[23,[\"gameState\",\"cells\"]]],null,{\"statements\":[[0,\"  \"],[1,[27,\"game-board-cell\",null,[[\"cell\"],[[22,1,[]]]]],false],[0,\"\\n\"]],\"parameters\":[1]},null]],\"hasEval\":false}",
    "meta": {
      "moduleName": "litreka/templates/components/game-board.hbs"
    }
  });

  _exports.default = _default;
});
;define("litreka/templates/components/letter-points", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "Kb6BjLUe",
    "block": "{\"symbols\":[],\"statements\":[[1,[21,\"points\"],false],[0,\"\\n\"]],\"hasEval\":false}",
    "meta": {
      "moduleName": "litreka/templates/components/letter-points.hbs"
    }
  });

  _exports.default = _default;
});
;define("litreka/templates/components/letter-stand", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "yw5+xEbV",
    "block": "{\"symbols\":[\"group\",\"letter\",\"index\"],\"statements\":[[0,\"\\n\"],[4,\"sortable-group\",null,[[\"class\",\"direction\",\"onChange\"],[\"layout__box o__has-columns\",\"x\",[27,\"action\",[[22,0,[]],\"updateList\"],null]]],{\"statements\":[[4,\"each\",[[23,[\"gameState\",\"playerLetters\"]]],null,{\"statements\":[[4,\"sortable-item\",null,[[\"model\",\"group\",\"handle\"],[[22,2,[]],[22,1,[]],\".letter-stand-dragger\"]],{\"statements\":[[4,\"draggable-object\",null,[[\"content\"],[[27,\"hash\",null,[[\"letter\",\"index\"],[[22,2,[]],[22,3,[]]]]]]],{\"statements\":[[0,\"        \"],[7,\"div\"],[11,\"class\",\"letter-stand-cell\"],[9],[0,\"\\n\"],[4,\"if\",[[27,\"not-eq\",[[22,2,[]],\"?\"],null]],null,{\"statements\":[[0,\"            \"],[1,[22,2,[]],false],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"          \"],[1,[27,\"letter-points\",null,[[\"letter\"],[[22,2,[]]]]],false],[0,\"\\n        \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"      \"],[7,\"div\"],[11,\"class\",\"letter-stand-dragger\"],[9],[0,\"\\n        \"],[7,\"svg\"],[11,\"xmlns\",\"http://www.w3.org/2000/svg\",\"http://www.w3.org/2000/xmlns/\"],[11,\"preserveAspectRatio\",\"xMidYMid\"],[11,\"width\",\"12\"],[11,\"height\",\"13\"],[11,\"viewBox\",\"0 0 12 13\"],[9],[7,\"path\"],[11,\"d\",\"M0 0h2v2H0zm5 0h2v2H5zm5 0h2v2h-2zM0 5h2v2H0zm5 0h2v2H5zm5 0h2v2h-2zM0 10h2v2H0zm5 0h2v2H5zm5 0h2v2h-2z\"],[9],[10],[10],[0,\"\\n      \"],[10],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[2,3]},null]],\"parameters\":[1]},null],[0,\"\\n\"],[0,\"\\n\"]],\"hasEval\":false}",
    "meta": {
      "moduleName": "litreka/templates/components/letter-stand.hbs"
    }
  });

  _exports.default = _default;
});
;define("litreka/templates/components/object-bin", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "XfVnZYW6",
    "block": "{\"symbols\":[\"obj\",\"&default\"],\"statements\":[[4,\"draggable-object-target\",null,[[\"action\"],[[27,\"action\",[[22,0,[]],\"handleObjectDropped\"],null]]],{\"statements\":[[0,\"  \"],[7,\"div\"],[11,\"class\",\"object-bin-title\"],[9],[1,[21,\"name\"],false],[10],[0,\"\\n  \"],[7,\"br\"],[9],[10],[0,\"\\n\"],[4,\"each\",[[23,[\"model\"]]],null,{\"statements\":[[4,\"draggable-object\",null,[[\"action\",\"content\"],[\"handleObjectDragged\",[22,1,[]]]],{\"statements\":[[0,\"      \"],[14,2,[[22,1,[]]]],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[1]},null]],\"parameters\":[]},null]],\"hasEval\":false}",
    "meta": {
      "moduleName": "litreka/templates/components/object-bin.hbs"
    }
  });

  _exports.default = _default;
});
;define("litreka/templates/components/opponent-webcam", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "XVjQFoVP",
    "block": "{\"symbols\":[],\"statements\":[],\"hasEval\":false}",
    "meta": {
      "moduleName": "litreka/templates/components/opponent-webcam.hbs"
    }
  });

  _exports.default = _default;
});
;define("litreka/templates/components/scores-list", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "6WVTY/gQ",
    "block": "{\"symbols\":[\"move\",\"score\",\"letterInfo\"],\"statements\":[[7,\"p\"],[11,\"class\",\"score-small-header\"],[9],[1,[21,\"player\"],false],[10],[0,\"\\n\"],[7,\"h1\"],[11,\"class\",\"score-points score-big-header \"],[9],[1,[21,\"total\"],false],[10],[0,\"\\n\"],[7,\"hr\"],[11,\"style\",\"width: 100%\"],[9],[10],[0,\"\\n\"],[4,\"each\",[[23,[\"moves\"]]],null,{\"statements\":[[4,\"each\",[[22,1,[\"scores\"]]],null,{\"statements\":[[0,\"    \"],[7,\"div\"],[11,\"class\",\"layout__box o__has-columns o__centers-vertically\"],[9],[0,\"\\n      \"],[7,\"h1\"],[12,\"class\",[28,[\"score-points \",[27,\"unless\",[[22,1,[\"completedAt\"]],\"uncompleted\"],null]]]],[9],[1,[22,2,[\"points\"]],false],[10],[0,\"\\n\"],[4,\"each\",[[22,2,[\"letters\"]]],null,{\"statements\":[[0,\"        \"],[7,\"div\"],[12,\"class\",[28,[\"letter-stand-cell score-cell o__\",[22,3,[\"special\"]]]]],[9],[0,\"\\n\"],[4,\"if\",[[27,\"not-eq\",[[22,3,[\"letter\"]],\"?\"],null]],null,{\"statements\":[[0,\"            \"],[1,[22,3,[\"letter\"]],false],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"          \"],[1,[27,\"letter-points\",null,[[\"letter\"],[[22,3,[\"letter\"]]]]],false],[0,\"\\n        \"],[10],[0,\"\\n\"]],\"parameters\":[3]},null],[4,\"each\",[[22,2,[\"doubleWords\"]]],null,{\"statements\":[[0,\"        \"],[7,\"div\"],[11,\"class\",\"letter-stand-cell score-cell o__double-word\"],[9],[0,\"\\n          x2\\n        \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"each\",[[22,2,[\"tripleWords\"]]],null,{\"statements\":[[0,\"        \"],[7,\"div\"],[11,\"class\",\"letter-stand-cell score-cell o__triple-word\"],[9],[0,\"\\n          x3\\n        \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[22,2,[\"bonus\"]]],null,{\"statements\":[[0,\"        \"],[7,\"div\"],[11,\"class\",\"letter-stand-cell score-cell o__bonus\"],[9],[0,\"\\n          +50\\n        \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"    \"],[10],[0,\"\\n\"]],\"parameters\":[2]},null]],\"parameters\":[1]},null]],\"hasEval\":false}",
    "meta": {
      "moduleName": "litreka/templates/components/scores-list.hbs"
    }
  });

  _exports.default = _default;
});
;define("litreka/templates/components/sortable-objects", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "UEzKPdko",
    "block": "{\"symbols\":[\"&default\"],\"statements\":[[14,1]],\"hasEval\":false}",
    "meta": {
      "moduleName": "litreka/templates/components/sortable-objects.hbs"
    }
  });

  _exports.default = _default;
});
;define("litreka/templates/game/board", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "fA9ICBjZ",
    "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"class\",\"layout__box o__flexes-to-1 o__has-columns\"],[9],[0,\"\\n  \"],[7,\"div\"],[11,\"class\",\"resync-button\"],[9],[0,\"\\n    \"],[7,\"button\"],[11,\"class\",\"ui inverted button\"],[12,\"onclick\",[27,\"action\",[[22,0,[]],\"manualSync\"],null]],[9],[0,\"\\n      resync\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n  \"],[1,[21,\"game-board\"],false],[0,\"\\n  \"],[7,\"div\"],[11,\"class\",\"layout__box o__flexes-to-1 o__has-rows\"],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"class\",\"layout__box o__flexes-to-1 o__centers-horizontally\"],[9],[0,\"\\n      \"],[1,[21,\"opponent-webcam\"],false],[0,\"\\n    \"],[10],[0,\"\\n    \"],[7,\"div\"],[11,\"class\",\"layout__box o__flexes-to-1 o__has-rows  o__scrolls\"],[9],[0,\"\\n      \"],[7,\"div\"],[11,\"class\",\"layout__box o__has-columns o__flexes-to-1\"],[9],[0,\"\\n        \"],[1,[27,\"scores-list\",null,[[\"moves\",\"player\"],[[23,[\"gameState\",\"playerMoves\"]],\"You\"]]],false],[0,\"\\n        \"],[1,[27,\"scores-list\",null,[[\"moves\",\"player\"],[[23,[\"gameState\",\"opponentMoves\"]],\"Them\"]]],false],[0,\"\\n      \"],[10],[0,\"\\n    \"],[10],[0,\"\\n    \"],[7,\"button\"],[11,\"class\",\"ui inverted button\"],[12,\"onclick\",[27,\"action\",[[22,0,[]],\"completeMove\"],null]],[9],[0,\"\\n\"],[4,\"if\",[[23,[\"gameState\",\"isPlayerMove\"]]],null,{\"statements\":[[0,\"        Finish turn\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"        Waiting for turn...\\n\"]],\"parameters\":[]}],[0,\"    \"],[10],[0,\"\\n    \"],[7,\"div\"],[11,\"class\",\"letter-count layout__box o__centers-all\"],[9],[0,\"\\n      \"],[1,[23,[\"gameState\",\"letterBag\",\"length\"]],false],[0,\" letters left...\\n    \"],[10],[0,\"\\n    \"],[7,\"div\"],[11,\"class\",\"layout__box o__centers-horizontally\"],[9],[0,\"\\n      \"],[1,[21,\"letter-stand\"],false],[0,\"\\n    \"],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}",
    "meta": {
      "moduleName": "litreka/templates/game/board.hbs"
    }
  });

  _exports.default = _default;
});
;define("litreka/templates/game/connect", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "LVR+YUSh",
    "block": "{\"symbols\":[],\"statements\":[[1,[21,\"outlet\"],false]],\"hasEval\":false}",
    "meta": {
      "moduleName": "litreka/templates/game/connect.hbs"
    }
  });

  _exports.default = _default;
});
;define("litreka/templates/game/waiting", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "lwqXyIIa",
    "block": "{\"symbols\":[\"letter\"],\"statements\":[[7,\"style\"],[9],[0,\"\\n.snowflake {\\n  color: #fff;\\n  font-size: 1em;\\n  pointer-events: none;\\n}\\n\\n@-webkit-keyframes snowflakes-fall{0%{top:-10%}100%{top:100%}}@-webkit-keyframes snowflakes-shake{0%,100%{-webkit-transform:translateX(0);transform:translateX(0)}50%{-webkit-transform:translateX(80px);transform:translateX(80px)}}@keyframes snowflakes-fall{0%{top:-10%}100%{top:100%}}@keyframes snowflakes-shake{0%,100%{transform:translateX(0)}50%{transform:translateX(80px)}}.snowflake{position:fixed;top:-10%;z-index:1;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:default;-webkit-animation-name:snowflakes-fall,snowflakes-shake;-webkit-animation-duration:10s,3s;-webkit-animation-timing-function:linear,ease-in-out;-webkit-animation-iteration-count:infinite,infinite;-webkit-animation-play-state:running,running;animation-name:snowflakes-fall,snowflakes-shake;animation-duration:10s,3s;animation-timing-function:linear,ease-in-out;animation-iteration-count:infinite,infinite;animation-play-state:running,running}.snowflake:nth-of-type(0){left:1%;-webkit-animation-delay:0s,0s;animation-delay:0s,0s}.snowflake:nth-of-type(1){left:10%;-webkit-animation-delay:1s,1s;animation-delay:1s,1s}.snowflake:nth-of-type(2){left:20%;-webkit-animation-delay:6s,.5s;animation-delay:6s,.5s}.snowflake:nth-of-type(3){left:30%;-webkit-animation-delay:4s,2s;animation-delay:4s,2s}.snowflake:nth-of-type(4){left:40%;-webkit-animation-delay:2s,2s;animation-delay:2s,2s}.snowflake:nth-of-type(5){left:50%;-webkit-animation-delay:8s,3s;animation-delay:8s,3s}.snowflake:nth-of-type(6){left:60%;-webkit-animation-delay:6s,2s;animation-delay:6s,2s}.snowflake:nth-of-type(7){left:70%;-webkit-animation-delay:2.5s,1s;animation-delay:2.5s,1s}.snowflake:nth-of-type(8){left:80%;-webkit-animation-delay:1s,0s;animation-delay:1s,0s}.snowflake:nth-of-type(9){left:90%;-webkit-animation-delay:3s,1.5s;animation-delay:3s,1.5s}.snowflake:nth-of-type(10){left:25%;-webkit-animation-delay:2s,0s;animation-delay:2s,0s}.snowflake:nth-of-type(11){left:65%;-webkit-animation-delay:4s,2.5s;animation-delay:4s,2.5s}\\n\"],[10],[0,\"\\n\"],[7,\"div\"],[11,\"class\",\"snowflakes\"],[11,\"aria-hidden\",\"true\"],[9],[0,\"\\n\"],[4,\"each\",[[23,[\"letters\"]]],null,{\"statements\":[[0,\"    \"],[7,\"div\"],[11,\"class\",\"snowflake\"],[9],[0,\"\\n      \"],[7,\"div\"],[11,\"class\",\"letter-stand-cell\"],[9],[0,\"\\n        \"],[1,[22,1,[]],false],[0,\"\\n        \"],[1,[27,\"letter-points\",null,[[\"letter\"],[[22,1,[]]]]],false],[0,\"\\n      \"],[10],[0,\"\\n    \"],[10],[0,\"\\n\"]],\"parameters\":[1]},null],[10],[0,\"\\n\\n\"],[7,\"div\"],[11,\"class\",\"layout__box o__flexes-to-1 o__has-rows o__centers-all z__10\"],[9],[0,\"\\n  \"],[7,\"div\"],[11,\"class\",\"layout__box o__has-rows t__centered\"],[9],[0,\"\\n    \"],[7,\"h1\"],[11,\"class\",\"waiting__header\"],[9],[0,\"LITREKA\"],[10],[0,\"\\n    \"],[7,\"h3\"],[11,\"class\",\"white waiting__sub-header\"],[9],[0,\"Everyone's favourite word game!\"],[10],[0,\"\\n    \"],[7,\"p\"],[11,\"class\",\"ui white\"],[9],[0,\"Have your friend go here\"],[10],[0,\"\\n    \"],[7,\"code\"],[11,\"class\",\"waiting__link u__mb__20\"],[9],[1,[21,\"url\"],false],[10],[0,\"\\n\"],[4,\"copy-button\",null,[[\"clipboardText\",\"title\",\"classNames\",\"success\"],[[23,[\"url\"]],\"Copy link\",\"ui inverted button\",[27,\"action\",[[22,0,[]],\"copied\"],null]]],{\"statements\":[[4,\"if\",[[23,[\"copied\"]]],null,{\"statements\":[[0,\"        Copied!\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"        Copy link\\n\"]],\"parameters\":[]}]],\"parameters\":[]},null],[0,\"  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[7,\"div\"],[11,\"class\",\"waiting__for-pam\"],[9],[0,\"\\n  Made with ❤️ for Pam\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}",
    "meta": {
      "moduleName": "litreka/templates/game/waiting.hbs"
    }
  });

  _exports.default = _default;
});
;

;define('litreka/config/environment', [], function() {
  var prefix = 'litreka';
try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(unescape(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

});

;
          if (!runningTests) {
            require("litreka/app")["default"].create({"name":"litreka","version":"0.0.0+8a6c00e0"});
          }
        
//# sourceMappingURL=litreka.map
