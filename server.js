import express from 'express'
import fs from 'fs'
import multer from 'multer'
import DatabaseOps from './database.js'

const app = express()
const upload = multer({ dest: 'images/' })
const db = new DatabaseOps()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/api/images', async (req, res) => {
  const images = await db.getImages()
  console.log(images)
  res.send(images)
})

app.post('/api/images', upload.single('image'), async (req, res) => {
  console.log('here')
  console.log(req.file.filename)
  const image = await db.addImage(
    req.file.filename,
    req.body.description,
    req.body.type
  )
  console.log(image)
  res.send(image)
})

app.get('/api/images/:fileName', (req, res) => {
  const fileName = req.params.fileName
  const readStream = fs.createReadStream(`images/${fileName}`)
  readStream.pipe(res)
})

app.post('api/images/delete/:fileName', async (req, res) => {
  const fileName = req.params.fileName
  const dbResult = await db.deleteNote(fileName)
  const fileResult = await fs.unlink(`images/${fileName}`, (err) => {
    if (err) throw err
    console.log(`images/${fileName} was deleted`)
  })
  res.send(dbResult, fileResult)
})

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Listening on port ${port}`))
