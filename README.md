#Markdown Stream
## markdown-stream package
####Markdown Live Streaming Preview for GitHub ATOM editor

![](http://kenokabe.github.io/contents/img/mdstream.png)


- **Streaming View** while you are typing text without saving the document.
- **WebBrowser** you can chose. Sometimes, the ATOM built-in **WebKit(view built in ATOM)** performs poor for this purpose especially for long documents. You might see **Firefox** performs better.
- **Fast and Smooth** - **Independent processes** for **Input**(*ATOM*), **Conversion from Markdown to HTML** and **Output**(*WebBrowser*).
- GitHub Flavored Markdown (**GFM**) is available Out-of-the-Box
- Original **newLinesAsIs** mode.
- Code Highlights (**Highlight.js**)  is available Out-of-the-Box.
- **Fully Customizable Output** - edit/add HTML or CSS.
- Works on **ATOM**: *A hackable text editor
for the 21st Century*.

##Requirements

- [ATOM](https://atom.io/) editor

##Getting Started

###from terminal
```
apm install markdown-stream
```

###GUI

`ATOM > Preferences... > Packages`

Search `markdown` or `markdown-stream`

Then Install.

##Customize Output

```
~/.atom/packages/markdown-stream/lib/www
```

![](http://kenokabe.github.io/contents/img/customwww.png)

```
<!DOCTYPE html>
<html lang="en">
<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <!-- Meta, title, CSS, favicons, etc. -->
<meta charset="utf-8">
<meta name="description" content="">
<meta name="author" content="">
<title>
    MarkdownStream
</title>
<!--   any css    -->
<link rel="stylesheet" type="text/css" href="./custom.css">
<link rel="stylesheet" type="text/css" href="./atelier-forest.dark.css">
<!--===== Don't  Touch ===========-->
     <script type="text/javascript" src="./js/jquery-2.0.3.min.js"></script>
     <script type="text/javascript" src="./js/index.bundle.js"></script>
<!--========================-->
</head>
<body>
<!-- <div id="streamDIV"></div>  is
the end point of the whole work;
you can wrap  it with any HTML tags here -->
         <div id="streamDIV"></div>
</body>
</html>
```
