import express from 'express'
import cors from 'cors'
import {
    getUsers,
    getUser,
    getUserByEmail,
    createUser,
    getBooks,
    getBook,
    createBook,
    addBookToUserLibrary,
    getUserLibrary,
    changeReadCountOnBookFromUserLibrary,
    updateRemovedOnBookFromUserLibrary
} from './database.js'


const app = express()

app.use(cors())
app.use(express.json())


app.get('/', async (req, res) => {
    res.send('Welcome to your custom library!')
})

// USERS
// Ritorna tutti gli utenti
app.get('/users', async (req, res) => {
    const users = await getUsers()
    console.log('users')
    res.send(users)
})

// Ritorna un singolo utente tramite id_user
app.get('/users/:id', async (req, res) => {
    const id = req.params.id
    const user = await getUser(id)
    res.send(user)
})

// Ritorna un singolo utente tramite email
app.get('/login/:email', async (req, res) => {
    const email = req.params.email
    const user = await getUserByEmail(email)
    // res.send(user)
    if (user) res.send(user)
    else res.status(401).send('User not found')
})

// Crea un nuovo utente
app.post('/signin', async (req, res) => {
    const { name, surname, email } = req.body
    const user = await createUser(name, surname, email)
    res.status(201).send(user)
})


// BOOKS
// Ritorna tutti i libri con solo i valori della tabella books
app.get('/books', async (req, res) => {
    const books = await getBooks()
    res.send(books)
})

// Ritorna un singolo libro tramite id con solo i valori della tabella books
app.get('/books/:id', async (req, res) => {
    const id = req.params.id
    const book = await getBook(id)
    res.send(book)
})

// Crea un nuovo libro da aggiungere alla tabella books
app.post('/books', async (req, res) => {
    const { title, author, isbn, plot } = req.body
    const book = await createBook(title, author, isbn, plot)
    res.status(201).send(book)
})

// Ritorna tutti i libri aggiunti dall'utente
app.get('/userlibrary/:id', async (req, res) => {
    const id = req.params.id
    const userlibrary = await getUserLibrary(id)
    res.send(userlibrary)
})

// Crea nuova relazione in userlibrary
app.post('/userlibrarybook', async (req, res) => {
    const { id_user, id_book } = req.body
    const dateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const userlibrarybook = await addBookToUserLibrary(id_user, id_book, dateTime);
    res.status(201).send(userlibrarybook)
})

// Modifica il campo removed_on in una relazione esistente per eliminarlo
app.patch('/removebook/:id_userlibrary', async (req, res) => {
    const id_userlibrary = req.params.id_userlibrary
    const dateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const removedBook = await updateRemovedOnBookFromUserLibrary(dateTime, id_userlibrary)
    res.status(200).send(removedBook)
})

// Modifica il campo removed_on in una relazione esistente per riaggiungerlo
app.patch('/addbookagain/:id_userlibrary', async (req, res) => {
    const id_userlibrary = req.params.id_userlibrary
    const addedBook = await updateRemovedOnBookFromUserLibrary(null, id_userlibrary)
    res.status(200).send(addedBook)
})

// Modifica il campo read_count in una relazione esistente
app.patch('/updatereadcount', async (req, res) => {
    const { id_userlibrary, read_count } = req.body
    const updateReadCount = await changeReadCountOnBookFromUserLibrary(read_count, id_userlibrary)
    res.status(200).send(updateReadCount)
})

app.listen(8080, () => {
    console.log('listening on port 8080')
})