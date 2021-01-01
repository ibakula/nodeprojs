const express = require('express');
const app = express();
const serveIndex = require('serve-index');

const options = {
    dotfiles: 'deny', // this setting calls next(), what is the purpose?
    etag: false,
    extensions: false,
    index: false,
    immutable: true, // Stop making requests before 'maxAge'
    maxAge: '30d', // static files not getting any updates earlier
    redirect: false,
    setHeaders: (res, path, stat) => {
        res.set('x-timestamp', Date.now())
    }
}

app.use('/', express.static('./static', options), serveIndex('./static'));

exports.app = app;
