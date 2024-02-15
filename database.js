import mysql from 'mysql2/promise';
import dotenv from 'dotenv';


dotenv.config()

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});


pool.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);

pool.query(`USE ${process.env.DB_NAME}`);

pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        id_user INT AUTO_INCREMENT, 
        name VARCHAR(255), 
        surname VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        PRIMARY KEY (id_user)
    )
`)

pool.query(`
    CREATE TABLE IF NOT EXISTS userlibrary (
        id_userlibrary INT AUTO_INCREMENT, 
        id_user INT,
        id_book INT,
        added_on DATETIME,
        removed_on DATETIME,
        read_count INT DEFAULT 0,
        PRIMARY KEY (id_userlibrary),
        FOREIGN KEY (id_user) REFERENCES users(id_user),
        FOREIGN KEY (id_book) REFERENCES books(id_book)
    )
`)

pool.query(`
    CREATE TABLE IF NOT EXISTS books (
        id_book INT AUTO_INCREMENT, 
        title VARCHAR(255) NOT NULL, 
        author VARCHAR(255),
        isbn VARCHAR(255) UNIQUE,
        plot VARCHAR(10000),
        PRIMARY KEY (id_book)
    )
`)

// USERS
// Ritorna tutti gli utenti
export async function getUsers() {
    const [rows] = await pool.query("SELECT * FROM users")
    return rows
}

// Ritorna un singolo utente tramite id_user
export async function getUser(id) {
    const [row] = await pool.query(`
    SELECT * 
    FROM users 
    WHERE id_user = ?
    `, [id])
    return row[0]
}

// Ritorna un singolo utente tramite email
export async function getUserByEmail(email) {
    const [row] = await pool.query(`
    SELECT * 
    FROM users 
    WHERE email = ?
    `, [email])
    return row[0]
}

// Crea un nuovo utente
export async function createUser(name, surname, email) {
    const [result] = await pool.query(`
    INSERT INTO users (name, surname, email) 
    VALUES (?, ?, ?)
    `, [name, surname, email])
    const id = result.insertId
    return getUser(id)
}

//BOOKS
// Ritorna tutti i libri con solo i valori della tabella books
export async function getBooks() {
    const [rows] = await pool.query("SELECT * FROM books")
    return rows
}

// Ritorna un singolo libro tramite id con solo i valori della tabella books
export async function getBook(id) {
    const [row] = await pool.query(`
    SELECT * 
    FROM books 
    WHERE id_book = ?
    `, [id])
    return row[0]
}

// Ritorna tutti i libri con tutti i valori della tabella books e della tabella userlibrary
export async function getAllBooks() {
    const [rows] = await pool.query(`
    SELECT * 
    FROM books, userlibrary
    `)
    return rows
}

// Ritorna un singolo libro con tutti i valori della tabella books e della tabella userlibrary tramite id_userlibrary
export async function getBookFromLibrary(id_userlibrary) {
    const [row] = await pool.query(`
    SELECT * 
    FROM books, userlibrary
    WHERE books.id_book = userlibrary.id_book
    AND userlibrary.id_userlibrary = ?
    `, [id_userlibrary])
    return row[0]
}


// id utente id libro
// chiama id libro
// chiama libri dell'utente

// filtra per id libro
// accorpa
// restituisci


// Crea un nuovo libro da aggiungere alla tabella books
export async function createBook(title, author, isbn, plot) {
    const [result] = await pool.query(`
    INSERT INTO books (title, author, isbn, plot) 
    VALUES (?, ?, ?, ?)
    `, [title, author, isbn, plot])
    const id = result.insertId
    return getBook(id)
}

// Ritorna tutti i libri che contengono nel titolo la stringa digitata
export async function getBooksByTitle(typedString) {
    const [rows] = await pool.query(`
    SELECT * 
    FROM books
    WHERE books.title LIKE ?
    `, [typedString])
    return rows
}

// Ritorna tutti i libri che contengono nel titolo la stringa digitata
export async function getBooksByTitle2(typedString, id_user, offset, limit) {
    const [rows] = await pool.query(`
    SELECT books.id_book, books.title, books.author, books.isbn, books.plot, userlibrary.id_userlibrary, userlibrary.id_user, userlibrary.added_on, userlibrary.removed_on, userlibrary.read_count
    FROM books
    LEFT JOIN userlibrary ON books.id_book = userlibrary.id_book 
    AND userlibrary.id_user = ?
    WHERE books.title LIKE ?
    LIMIT ?, ?
    `, [id_user, typedString, offset, limit])
    return rows
}

// LIBRARY
// Ritorna tutti i libri aggiunti dall'utente, ma non quelli rimossi
export async function getUserLibrary(id_user) {
    const [rows] = await pool.query(`
    SELECT * 
    FROM books, userlibrary
    WHERE books.id_book = userlibrary.id_book
    AND userlibrary.id_user = ?
    AND userlibrary.removed_on IS NULL
    `, [id_user])
    return rows
}

// Ritorna l'id_userlibrary tramite id_user e id_book
export async function getUserLibraryRel(id_user, id_book) {
    const [[result]] = await pool.query(`
    SELECT id_userlibrary
    FROM userlibrary
    WHERE id_user = ?
    AND id_book = ?
    LIMIT 1
    `, [id_user, id_book])
    return result
}

// Ritorna l'id_userlibrary tramite id_user e una stringa
export async function getUserLibraryRelByString(id_user, typedString) {
    const [[result]] = await pool.query(`
    SELECT id_userlibrary
    FROM userlibrary
    WHERE id_user = ?
    AND title = ?
    LIMIT 1
    `, [id_user, typedString])
    return result
}

// Crea nuova relazione in userlibrary
export async function addBookToUserLibrary(id_user, id_book, added_on) {
    const [result] = await pool.query(`
    INSERT INTO userlibrary (id_user, id_book, added_on) 
    VALUES (?, ?, ?)
    `, [id_user, id_book, added_on])
    return result
}

// Modifica il campo removed_on in una relazione esistente
export async function updateRemovedOnBookFromUserLibrary(removed_on, id_userlibrary) {
    const [result] = await pool.query(`
    UPDATE userlibrary
    SET removed_on = ?
    WHERE id_userlibrary = ?
    `, [removed_on, id_userlibrary])
    return result
}

// Modifica il campo read_count in una relazione esistente
export async function changeReadCountOnBookFromUserLibrary(read_count, id_userlibrary) {
    const [result] = await pool.query(`
    UPDATE userlibrary
    SET read_count = ?
    WHERE id_userlibrary = ?
    `, [read_count, id_userlibrary])
    return result
}