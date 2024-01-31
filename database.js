import mysql from 'mysql2/promise';
import dotenv from 'dotenv';


dotenv.config()

const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});


pool.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DATABASE}`);

pool.query(`USE ${process.env.DATABASE}`);

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
        isbn INT UNIQUE,
        plot VARCHAR(10000),
        PRIMARY KEY (id_book)
    )
`)

// USERS
export async function getUsers() {
    const [rows] = await pool.query("SELECT * FROM users")
    return rows
}

export async function getUser(id) {
    const [row] = await pool.query(`
    SELECT * 
    FROM users 
    WHERE id_user = ?
    `, [id])
    return row[0]
}

export async function getUserByEmail(email) {
    const [row] = await pool.query(`
    SELECT * 
    FROM users 
    WHERE email = ?
    `, [email])
    return row[0]
}

export async function createUser(name, surname, email) {
    const [result] = await pool.query(`
    INSERT INTO users (name, surname, email) 
    VALUES (?, ?, ?)
    `, [name, surname, email])
    const id = result.insertId
    return getUser(id)
}

//BOOKS
export async function getBooks() {
    const [rows] = await pool.query("SELECT * FROM books")
    return rows
}

export async function getBook(id) {
    const [row] = await pool.query(`
    SELECT * 
    FROM books 
    WHERE id_book = ?
    `, [id])
    return row[0]
}

export async function createBook(title, author, isbn, plot) {
    const [result] = await pool.query(`
    INSERT INTO books (title, author, isbn, plot) 
    VALUES (?, ?, ?, ?)
    `, [title, author, isbn, plot])
    const id = result.insertId
    return getBook(id)
}

// LIBRARY
export async function getUserLibrary(id_user) {
    const [rows] = await pool.query(`
    SELECT * 
    FROM books, userlibrary
    WHERE books.id_book = userlibrary.id_book
    AND userlibrary.id_user = ?
    `, [id_user])
    return rows
}

export async function getUserLibraryBook(id_userlibrary) {
    const [rows] = await pool.query(`
    SELECT * 
    FROM userlibrary
    WHERE id_userlibrary = ?
    `, [id_userlibrary])
    return rows
}

export async function addBookToUserLibrary(id_user, id_book, added_on) {
    const [result] = await pool.query(`
    INSERT INTO userlibrary (id_user, id_book, added_on) 
    VALUES (?, ?, ?)
    `, [id_user, id_book, added_on])
    const id = result.insertId
    return getUserLibraryBook(id)
}