import type { File } from 'multer'
import type { AssetInterface, CategorizedAssets } from '../../interfaces/assets'
import { Router } from 'express'
import multer from 'multer'
import * as XLSX from 'xlsx'
import { parseToZodSchema } from '../../utils/parseToZodSchema'
import Asset from '../models/Asset'
import AssetSchema from '../models/AssetSchema'
import Category from '../models/Category'
import User from '../models/User'

const upload = multer({ storage: multer.memoryStorage() })
const router = Router()

async function organizeAssets(assets: AssetInterface[]): Promise<CategorizedAssets> {
  const organizedAssets: CategorizedAssets = {}

  for (const asset of assets) {
    const { category } = asset
    const categoryObject = await Category.findById(category) // Await properly

    const categoryName = categoryObject ? categoryObject.name : 'Uncategorized'

    if (!organizedAssets[categoryName]) {
      organizedAssets[categoryName] = {
        name: categoryName,
        schema: asset.schema,
        assets: [],
      }
    }

    organizedAssets[categoryName].assets.push(asset)
  }
  return organizedAssets
}

router.get('/', async (req, res) => {
  try {
    const { user } = req.query

    if (!user) {
      res.status(400).send('User id is required')
      return
    }

    const assets = await Asset.find({ owner: user }) as AssetInterface[]

    const organizedAssets = await organizeAssets(assets)

    res.status(200).send(organizedAssets)
  }
  catch (e) {
    res.status(500).send(`EXPRESS: ${e.message}`)
  }
})

router.post('/import', upload.any(), async (req: any, res) => {
  try {
    const { user: userString, schemaName, category } = req.body

    const user = JSON.parse(userString)
    const files: File[] = req.files

    const excelObjects = files.map((file: File) => {
      const workBook = XLSX.read(file.buffer, { type: 'buffer' })
      return XLSX.utils.sheet_to_json(workBook.Sheets[workBook.SheetNames[0]])
    })

    let potentialCategory = await Category.findOne({ name: category })
    let potentialAssetSchema = await AssetSchema.findOne({ name: schemaName })

    if (!potentialCategory) {
      potentialCategory = new Category({ name: category })
      await potentialCategory.save()
    }

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
          category: potentialCategory._id,
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
    res.status(500).send(`Error processing files: ${error}`)
  }
})

export default router
