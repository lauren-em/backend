import mysql from 'mysql2'
import dotenv from 'dotenv'
dotenv.config()

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT || 3306,
  })
  .promise()

class DatabaseOps {
  DatabaseOps() {}

  async getImages(filter) {
    let query = `
    SELECT *
    FROM images
    WHERE type = ?
    ORDER BY created DESC`
    const [rows] = await pool.query(query, [filter])
    return rows
  }

  async getImage(id) {
    let query = `
    SELECT * 
    FROM images
    WHERE id = ?
    `
    const [rows] = await pool.query(query, [id])
    return rows[0]
  }

  async addImage(fileName, description, type) {
    let query = `
    INSERT INTO images (fileName, description, type)
    VALUES(?, ?, ?)`
    const [result] = await pool.query(query, [fileName, description, type])
    const id = result.insertId
    console.log('result in add image', result)
    return await this.getImage(id)
  }
}

export default DatabaseOps
