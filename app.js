const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const keywords = {
    "study": ["https://ithub.ru/", "https://ithub.ru/franchises"],
    "js": ["https://developer.mozilla.org/en-US/docs/Web/JavaScript", "https://learn.javascript.ru/"]
};

app.get('/urls/:keyword', (req, res) => {
    const keyword = req.params.keyword;
    const urls = keywords[keyword];
    if (urls) {
        res.json(urls);
    } else {
        res.status(404).send('Keyword not found');
    }
});

app.post('/download', async (req, res) => {
    const { url } = req.body;
    console.log(`Received download request for URL: ${url}`);
    try {
        const response = await axios.get(url, {
            responseType: 'stream'
        });

        const totalLength = response.headers['content-length'];
        let downloadedLength = 0;

        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${path.basename(url)}"`);

        response.data.on('data', chunk => {
            downloadedLength += chunk.length;
            res.write(JSON.stringify({ total: totalLength, loaded: downloadedLength }) + '\n');
        });

        response.data.on('end', () => {
            res.end();
        });

        response.data.pipe(res);

        response.data.on('error', (err) => {
            console.error('Error downloading content:', err);
            res.status(500).send('Error downloading content');
        });
    } catch (error) {
        console.error('Error downloading content:', error);
        res.status(500).send('Error downloading content');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
