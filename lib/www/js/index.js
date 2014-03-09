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


					//---
					var marked = require('marked');
					var newlinesAsIsMode;

					//---
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
					d
						.rpc('settings',
							true,
							function(data)
							{
								console.log('Settings changed');

								marked.setOptions(data.marked);
								marked.setOptions(
								{
									highlight: function(code)
									{
										return require('highlight.js')
											.highlightAuto(code)
											.value;
									}
								});
								newlinesAsIsMode = data.newlinesAsIsMode;

							});

					d
						.rpc('bind',
							true,
							function(data)
							{
								var html;
								try
								{
									if (newlinesAsIsMode)
									{
										console.log(data);
										html = '<style type="text/css">p {margin: 0}</style>' +
											marked(hack(data));
									}
									else
									{
										html = marked(data);
									}
								}
								catch (e)
								{
									html = "";
								}

								//---
								$('#streamDIV')
									.html(html);
							});



				};
				stream();
				//===============
				//-------------------------
			});
		String.prototype.replaceAll = function(org, dest)
		{
			return this.split(org)
				.join(dest);
		};
		var hack = function(data0)
		{
			var data6 = data0.replace(/`\b(.*?)\b`(?!`)/g, '**$1**');
			var data7 = data6.replace(/(- [\s\S]+?)(?:\n\n)/g, '$1\n&nbsp;\n');
			var data8 = data7.replace(/(- [\s\S]+?)(?:\n&nbsp;\n\n)/g, '$1\n\n\n\n\n');
			var data9 = data8.replace(/\n&nbsp;\n(?=[^-])/g, '\n\n\n'); //ok
			var data = data9; //.replace(/\n\n(?=- )/g, '\n\n');

			var rxCodeG = /<code>[\s\S]+?<\/code>|<pre>[\s\S]+?<\/pre>|\n```+[\s\S]+?```+|\n- [\s\S]+?\n\n/g;
			var rxCode = /<code>[\s\S]+?<\/code>|<pre>[\s\S]+?<\/pre>|\n```+[\s\S]+?```+|\n- [\s\S]+?\n\n/;

			var codes = data.match(rxCodeG);
			var codeKey = 'thisistheCodeKey';
			var data1 = [];
			var data1L;
			if (codes)
			{
				codes.map(
					function() //ideally use return
					{
						var len = data1.length;
						var src;
						if (len === 0)
						{
							src = data;
						}
						else
						{
							src = data1[len - 1];
						}
						data1[len] = src.replace(rxCode, codeKey + len);
					});
				data1L = data1[data1.length - 1];
			}
			else
			{
				data1L = data;
			}

			var escape1 = 'thisisdummy3141592escape1';
			var escape2 = 'thisisdummy3141592escape2';
			var toReplace = '&nbsp;' + '\n\n';

			var data2 = data1L
				.replace(/(^|[^\n])\n(?!\n)/g, '$1' + escape1)
				.replace(/(^|[^\n])\n{2}/g, '$1' + escape2)
				.replace(/\n/g, toReplace)
				.replaceAll(escape1, '\n')
				.replaceAll(escape2, '\n\n' + toReplace);

			var data3 = [];
			var data3L;
			if (codes)
			{
				codes.map(
					function()
					{
						var len = data3.length;
						var src;
						if (len === 0)
						{
							src = data2;
						}
						else
						{
							src = data3[len - 1];
						}
						data3[len] = src.replace(codeKey + len, codes[len]);
					});
				data3L = data3[data3.length - 1];
			}
			else
			{
				data3L = data2;
			}

			return data3L;
		};


	}());