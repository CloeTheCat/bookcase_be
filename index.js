import express from 'express'
import cors from 'cors'
import { getUsers, getUser, getUserByEmail, createUser, getBooks, getBook, createBook, addBookToUserLibrary, getUserLibrary } from './database.js'


const app = express()

app.use(cors())
app.use(express.json())


app.get('/', async (req, res) => {
    res.send('Welcome on your custom library!')
})

// USERS
app.get('/users', async (req, res) => {
    const users = await getUsers()
    console.log('users')
    res.send(users)
})

// app.get('/users/:id', async (req, res) => {
//     const id = req.params.id
//     const user = await getUser(id)
//     res.send(user)
// })

app.get('/login/:email', async (req, res) => {
    const email = req.params.email
    const user = await getUserByEmail(email)
    // res.send(user)
    if (user) res.send(user)
    else res.status(401).send('User not found')
})

// app.post('/users', async (req, res) => {
//     const { name, surname, email } = req.body
//     const user = await createUser(name, surname, email)
//     res.status(201).send(user)
// })

app.post('/signin', async (req, res) => {
    const { name, surname, email } = req.body
    const user = await createUser(name, surname, email)
    res.status(201).send(user)
})


// BOOKS
app.get('/books', async (req, res) => {
    const books = await getBooks()
    res.send(books)
})

app.get('/books/:id', async (req, res) => {
    const id = req.params.id
    const book = await getBook(id)
    res.send(book)
})

app.post('/books', async (req, res) => {
    const { title, author, isbn, plot } = req.body
    const book = await createBook(title, author, isbn, plot)
    res.status(201).send(book)
})

app.get('/userlibrary/:id', async (req, res) => {
    const id = req.params.id
    const userlibrary = await getUserLibrary(id)
    res.send(userlibrary)
})

app.post('/userlibrarybook', async (req, res) => {
    const { id_user, id_book } = req.body
    const dateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const userlibrarybook = await addBookToUserLibrary(id_user, id_book, dateTime);
    res.status(201).send(userlibrarybook)
})

app.listen(8080, () => {
    console.log('listening on port 8080')
})