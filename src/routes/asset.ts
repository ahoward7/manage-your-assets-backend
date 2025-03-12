import { Router } from 'express'
import * as XLSX from 'xlsx'
import type { File } from 'multer'
import { parseToZodSchema } from '../../utils/parseToZodSchema'
import AssetSchema from '../models/AssetSchema'
import Asset from '../models/Asset'
import User from '../models/User'
import multer from 'multer'

const upload = multer({ storage: multer.memoryStorage() })
const router = Router()

router.get('/', (req, res) => {
  res.send('Assets route')
})

router.post('/import', upload.any(), async (req: any, res) => {
  try {
    const { user: userString, schemaName } = req.body

    const user = JSON.parse(userString)
    const files: File[] = req.files

    const excelObjects = files.map((file: File) => {
      const workBook = XLSX.read(file.buffer, { type: 'buffer' })
      return XLSX.utils.sheet_to_json(workBook.Sheets[workBook.SheetNames[0]])
    })

    let potentialAssetSchema = await AssetSchema.findOne({ name: schemaName })

    if (!potentialAssetSchema) {
      const zodSchema = parseToZodSchema(excelObjects[0][0])
      potentialAssetSchema = new AssetSchema({ name: schemaName, zod: zodSchema })
      await potentialAssetSchema.save()
    }

    const mongoUser = await User.findOne({ email: user.email })

    if (!mongoUser) {
      res.status(404).send('User not found')
      return
    }

    excelObjects.forEach((excelFile) => {
      excelFile.forEach((assetEntry) => {
        const asset = new Asset({
          schema: potentialAssetSchema._id,
          data: assetEntry,
          created: new Date(),
          updated: new Date(),
          createdBy: mongoUser._id,
          updatedBy: mongoUser._id,
          owner: mongoUser._id,
        })

        asset.save()
      })
    })

    res.send('Files processed')
  }
  catch (error) {
    res.status(500).send('Error processing files')
  }
})


export default router
