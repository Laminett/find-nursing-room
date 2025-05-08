require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.SERVICE_PORT

app.get('/', (req, res) => {
    res.send('수유실 위치 API 서버입니다.');
});

app.listen(PORT, () => {
    console.log(`서버 실행중 on port ${PORT}`);
});