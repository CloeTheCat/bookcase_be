import mysql from 'mysql2/promise';
import dotenv from 'dotenv';


dotenv.config()

const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

export async function getNotes() {
    const [rows] = await pool.query("SELECT * FROM notes")
    return rows
}

export async function getNote(id) {
    const [row] = await pool.query(`
    SELECT * 
    FROM notes 
    WHERE id = ?
    `, [id])
    return row[0]
}

export async function createNote(title, contents) {
    const [result] = await pool.query(`
    INSERT INTO notes (title, contents) 
    VALUES (?, ?)
    `, [title, contents])
    const id = result.insertId
    return getNote(id)
}

// const result = await createNote('My Third Note', 'Nothing')
// console.log(result)

// const notes = await getNotes()
// console.log('notes: ', notes)

// const note = await getNote(10)
// console.log('note1: ', note)