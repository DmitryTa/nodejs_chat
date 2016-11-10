var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
var chat = require('./chat.js');
var ROOT = __dirname + '\\public\\';
http.createServer(function(req, res) {
	 var urlParsed = url.parse(req.url);
	//console.log(urlParsed.pathname);
	switch(urlParsed.pathname) {

		case '/':
			sendFile('index.html',res);
			break;

		case '/subscribe':
			chat.subscribe(req, res);
			break;

		case '/publish':
			var body = '';
			req.on('readable', function() {
				  var content = req.read();
	  			  if (content != null) 
	    		  	body += content; 
	    		  	//console.log('new read',body.length > 1e4);
	    		  if(body.length > 1e4) {
	    		  	req.destroy();
	    		  	res.statusCode = 413;
	    		  	res.end(http.STATUS_CODES[413]);
	    		  }     
			})
				.on('end', function() {
				  try {
				  	body = JSON.parse(body);	
				  } catch (e) {
				  	throw new Error('Ошибка в JSON');
				  	res.statusCode = 400;
				  	res.end(http.STATUS_CODES[400]);
				  	return;
				  }
				  chat.publish(body.message);
				  res.end('ok');
				})
			break;
		case '/online':
			chat.online(req, res);
			break;

		default:
			//res.statusCode = 404;
			//res.end(http.STATUS_CODES[404]);
			sendFileSafe(urlParsed.pathname, res);

			function sendFileSafe(filePath, res) {

				try {
					filePath = decodeURIComponent(filePath);
				} catch(e) {
					res.statusCode = 400;
					res.end('Bad Request');
					return;
				}

				if (~filePath.indexOf('\0')) {
					res.statusCode = 400;
					res.end('Bad Request');
					return;
				}

				filePath = path.normalize(path.join(ROOT, filePath));
				
				
				if (filePath.indexOf(ROOT) != 0) {
				    res.statusCode = 404;
				    res.end("File not found");
				    return;
				}

				 fs.stat(filePath, function(err, stats) {
				    if (err || !stats.isFile()) {
				      res.statusCode = 404;
				      res.end("File not found");
				      return;
				    }
				    console.log(filePath);
				    sendFile(filePath, res);
				 });
		}	
	}

}).listen(8080);

function sendFile(fileName, res) {
	var fileStream = fs.createReadStream(fileName);
	var mime = require('mime').lookup(fileName); 
   
    res.setHeader('Content-Type', mime + "; charset=utf-8"); 

	fileStream
		.on('error', function(res) {
			res.statusCode = 500;
			res.end(http.STATUS_CODES[500]);
		})
		.pipe(res)
    	.on('close', function() {
      		fileStream.destroy();
    	});



}