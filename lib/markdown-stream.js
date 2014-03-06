var MarkdownStreamView;

MarkdownStreamView = require('./markdown-stream-view');

module.exports = {
  markdownStreamView: null,
  activate: function(state)
  {
    return this.markdownStreamView = new MarkdownStreamView(state.markdownStreamViewState);
  },
  deactivate: function()
  {
    return this.markdownStreamView.destroy();
  },
  serialize: function()
  {
    return {
      markdownStreamViewState: this.markdownStreamView.serialize()
    };
  }
};
