var http = require('http');
var port = 8000;
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
//----------------------------
HTTPserver =
    httpServer(require('path')
        .join(__dirname, '/lib/www'));

HTTPserver
    .listen(port, function()
    {
        console.log('HTTP listening:' + port);
        HTTPserver
            .listen(port, function()
            {
                console.log('HTTP listening:' + port);
            });

    });


/*
    .on('error', function(err)
    {
        if (err.code === 'EADDRINUSE')
        {

            port++;
            console.log('Address in use, retrying on port ' + port);

            HTTPserver
                .listen(port, function()
                {
                    console.log('HTTP listening:' + port);
                });
        }
    });*/