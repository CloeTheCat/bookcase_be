import express from 'express'
import cors from 'cors'
import { getUsers, getUser, createUser, getBooks, getBook, createBook } from './database.js'


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

app.get('/users/:id', async (req, res) => {
    const id = req.params.id
    const user = await getUser(id)
    res.send(user)
})

app.post('/users', async (req, res) => {
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

app.listen(8080, () => {
    console.log('listening on port 8080')
})