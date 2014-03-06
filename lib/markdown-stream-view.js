var MarkdownStreamView, View,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('atom').View;

module.exports = MarkdownStreamView = (function(_super) {
  __extends(MarkdownStreamView, _super);

  function MarkdownStreamView() {
    return MarkdownStreamView.__super__.constructor.apply(this, arguments);
  }

  MarkdownStreamView.content = function() {
    return this.div({
      'class': 'markdown-stream overlay from-top'
    }, (function(_this) {
      return function() {
        return _this.div('The MarkdownStream package is Alive! It\'s ALIVE!', {
          'class': 'message'
        });
      };
    })(this));
  };

  MarkdownStreamView.prototype.initialize = function(serializeState) {
    return atom.workspaceView.command('markdown-stream:toggle', (function(_this) {
      return function() {
        return _this.toggle();
      };
    })(this));
  };

  MarkdownStreamView.prototype.serialize = function() {};

  MarkdownStreamView.prototype.destroy = function() {
    return this.detach();
  };

  MarkdownStreamView.prototype.toggle = function() {
    console.log('MarkdownStreamView was toggled!');
    if (this.hasParent()) {
      return this.detach();
    } else {
      return atom.workspaceView.append(this);
    }
  };

  return MarkdownStreamView;

})(View);
