var HTTPserver;
var Port = 8000;

module.exports = {
  activate: function(state)
  {
    console.log(' Activated');

    if (!atom.config.get('markdown-stream.externalWebBrowserPort'))
    {
      alert('MarkdownStream is successfully installed!');
      atom.config.set('markdown-stream.externalWebBrowserPort', Port);
      atom.config.set('markdown-stream.markedSettings',
      {
        "gfm": true,
        "breaks": true,
        "tables": true,
        "pedantic": true,
        "sanitize": false,
        "smartLists": false,
        "smartypants": true,
        "langPrefix": "lang-"
      });
      atom.config.set('markdown-stream.newlinesAsIsMode', false);

    }

    var obj = {
      txt: null
    };

    HTTPserver =
      httpServer(require('path')
        .join(__dirname, 'www'));
    console.log('server www path set');

    var port = atom.config.get('markdown-stream.externalWebBrowserPort');
    HTTPserver
      .listen(port, function()
      {
        console.log('HTTP listening:' + port);
        //---------------
        var wsPort = port + 1;
        console.log('wsServer port: ' + wsPort);

        var WebSocket = require('ws');
        var WebSocketStream = require('stream-websocket');

        var webSocketServer =
          new WebSocket.Server(
          {
            port: wsPort
          })
          .on('connection',
            function(ws)
            {
              var c = new WebSocketStream(ws);
              var d = require('rpc-streamx');

              c
                .pipe(d(
                {
                  connect: function(val, f) // must keep this format
                  {
                    console.log('rpc:connect is called!');

                    f('connected');
                  },
                  settings: function(val, f) // must keep this format
                  {
                    console.log('rpc:settings is called!');

                    var getSendSetting = function()
                    {
                      var data = {
                        marked: atom.config.get('markdown-stream.markedSettings'),
                        newlinesAsIsMode: atom.config.get('markdown-stream.newlinesAsIsMode')
                      };
                      f(data);
                    };
                    getSendSetting();

                    atom.config.observe('markdown-stream', function()
                    {
                      getSendSetting();
                    });
                  },
                  bind: function(val, f) // must keep this format
                  {
                    console.log('rpc:bind is called!');

                    f(obj.txt);
                    Object.observe(obj, function(changes)
                    {
                      console.log('obj.txt changed');

                      f(obj.txt);
                    });
                  }

                }))
                .pipe(c)
                .on('close', function()
                {
                  console.log('c close');
                })
                .on('error', function()
                {
                  console.log('c error');
                })
                .on('finish', function()
                {
                  console.log('c finish');
                });
            });
        //---------------
        alert('MarkdownStream Preview in WebBrowser\n\nOPEN \n\n http://localhost:' + port + '\n\n(Firefox is recommended\n for performance issue)');
      })
      .on('error', function(err)
      {
        if (err.code === 'EADDRINUSE')
        {
          // port is currently in use
          console.log('server Open error:' + port);
          port += 2;
          HTTPserver
            .listen(port);
        }
      });
    //----------------------


    //----------------------

    atom
      .workspaceView
      .eachEditorView(function(editorView)
      {
        console.log('editorView');

        var editor = editorView.getEditor();
        var uri = editor.getUri();

        editor
          .on('contents-modified', function()
          {
            process.nextTick(function()
            {
              console.log('buffer modified');
              obj.txt = editor.getText();

            });
          });

        editorView
          .on('click', function()
          {
            console.log('editorView:click ');
            obj.txt = editor.getText();

          });

      });

    //------------
    var extension = function()
    {
      var uriA = uri.split('.');
      var extension;
      if (uriA.length === 0)
      {
        extension = null;
      }
      else
      {
        extension = uriA[uriA.length - 1];
      }

      console.log('extension:' + extension);

    };



  },
  deactivate: function()
  {
    try
    {
      HTTPserver.close(function()
      {
        console.log('server closed');
      });

    }
    catch (e)
    {
      console.log('server close error');
    }
  }
};

