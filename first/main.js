const express = require('express');
const app = express();

app.all('/', (req, res) => {
    res.send('Test');
});

// Serve public files
const static = require('./static');
app.use('/public', static.app);

app.listen(85);
