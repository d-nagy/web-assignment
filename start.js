const app = require('./app');

const PORT = process.env.PORT || 3000

const server = app.listen(PORT, () => {
    console.log(`App is running on port ${server.address().port}`);
});