var httpServer = function(dir)
{
  var http = require('http');
  var fs = require('fs');
  var path = require("path");
  var url = require('url');

  var mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"
  };

  return http.createServer(function(req, res)
  {
    var uri = url.parse(req.url)
      .pathname;
    var filename = path.join(dir, unescape(uri));
    var indexFilename = path.join(dir, unescape('index.html'));
    var stats;

    console.log(filename);

    try
    {
      stats = fs.lstatSync(filename); // throws if path doesn't exist
    }
    catch (e)
    {
      res.writeHead(404,
      {
        'Content-Type': 'text/plain'
      });
      res.write('404 Not Found\n');
      res.end();
      return;
    }
    var fileStream;

    if (stats.isFile())
    {
      // path exists, is a file
      var mimeType = mimeTypes[path.extname(filename)
        .split(".")[1]];
      res.writeHead(200,
      {
        'Content-Type': mimeType
      });

      fileStream =
        fs.createReadStream(filename)
        .pipe(res);
    }
    else if (stats.isDirectory())
    {
      // path exists, is a directory
      res.writeHead(200,
      {
        'Content-Type': "text/html"
      });
      fileStream =
        fs.createReadStream(indexFilename)
        .pipe(res);
    }
    else
    {
      // Symbolic link, other?
      // TODO: follow symlinks?  security?
      res.writeHead(500,
      {
        'Content-Type': 'text/plain'
      });
      res.write('500 Internal server error\n');
      res.end();
    }

  });
};


//----------------------------

