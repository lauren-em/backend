import express from 'express'
import multer from 'multer'
import DatabaseOps from './database.js'
import crypto from 'crypto'
import * as s3 from './s3.js'
import sharp from 'sharp'

const app = express()

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString('hex')

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

  for (const image of images) {
    image.imageURL = await s3.getSignedUrl(image.fileName)
  }

  res.send(images)
})

app.post('/api/images', upload.single('image'), async (req, res) => {
  // Get the data from the post request
  const description = req.body.description
  const imageType = req.body.type
  const mimetype = req.file.mimetype
  const fileName = generateFileName()

  // process image
  const fileBuffer = await sharp(req.file.buffer).grayscale().toBuffer()

  // Store the image in s3
  const s3Result = await s3.uploadImage(fileBuffer, fileName, mimetype)

  // Store the image in the database
  const databaseResult = await db.addImage(fileName, description, imageType)

  // Get URL to return to send back to front end
  databaseResult.imageURL = await s3.getSignedUrl(fileName)

  res.status(201).send(databaseResult)
})

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Listening on port ${port}`))
