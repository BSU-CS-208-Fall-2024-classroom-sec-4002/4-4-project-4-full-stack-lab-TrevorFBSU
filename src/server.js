import express from 'express'
import sql from 'sqlite3'

const sqlite3 = sql.verbose()

// Create an in memory table to use
const db = new sqlite3.Database(':memory:')

// This is just for testing you would not want to create the table every
// time you start up the app feel free to improve this code :)
db.run(`CREATE TABLE todo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL)`)

const app = express()
app.use(express.static('public'))
app.set('views', 'views')
app.set('view engine', 'pug')
app.use(express.urlencoded({ extended: false }))

app.get('/', function (req, res) {
    const local = { tasks: [] }
    db.all('SELECT id, task FROM todo', (err, rows) => {
        if (err) {
            console.log(err);
        } else {
            local.tasks = rows;
            res.render('index', local);
        }
    })
})

app.post('/', function (req, res) {
    const task = req.body.todo;
    if (task) {
        const stmt = db.prepare('INSERT INTO todo (task) VALUES (?)');
        stmt.run(task, (err) => {
            if (err) {
                console.log(err);
            }
            res.redirect('/');
        })
        stmt.finalize();
    } else {
        res.redirect('/');
    }
})

app.post('/delete', function (req, res) {
    console.log('deleting todo item')
    const id = req.body.id;
    const stmt = db.prepare('DELETE FROM todo WHERE id = ?');
    stmt.run(id, (err) => {
        if (err) {
            console.log(err);
        }
        res.redirect('/');
    })
    stmt.finalize();
})

// Start the web server
app.listen(3000, function () {
    console.log('Listening on port 3000...')
})
