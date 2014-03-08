(function() //-----
	{
		"use strict";

		$(document)
			.ready(function()
			{ //--------------------------
				$('#streamDIV')
					.html('<h1>MarkdownStream</h1><h3>Markdown Live Streaming View for ATOM</h3><br><h4><strong>Open</strong> <br><br>.md<br>.markdown<br>.mdown<br>.mkdn<br>.mkd<br>.mdwn<br>.mdtxt<br>.mdtext<br>.text<br>.txt</h4>');


				//==============
				console.log('client.js started');

				var url = 'ws://localhost:9000';
				var ws;

				if (typeof(window) === 'undefined')
				{
					console.log('running on node');
					var WebSocketNode = require('ws');
					ws = new WebSocketNode(url);
				}
				else
				{
					console.log('running on browser');
					ws = new WebSocket(url); // native WebSocket on browser
				}

				var WebSocketStream = require('stream-websocket');

				var c = new WebSocketStream(ws);

				var rpc = require('rpc-streamx');
				var d = rpc();

				c
					.pipe(d)
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

				d
					.rpc('hello',
						true,
						function(data)
						{
							$('#streamDIV')
								.html(data);
						});


				//===============
				//-------------------------
			});

	}());