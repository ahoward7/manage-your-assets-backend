import { Router } from 'express'
import * as XLSX from 'xlsx'
import type { FileAsset } from '../../interfaces/assets'
import { parseToZodSchema } from '../../utils/parseToZodSchema'
import AssetSchema from '../models/AssetSchema'

const router = Router()

router.get('/', (req, res) => {
  res.send('Assets route')
})

router.post('/import', (req, res) => {
  try {
    const excelFiles = req.body

    if (!excelFiles || !excelFiles.length) {
      res.status(400).send('No files provided')
      return
    }

    const excelObjects = []

    excelFiles.forEach((file: FileAsset) => {
      const { data } = file.data

      const workBook = XLSX.read(data, { type: 'buffer' })
      const sheetName = workBook.SheetNames[0]
      const worksheet = workBook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      excelObjects.push(jsonData)
    })

    const zodSchema = parseToZodSchema(excelObjects[0][0])

    const schemaName = 'Asset'

    const assetSchemaObject = {
      name: schemaName,
      zod: zodSchema,
    }

    const potentialAssetSchema = AssetSchema.findOne({ name: schemaName })

    if (!potentialAssetSchema) {
      const assetSchema = new AssetSchema(assetSchemaObject)
      assetSchema.save()
    }

    res.send(excelObjects)
  }
  catch (error) {
    res.status(500).send('Error processing files')
  }
})

export default router
