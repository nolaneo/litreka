'use strict';

define("litreka/tests/helpers/data-transfer", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var c = Ember.Object.extend({
    getData: function () {
      return this.get('payload');
    },
    setData: function (dataType, payload) {
      this.set("data", {
        dataType: dataType,
        payload: payload
      });
    }
  });
  c.reopenClass({
    makeMockEvent: function (payload) {
      var transfer = this.create({
        payload: payload
      });
      var res = {
        dataTransfer: transfer
      };

      res.preventDefault = function () {
        console.log('prevent default');
      };

      res.stopPropagation = function () {
        console.log('stop propagation');
      };

      return res;
    },
    createDomEvent: function (type) {
      var event = document.createEvent("CustomEvent");
      event.initCustomEvent(type, true, true, null);
      event.dataTransfer = {
        data: {},
        setData: function (type, val) {
          this.data[type] = val;
        },
        getData: function (type) {
          return this.data[type];
        }
      };
      return event;
    }
  });
  var _default = c;
  _exports.default = _default;
});
define("litreka/tests/helpers/drag-drop", ["exports", "ember-native-dom-helpers", "litreka/tests/helpers/mock-event"], function (_exports, _emberNativeDomHelpers, _mockEvent) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.drag = drag;

  async function dragOver(dropSelector, moves) {
    moves = moves || [[{
      clientX: 1,
      clientY: 1
    }, dropSelector]];
    return moves.forEach(async ([position, selector]) => {
      let event = new _mockEvent.default(position);
      await (0, _emberNativeDomHelpers.triggerEvent)(selector || dropSelector, 'dragover', event);
    });
  }

  async function drop(dragSelector, dragEvent, options) {
    let {
      drop: dropSelector,
      dropEndOptions,
      dragOverMoves
    } = options;
    let dropElement = await (0, _emberNativeDomHelpers.find)(dropSelector);

    if (!dropElement) {
      throw `There are no drop targets by the given selector: '${dropSelector}'`;
    }

    await dragOver(dropSelector, dragOverMoves);

    if (options.beforeDrop) {
      await options.beforeDrop.call();
    }

    let event = new _mockEvent.default().useDataTransferData(dragEvent);
    await (0, _emberNativeDomHelpers.triggerEvent)(dropSelector, 'drop', event);
    return await (0, _emberNativeDomHelpers.triggerEvent)(dragSelector, 'dragend', dropEndOptions);
  }

  async function drag(dragSelector, options = {}) {
    let dragEvent = new _mockEvent.default(options.dragStartOptions);
    await (0, _emberNativeDomHelpers.triggerEvent)(dragSelector, 'mouseover');
    await (0, _emberNativeDomHelpers.triggerEvent)(dragSelector, 'dragstart', dragEvent);

    if (options.afterDrag) {
      await options.afterDrag.call();
    }

    if (options.drop) {
      await drop(dragSelector, dragEvent, options);
    }
  }
});
define("litreka/tests/helpers/ember-cli-clipboard", ["exports", "ember-cli-clipboard/test-support"], function (_exports, _testSupport) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.triggerSuccess = triggerSuccess;
  _exports.triggerError = triggerError;
  _exports.default = _default;

  const getOwnerFromContext = c => c.container || c.owner;
  /* === Legacy Integration Test Helpers === */

  /**
   * Fires `success` action for an instance of a copy-button component
   * @function triggerSuccess
   * @param {Object} context - integration test’s this context
   * @param {String} selector - css selector of the copy-button instance
   * @returns {Void}
   */


  function triggerSuccess(context, selector) {
    const owner = getOwnerFromContext(context);
    (0, _testSupport._fireComponentAction)(owner, selector, 'success');
  }
  /**
   * Fires `error` action for an instance of a copy-button component
   * @function triggerError
   * @param {Object} context - integration test’s this context
   * @param {String} selector - css selector of the copy-button instance
   * @returns {Void}
   */


  function triggerError(context, selector) {
    const owner = getOwnerFromContext(context);
    (0, _testSupport._fireComponentAction)(owner, selector, 'error');
  }
  /* === Register Legacy Acceptance Test Helpers === */


  function _default() {
    Ember.Test.registerAsyncHelper('triggerCopySuccess', function (app, selector) {
      const owner = app.__container__;
      (0, _testSupport._fireComponentAction)(owner, selector, 'success');
    });
    Ember.Test.registerAsyncHelper('triggerCopyError', function (app, selector) {
      const owner = app.__container__;
      (0, _testSupport._fireComponentAction)(owner, selector, 'error');
    });
  }
});
define("litreka/tests/helpers/ember-drag-drop", ["exports", "litreka/tests/helpers/data-transfer"], function (_exports, _dataTransfer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.drag = drag;

  /* global triggerEvent , andThen */
  function drop($dragHandle, dropCssPath, dragEvent) {
    let $dropTarget = Ember.$(dropCssPath);

    if ($dropTarget.length === 0) {
      throw `There are no drop targets by the given selector: '${dropCssPath}'`;
    }

    Ember.run(() => {
      triggerEvent($dropTarget, 'dragover', _dataTransfer.default.makeMockEvent());
    });
    Ember.run(() => {
      triggerEvent($dropTarget, 'drop', _dataTransfer.default.makeMockEvent(dragEvent.dataTransfer.get('data.payload')));
    });
    Ember.run(() => {
      triggerEvent($dragHandle, 'dragend', _dataTransfer.default.makeMockEvent());
    });
  }

  function drag(cssPath, options = {}) {
    let dragEvent = _dataTransfer.default.makeMockEvent();

    let $dragHandle = Ember.$(cssPath);
    Ember.run(() => {
      triggerEvent($dragHandle, 'mouseover');
    });
    Ember.run(() => {
      triggerEvent($dragHandle, 'dragstart', dragEvent);
    });
    andThen(function () {
      if (options.beforeDrop) {
        options.beforeDrop.call();
      }
    });
    andThen(function () {
      if (options.drop) {
        drop($dragHandle, options.drop, dragEvent);
      }
    });
  }
});
define("litreka/tests/helpers/ember-sortable/test-helpers", ["ember-sortable/helpers/drag", "ember-sortable/helpers/reorder", "ember-sortable/helpers/waiters"], function (_drag, _reorder, _waiters) {
  "use strict";
});
define("litreka/tests/helpers/mock-event", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.createDomEvent = createDomEvent;
  _exports.default = void 0;

  class DataTransfer {
    constructor() {
      this.data = {};
    }

    setData(type, value) {
      this.data[type] = value;
      return this;
    }

    getData(type = "Text") {
      return this.data[type];
    }

    setDragImage() {}

  }

  class MockEvent {
    constructor(options = {}) {
      this.dataTransfer = new DataTransfer();
      this.dataTransfer.setData('Text', options.dataTransferData);
      this.setProperties(options);
    }

    useDataTransferData(otherEvent) {
      this.dataTransfer.setData('Text', otherEvent.dataTransfer.getData());
      return this;
    }

    setProperties(props) {
      for (let prop in props) {
        this[prop] = props[prop];
      }

      return this;
    }

    preventDefault() {}

    stopPropagation() {}

  }

  _exports.default = MockEvent;

  function createDomEvent(type) {
    let event = document.createEvent("CustomEvent");
    event.initCustomEvent(type, true, true, null);
    event.dataTransfer = new DataTransfer();
    return event;
  }
});
define("litreka/tests/integration/components/game-board-cell-test", ["qunit", "ember-qunit", "@ember/test-helpers"], function (_qunit, _emberQunit, _testHelpers) {
  "use strict";

  (0, _qunit.module)('Integration | Component | game-board-cell', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });
      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "trkZMu6I",
        "block": "{\"symbols\":[],\"statements\":[[1,[21,\"game-board-cell\"],false]],\"hasEval\":false}",
        "meta": {}
      }));
      assert.equal(this.element.textContent.trim(), ''); // Template block usage:

      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "C6O2Clcl",
        "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"game-board-cell\",null,null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
        "meta": {}
      }));
      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define("litreka/tests/integration/components/game-board-test", ["qunit", "ember-qunit", "@ember/test-helpers"], function (_qunit, _emberQunit, _testHelpers) {
  "use strict";

  (0, _qunit.module)('Integration | Component | game-board', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });
      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "iwewjatt",
        "block": "{\"symbols\":[],\"statements\":[[1,[21,\"game-board\"],false]],\"hasEval\":false}",
        "meta": {}
      }));
      assert.equal(this.element.textContent.trim(), ''); // Template block usage:

      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "yurJiRHj",
        "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"game-board\",null,null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
        "meta": {}
      }));
      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define("litreka/tests/integration/components/letter-score-test", ["qunit", "ember-qunit", "@ember/test-helpers"], function (_qunit, _emberQunit, _testHelpers) {
  "use strict";

  (0, _qunit.module)('Integration | Component | letter-score', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });
      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "U0LNUAV/",
        "block": "{\"symbols\":[],\"statements\":[[1,[21,\"letter-score\"],false]],\"hasEval\":false}",
        "meta": {}
      }));
      assert.equal(this.element.textContent.trim(), ''); // Template block usage:

      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "QTqnsvmS",
        "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"letter-score\",null,null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
        "meta": {}
      }));
      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define("litreka/tests/integration/components/letter-stand-test", ["qunit", "ember-qunit", "@ember/test-helpers"], function (_qunit, _emberQunit, _testHelpers) {
  "use strict";

  (0, _qunit.module)('Integration | Component | letter-stand', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });
      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "38kEiiWc",
        "block": "{\"symbols\":[],\"statements\":[[1,[21,\"letter-stand\"],false]],\"hasEval\":false}",
        "meta": {}
      }));
      assert.equal(this.element.textContent.trim(), ''); // Template block usage:

      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "T27gAtvX",
        "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"letter-stand\",null,null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
        "meta": {}
      }));
      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define("litreka/tests/integration/components/scores-list-test", ["qunit", "ember-qunit", "@ember/test-helpers"], function (_qunit, _emberQunit, _testHelpers) {
  "use strict";

  (0, _qunit.module)('Integration | Component | scores-list', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });
      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "QhScEBTi",
        "block": "{\"symbols\":[],\"statements\":[[1,[21,\"scores-list\"],false]],\"hasEval\":false}",
        "meta": {}
      }));
      assert.equal(this.element.textContent.trim(), ''); // Template block usage:

      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "FcNATAwR",
        "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"scores-list\",null,null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
        "meta": {}
      }));
      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define("litreka/tests/integration/components/webcam-test", ["qunit", "ember-qunit", "@ember/test-helpers"], function (_qunit, _emberQunit, _testHelpers) {
  "use strict";

  (0, _qunit.module)('Integration | Component | webcam', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);
    (0, _qunit.test)('it renders', async function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.set('myAction', function(val) { ... });
      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "r50S2zHn",
        "block": "{\"symbols\":[],\"statements\":[[1,[21,\"webcam\"],false]],\"hasEval\":false}",
        "meta": {}
      }));
      assert.equal(this.element.textContent.trim(), ''); // Template block usage:

      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "FZwElTcV",
        "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"webcam\",null,null,{\"statements\":[[0,\"        template block text\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
        "meta": {}
      }));
      assert.equal(this.element.textContent.trim(), 'template block text');
    });
  });
});
define("litreka/tests/lint/app.lint-test", [], function () {
  "use strict";

  QUnit.module('ESLint | app');
  QUnit.test('app.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'app.js should pass ESLint\n\n');
  });
  QUnit.test('components/game-board-cell.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/game-board-cell.js should pass ESLint\n\n');
  });
  QUnit.test('components/game-board.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/game-board.js should pass ESLint\n\n');
  });
  QUnit.test('components/letter-points.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/letter-points.js should pass ESLint\n\n');
  });
  QUnit.test('components/letter-stand.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/letter-stand.js should pass ESLint\n\n');
  });
  QUnit.test('components/opponent-webcam.js', function (assert) {
    assert.expect(1);
    assert.ok(false, 'components/opponent-webcam.js should pass ESLint\n\n16:5 - Unexpected console statement. (no-console)\n19:7 - Unexpected console statement. (no-console)\n47:7 - Unexpected console statement. (no-console)\n48:7 - Unexpected console statement. (no-console)');
  });
  QUnit.test('components/scores-list.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/scores-list.js should pass ESLint\n\n');
  });
  QUnit.test('controllers/game/board.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'controllers/game/board.js should pass ESLint\n\n');
  });
  QUnit.test('controllers/game/waiting.js', function (assert) {
    assert.expect(1);
    assert.ok(false, 'controllers/game/waiting.js should pass ESLint\n\n17:3 - Only string, number, symbol, boolean, null, undefined, and function are allowed as default properties (ember/avoid-leaking-state-in-ember-objects)');
  });
  QUnit.test('data/board-layout.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'data/board-layout.js should pass ESLint\n\n');
  });
  QUnit.test('data/letters.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'data/letters.js should pass ESLint\n\n');
  });
  QUnit.test('models/cell.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/cell.js should pass ESLint\n\n');
  });
  QUnit.test('models/move.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/move.js should pass ESLint\n\n');
  });
  QUnit.test('resolver.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'resolver.js should pass ESLint\n\n');
  });
  QUnit.test('router.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'router.js should pass ESLint\n\n');
  });
  QUnit.test('routes/application.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/application.js should pass ESLint\n\n');
  });
  QUnit.test('routes/game/board.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/game/board.js should pass ESLint\n\n');
  });
  QUnit.test('routes/game/connect.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/game/connect.js should pass ESLint\n\n');
  });
  QUnit.test('routes/game/waiting.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/game/waiting.js should pass ESLint\n\n');
  });
  QUnit.test('services/connection-service.js', function (assert) {
    assert.expect(1);
    assert.ok(false, 'services/connection-service.js should pass ESLint\n\n20:5 - Unexpected console statement. (no-console)\n24:7 - Unexpected console statement. (no-console)\n38:5 - Unexpected console statement. (no-console)\n48:5 - Unexpected console statement. (no-console)\n65:5 - Unexpected console statement. (no-console)\n84:7 - Unexpected console statement. (no-console)');
  });
  QUnit.test('services/game-state.js', function (assert) {
    assert.expect(1);
    assert.ok(false, 'services/game-state.js should pass ESLint\n\n50:7 - Unexpected console statement. (no-console)\n64:7 - Unexpected console statement. (no-console)\n82:5 - Unexpected console statement. (no-console)');
  });
});
define("litreka/tests/lint/templates.template.lint-test", [], function () {
  "use strict";

  QUnit.module('TemplateLint');
  QUnit.test('litreka/templates/application.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'litreka/templates/application.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('litreka/templates/components/game-board-cell.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'litreka/templates/components/game-board-cell.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('litreka/templates/components/game-board.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'litreka/templates/components/game-board.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('litreka/templates/components/letter-points.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'litreka/templates/components/letter-points.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('litreka/templates/components/letter-stand.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'litreka/templates/components/letter-stand.hbs should pass TemplateLint.\n\nlitreka/templates/components/letter-stand.hbs\n  5:19  error  you must use double quotes in templates  quotes\n');
  });
  QUnit.test('litreka/templates/components/opponent-webcam.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'litreka/templates/components/opponent-webcam.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('litreka/templates/components/scores-list.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'litreka/templates/components/scores-list.hbs should pass TemplateLint.\n\nlitreka/templates/components/scores-list.hbs\n  3:4  error  elements cannot have inline styles  no-inline-styles\n  7:56  error  you must use double quotes in templates  quotes\n');
  });
  QUnit.test('litreka/templates/game/board.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'litreka/templates/game/board.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('litreka/templates/game/connect.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'litreka/templates/game/connect.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('litreka/templates/game/waiting.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'litreka/templates/game/waiting.hbs should pass TemplateLint.\n\nlitreka/templates/game/waiting.hbs\n  1:7  error  Incorrect indentation for `\n.snowflake {\n  color: #fff;\n  font-size: 1em;\n  pointer-events: none;\n}\n\n@-webkit-keyframes snowflakes-fall{0%{top:-10%}100%{top:100%}}@-webkit-keyframes snowflakes-shake{0%,100%{-webkit-transform:translateX(0);transform:translateX(0)}50%{-webkit-transform:translateX(80px);transform:translateX(80px)}}@keyframes snowflakes-fall{0%{top:-10%}100%{top:100%}}@keyframes snowflakes-shake{0%,100%{transform:translateX(0)}50%{transform:translateX(80px)}}.snowflake{position:fixed;top:-10%;z-index:1;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:default;-webkit-animation-name:snowflakes-fall,snowflakes-shake;-webkit-animation-duration:10s,3s;-webkit-animation-timing-function:linear,ease-in-out;-webkit-animation-iteration-count:infinite,infinite;-webkit-animation-play-state:running,running;animation-name:snowflakes-fall,snowflakes-shake;animation-duration:10s,3s;animation-timing-function:linear,ease-in-out;animation-iteration-count:infinite,infinite;animation-play-state:running,running}.snowflake:nth-of-type(0){left:1%;-webkit-animation-delay:0s,0s;animation-delay:0s,0s}.snowflake:nth-of-type(1){left:10%;-webkit-animation-delay:1s,1s;animation-delay:1s,1s}.snowflake:nth-of-type(2){left:20%;-webkit-animation-delay:6s,.5s;animation-delay:6s,.5s}.snowflake:nth-of-type(3){left:30%;-webkit-animation-delay:4s,2s;animation-delay:4s,2s}.snowflake:nth-of-type(4){left:40%;-webkit-animation-delay:2s,2s;animation-delay:2s,2s}.snowflake:nth-of-type(5){left:50%;-webkit-animation-delay:8s,3s;animation-delay:8s,3s}.snowflake:nth-of-type(6){left:60%;-webkit-animation-delay:6s,2s;animation-delay:6s,2s}.snowflake:nth-of-type(7){left:70%;-webkit-animation-delay:2.5s,1s;animation-delay:2.5s,1s}.snowflake:nth-of-type(8){left:80%;-webkit-animation-delay:1s,0s;animation-delay:1s,0s}.snowflake:nth-of-type(9){left:90%;-webkit-animation-delay:3s,1.5s;animation-delay:3s,1.5s}.snowflake:nth-of-type(10){left:25%;-webkit-animation-delay:2s,0s;animation-delay:2s,0s}.snowflake:nth-of-type(11){left:65%;-webkit-animation-delay:4s,2.5s;animation-delay:4s,2.5s}\n` beginning at L1:C7. Expected `\n.snowflake {\n  color: #fff;\n  font-size: 1em;\n  pointer-events: none;\n}\n\n@-webkit-keyframes snowflakes-fall{0%{top:-10%}100%{top:100%}}@-webkit-keyframes snowflakes-shake{0%,100%{-webkit-transform:translateX(0);transform:translateX(0)}50%{-webkit-transform:translateX(80px);transform:translateX(80px)}}@keyframes snowflakes-fall{0%{top:-10%}100%{top:100%}}@keyframes snowflakes-shake{0%,100%{transform:translateX(0)}50%{transform:translateX(80px)}}.snowflake{position:fixed;top:-10%;z-index:1;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:default;-webkit-animation-name:snowflakes-fall,snowflakes-shake;-webkit-animation-duration:10s,3s;-webkit-animation-timing-function:linear,ease-in-out;-webkit-animation-iteration-count:infinite,infinite;-webkit-animation-play-state:running,running;animation-name:snowflakes-fall,snowflakes-shake;animation-duration:10s,3s;animation-timing-function:linear,ease-in-out;animation-iteration-count:infinite,infinite;animation-play-state:running,running}.snowflake:nth-of-type(0){left:1%;-webkit-animation-delay:0s,0s;animation-delay:0s,0s}.snowflake:nth-of-type(1){left:10%;-webkit-animation-delay:1s,1s;animation-delay:1s,1s}.snowflake:nth-of-type(2){left:20%;-webkit-animation-delay:6s,.5s;animation-delay:6s,.5s}.snowflake:nth-of-type(3){left:30%;-webkit-animation-delay:4s,2s;animation-delay:4s,2s}.snowflake:nth-of-type(4){left:40%;-webkit-animation-delay:2s,2s;animation-delay:2s,2s}.snowflake:nth-of-type(5){left:50%;-webkit-animation-delay:8s,3s;animation-delay:8s,3s}.snowflake:nth-of-type(6){left:60%;-webkit-animation-delay:6s,2s;animation-delay:6s,2s}.snowflake:nth-of-type(7){left:70%;-webkit-animation-delay:2.5s,1s;animation-delay:2.5s,1s}.snowflake:nth-of-type(8){left:80%;-webkit-animation-delay:1s,0s;animation-delay:1s,0s}.snowflake:nth-of-type(9){left:90%;-webkit-animation-delay:3s,1.5s;animation-delay:3s,1.5s}.snowflake:nth-of-type(10){left:25%;-webkit-animation-delay:2s,0s;animation-delay:2s,0s}.snowflake:nth-of-type(11){left:65%;-webkit-animation-delay:4s,2.5s;animation-delay:4s,2.5s}\n` to be at an indentation of 2 but was found at 0.  block-indentation\n  29:12  error  you must use double quotes in templates  quotes\n');
  });
});
define("litreka/tests/lint/tests.lint-test", [], function () {
  "use strict";

  QUnit.module('ESLint | tests');
  QUnit.test('integration/components/game-board-cell-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/game-board-cell-test.js should pass ESLint\n\n');
  });
  QUnit.test('integration/components/game-board-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/game-board-test.js should pass ESLint\n\n');
  });
  QUnit.test('integration/components/letter-score-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/letter-score-test.js should pass ESLint\n\n');
  });
  QUnit.test('integration/components/letter-stand-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/letter-stand-test.js should pass ESLint\n\n');
  });
  QUnit.test('integration/components/scores-list-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/scores-list-test.js should pass ESLint\n\n');
  });
  QUnit.test('integration/components/webcam-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/webcam-test.js should pass ESLint\n\n');
  });
  QUnit.test('test-helper.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'test-helper.js should pass ESLint\n\n');
  });
  QUnit.test('unit/controllers/game/board-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/controllers/game/board-test.js should pass ESLint\n\n');
  });
  QUnit.test('unit/controllers/game/waiting-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/controllers/game/waiting-test.js should pass ESLint\n\n');
  });
  QUnit.test('unit/routes/application-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/application-test.js should pass ESLint\n\n');
  });
  QUnit.test('unit/routes/game/board-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/game/board-test.js should pass ESLint\n\n');
  });
  QUnit.test('unit/routes/game/connect-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/game/connect-test.js should pass ESLint\n\n');
  });
  QUnit.test('unit/routes/game/waiting-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/game/waiting-test.js should pass ESLint\n\n');
  });
  QUnit.test('unit/services/game-state-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/services/game-state-test.js should pass ESLint\n\n');
  });
  QUnit.test('unit/services/peer-service-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/services/peer-service-test.js should pass ESLint\n\n');
  });
});
define("litreka/tests/test-helper", ["litreka/app", "litreka/config/environment", "@ember/test-helpers", "ember-qunit"], function (_app, _environment, _testHelpers, _emberQunit) {
  "use strict";

  (0, _testHelpers.setApplication)(_app.default.create(_environment.default.APP));
  (0, _emberQunit.start)();
});
define("litreka/tests/unit/controllers/game/board-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Controller | game/board', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let controller = this.owner.lookup('controller:game/board');
      assert.ok(controller);
    });
  });
});
define("litreka/tests/unit/controllers/game/waiting-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Controller | game/waiting', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let controller = this.owner.lookup('controller:game/waiting');
      assert.ok(controller);
    });
  });
});
define("litreka/tests/unit/routes/application-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | application', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:application');
      assert.ok(route);
    });
  });
});
define("litreka/tests/unit/routes/game/board-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | game/board', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:game/board');
      assert.ok(route);
    });
  });
});
define("litreka/tests/unit/routes/game/connect-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | game/connect', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:game/connect');
      assert.ok(route);
    });
  });
});
define("litreka/tests/unit/routes/game/waiting-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | game/waiting', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:game/waiting');
      assert.ok(route);
    });
  });
});
define("litreka/tests/unit/services/game-state-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Service | game-state', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let service = this.owner.lookup('service:game-state');
      assert.ok(service);
    });
  });
});
define("litreka/tests/unit/services/peer-service-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Service | peer-service', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let service = this.owner.lookup('service:peer-service');
      assert.ok(service);
    });
  });
});
define('litreka/config/environment', [], function() {
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

require('litreka/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;
//# sourceMappingURL=tests.map
