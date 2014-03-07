module.exports = {
  configDefaults:
  {
    testval: 5,
    Mode: false
  },
  activate: function(state)
  {
    console.log(' Activated');
    // var activeView = atom.workspaceView.find('.editor.active');
    atom
      .workspaceView
      .eachEditorView(function(editorView)
      {
        console.log('editorView');

        editorView
          .on('focusout', function()
          {
            console.log('focusout ');
          })
          .on('focusin', function()
          {
            setTimeout(function()
            {
              var editor = editorView.getEditor();
              var uri = editor.getUri();


              console.log('focusin ' + uri);
            }, 500);

          });
      });

  },
  deactivate: function() {}
};