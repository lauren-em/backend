import mysql from 'mysql2'
import dotenv from 'dotenv'
dotenv.config()

const pool = mysql
  .createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306,
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

  async getImage(fileName) {
    let query = `
    SELECT * 
    FROM images
    WHERE fileName = ?
    `
    const [rows] = await pool.query(query, [fileName])
    return rows[0]
  }

  async addImage(fileName, description, type) {
    let query = `
    INSERT INTO images (fileName, description, type)
    VALUES(?, ?, ?)`
    const [result] = await pool.query(query, [fileName, description, type])
    const id = result.insertId
    console.log('result in add image', result)
    return await this.getImage(fileName)
  }

  async deleteImage(fileName) {
    let query = `
    DELETE FROM images
    WHERE fileName = ?
    `
    const [rows] = await pool.query(query, [fileName])
    return rows[0]
  }
}

export default DatabaseOps
