const fs = require('fs');
const path = require('path');
const url = require('url');

function getContentType (url) {
    let extName = path.extname(url);
    switch(extName){
        case '.css':
            return 'text/css';
            break;
        case '.ico':
            return 'image/x-icon';
            break;
        default:
            return 'text/html';
    }
}

module.exports = (req, res) => {
    req.pathname = req.pathname || url.parse(req.url).pathname;

    if (req.pathname.startsWith('/content/') && req.method === 'GET') {
        let filePath = path.normalize(
            path.join(__dirname, `..${req.pathname}`)
        );

        fs.readFile (filePath, (err, data) => {
            if (err) {
                res.writeHead(404, {
                    'Content-Type': 'text/plain'
                });

                res.write('Resource not found!');
                res.end();
                return;
            }

            res.writeHead(200, {
                'Content-Type': getContentType(req.pathname)
            });
            res.write(data);
            res.end();
        });
    } else {
        return true;
    }
};