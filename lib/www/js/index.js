(function() //-----
	{
		"use strict";

		$(document)
			.ready(function()
			{ //--------------------------
				$('#streamDIV')
					.html('<h1>MarkdownStream</h1><h3>Not Connected</h3>');

				//==============
				console.log('client.js started');

				var httpPort = (window.location.host)
					.split(':')[1] * 1;

				var wsPort = httpPort + 1;

				console.log(httpPort);
				console.log(wsPort);

				var stream = function()
				{
					var url = 'ws://localhost:' + wsPort;
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
							console.log('Connection lost and Reconnecting...');
							$('#streamDIV')
								.html('<h3>MarkdownStream </h3><h3>Connection lost and Reconnecting...</h3>');

							setTimeout(function()
							{
								console.log('reconnecting');
								stream();
							}, 1000);
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
						.rpc('bind',
							true,
							function(data)
							{
								$('#streamDIV')
									.html(data);
							});
					d
						.rpc('connect',
							true,
							function(data)
							{
								if (data === 'connected')
								{
									console.log('Connected!');
									$('#streamDIV')
										.html('<h1>MarkdownStream</h1><h3>Markdown Live Streaming View for ATOM</h3><br><h3>Connected!</h3><h4><strong>Open</strong> <br><br>.md<br>.markdown<br>.mdown<br>.mkdn<br>.mkd<br>.mdwn<br>.mdtxt<br>.mdtext<br>.text<br>.txt</h4>');

								}
							});


				};
				stream();
				//===============
				//-------------------------
			});

	}());