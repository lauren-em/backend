import express from 'express'
import fs from 'fs'
import multer from 'multer'
import DatabaseOps from './database.js'

const app = express()
const upload = multer({ dest: 'images/' })
const db = new DatabaseOps()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static('dist'))

app.get('/', (req, res) => {
  // serve react app
})

app.get('/api/images', async (req, res) => {
  let filter = req.query.filter
  console.log(filter)
  const images = await db.getImages(filter)
  console.log(images)
  res.send(images)
})

app.post('/api/images', upload.single('image'), async (req, res) => {
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

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Listening on port ${port}`))