//https://github.com/jdarling/Object.observe
/*
  Tested against Chromium build with Object.observe and acts EXACTLY the same,
  though Chromium build is MUCH faster

  Trying to stay as close to the spec as possible,
  this is a work in progress, feel free to comment/update

  Specification:
    http://wiki.ecmascript.org/doku.php?id=harmony:observe

  Built using parts of:
    https://github.com/tvcutsem/harmony-reflect/blob/master/examples/observer.js

  Limits so far;
    Built using polling... Will update again with polling/getter&setters to make things better at some point

TODO:
  Add support for Object.prototype.watch -> https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/watch
*/
if (!Object.observe)
{
  (function(extend, global)
  {
    var isCallable = (function(toString)
    {
      var s = toString.call(toString),
        u = typeof u;
      return typeof global.alert === "object" ?
        function(f)
        {
          return s === toString.call(f) || ( !! f && typeof f.toString == u && typeof f.valueOf == u && /^\s*\bfunction\b/.test("" + f));
      } :
        function(f)
        {
          return s === toString.call(f);
      };
    })(extend.prototype.toString);
    // isNode & isElement from http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
    //Returns true if it is a DOM node

    function isNode(o)
    {
      return (
        typeof Node === "object" ? o instanceof Node :
        o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string"
      );
    }
    //Returns true if it is a DOM element

    function isElement(o)
    {
      return (
        typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
        o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
      );
    }
    var _isImmediateSupported = (function()
    {
      return !!global.setImmediate;
    })();
    var _doCheckCallback = (function()
    {
      if (_isImmediateSupported)
      {
        return function(f)
        {
          return setImmediate(f);
        };
      }
      else
      {
        return function(f)
        {
          return setTimeout(f, 10);
        };
      }
    })();
    var _clearCheckCallback = (function()
    {
      if (_isImmediateSupported)
      {
        return function(id)
        {
          clearImmediate(id);
        };
      }
      else
      {
        return function(id)
        {
          clearTimeout(id);
        };
      }
    })();
    var isNumeric = function(n)
    {
      return !isNaN(parseFloat(n)) && isFinite(n);
    };
    var sameValue = function(x, y)
    {
      if (x === y)
      {
        return x !== 0 || 1 / x === 1 / y;
      }
      return x !== x && y !== y;
    };
    var isAccessorDescriptor = function(desc)
    {
      if (typeof(desc) === 'undefined')
      {
        return false;
      }
      return ('get' in desc || 'set' in desc);
    };
    var isDataDescriptor = function(desc)
    {
      if (typeof(desc) === 'undefined')
      {
        return false;
      }
      return ('value' in desc || 'writable' in desc);
    };

    var validateArguments = function(O, callback)
    {
      if (typeof(O) !== 'object')
      {
        // Throw Error
        throw new TypeError("Object.observeObject called on non-object");
      }
      if (isCallable(callback) === false)
      {
        // Throw Error
        throw new TypeError("Object.observeObject: Expecting function");
      }
      if (Object.isFrozen(callback) === true)
      {
        // Throw Error
        throw new TypeError("Object.observeObject: Expecting unfrozen function");
      }
    };

    var Observer = (function()
    {
      var wraped = [];
      var Observer = function(O, callback)
      {
        validateArguments(O, callback);
        Object.getNotifier(O)
          .addListener(callback);
        if (wraped.indexOf(O) === -1)
        {
          wraped.push(O);
        }
        else
        {
          Object.getNotifier(O)
            ._checkPropertyListing();
        }
      };

      Observer.prototype.deliverChangeRecords = function(O)
      {
        Object.getNotifier(O)
          .deliverChangeRecords();
      };

      wraped.lastScanned = 0;
      var f = (function(wrapped)
      {
        return function()
        {
          var i = 0,
            l = wrapped.length,
            startTime = new Date(),
            takingTooLong = false;
          for (i = wrapped.lastScanned;
            (i < l) && (!takingTooLong); i++)
          {
            Object.getNotifier(wrapped[i])
              ._checkPropertyListing();
            takingTooLong = ((new Date()) - startTime) > 100; // make sure we don't take more than 100 milliseconds to scan all objects
          }
          wrapped.lastScanned = i < l ? i : 0; // reset wrapped so we can make sure that we pick things back up
          _doCheckCallback(f);
        };
      })(wraped);
      _doCheckCallback(f);
      return Observer;
    })();

    var Notifier = function(watching)
    {
      var _listeners = [],
        _updates = [],
        _updater = false,
        properties = [],
        values = [];
      var self = this;
      Object.defineProperty(self, '_watching',
      {
        enumerable: true,
        get: (function(watched)
        {
          return function()
          {
            return watched;
          };
        })(watching)
      });
      var wrapProperty = function(object, prop)
      {
        var propType = typeof(object[prop]),
          descriptor = Object.getOwnPropertyDescriptor(object, prop);
        if ((prop === 'getNotifier') || isAccessorDescriptor(descriptor) || (!descriptor.enumerable))
        {
          return false;
        }
        if ((object instanceof Array) && isNumeric(prop))
        {
          var idx = properties.length;
          properties[idx] = prop;
          values[idx] = object[prop];
          return true;
        }
        (function(idx, prop)
        {
          properties[idx] = prop;
          values[idx] = object[prop];
          Object.defineProperty(object, prop,
          {
            get: function()
            {
              return values[idx];
            },
            set: function(value)
            {
              if (!sameValue(values[idx], value))
              {
                Object.getNotifier(object)
                  .queueUpdate(object, prop, 'updated', values[idx]);
                values[idx] = value;
              }
            }
          });
        })(properties.length, prop);
        return true;
      };
      self._checkPropertyListing = function(dontQueueUpdates)
      {
        var object = self._watching,
          keys = Object.keys(object),
          i = 0,
          l = keys.length;
        var newKeys = [],
          oldKeys = properties.slice(0),
          updates = [];
        var prop, queueUpdates = !dontQueueUpdates,
          propType, value, idx, aLength;

        if (object instanceof Array)
        {
          aLength = properties.length;
        }

        for (i = 0; i < l; i++)
        {
          prop = keys[i];
          value = object[prop];
          propType = typeof(value);
          if ((idx = properties.indexOf(prop)) === -1)
          {
            if (wrapProperty(object, prop) && queueUpdates)
            {
              self.queueUpdate(object, prop, 'new', null, object[prop]);
            }
          }
          else
          {
            if ((object instanceof Array) && (isNumeric(prop)))
            {
              if (values[idx] !== value)
              {
                if (queueUpdates)
                {
                  self.queueUpdate(object, prop, 'updated', values[idx], value);
                }
                values[idx] = value;
              }
            }
            oldKeys.splice(oldKeys.indexOf(prop), 1);
          }
        }

        if (object instanceof Array && object.length !== aLength)
        {
          if (queueUpdates)
          {
            self.queueUpdate(object, 'length', 'updated', aLength, object);
          }
        }

        if (queueUpdates)
        {
          l = oldKeys.length;
          for (i = 0; i < l; i++)
          {
            idx = properties.indexOf(oldKeys[i]);
            self.queueUpdate(object, oldKeys[i], 'deleted', values[idx]);
            properties.splice(idx, 1);
            values.splice(idx, 1);
          };
        }
      };
      self.addListener = function(callback)
      {
        var idx = _listeners.indexOf(callback);
        if (idx === -1)
        {
          _listeners.push(callback);
        }
      };
      self.removeListener = function(callback)
      {
        var idx = _listeners.indexOf(callback);
        if (idx > -1)
        {
          _listeners.splice(idx, 1);
        }
      };
      self.listeners = function()
      {
        return _listeners;
      };
      self.queueUpdate = function(what, prop, type, was)
      {
        this.queueUpdates([
          {
            type: type,
            object: what,
            name: prop,
            oldValue: was
        }]);
      };
      self.queueUpdates = function(updates)
      {
        var self = this,
          i = 0,
          l = updates.length || 0,
          update;
        for (i = 0; i < l; i++)
        {
          update = updates[i];
          _updates.push(update);
        }
        if (_updater)
        {
          _clearCheckCallback(_updater);
        }
        _updater = _doCheckCallback(function()
        {
          _updater = false;
          self.deliverChangeRecords();
        });
      };
      self.deliverChangeRecords = function()
      {
        var i = 0,
          l = _listeners.length,
          //keepRunning = true, removed as it seems the actual implementation doesn't do this
          // In response to BUG #5
          retval;
        for (i = 0; i < l; i++)
        {
          if (_listeners[i])
          {
            if (_listeners[i] === console.log)
            {
              console.log(_updates);
            }
            else
            {
              _listeners[i](_updates);
            }
          }
        }
        /*
        for(i=0; i<l&&keepRunning; i++){
          if(typeof(_listeners[i])==='function'){
            if(_listeners[i]===console.log){
              console.log(_updates);
            }else{
              retval = _listeners[i](_updates);
              if(typeof(retval) === 'boolean'){
                keepRunning = retval;
              }
            }
          }
        }
        */
        _updates = [];
      };
      self._checkPropertyListing(true);
    };

    var _notifiers = [],
      _indexes = [];
    extend.getNotifier = function(O)
    {
      var idx = _indexes.indexOf(O),
        notifier = idx > -1 ? _notifiers[idx] : false;
      if (!notifier)
      {
        idx = _indexes.length;
        _indexes[idx] = O;
        notifier = _notifiers[idx] = new Notifier(O);
      }
      return notifier;
    };
    extend.observe = function(O, callback)
    {
      // For Bug 4, can't observe DOM elements tested against canry implementation and matches
      if (!isElement(O))
      {
        return new Observer(O, callback);
      }
    };
    extend.unobserve = function(O, callback)
    {
      validateArguments(O, callback);
      var idx = _indexes.indexOf(O),
        notifier = idx > -1 ? _notifiers[idx] : false;
      if (!notifier)
      {
        return;
      }
      notifier.removeListener(callback);
      if (notifier.listeners()
        .length === 0)
      {
        _indexes.splice(idx, 1);
        _notifiers.splice(idx, 1);
      }
    };
  })(Object, this);
}