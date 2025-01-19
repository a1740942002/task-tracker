import { stat } from 'node:fs/promises'
import path from 'node:path'

const filePath = path.join(__dirname, '../data/temp.json')

async function main() {
  try {
    const stats = await stat(filePath)
    console.log('stats', stats)
  } catch (err) {
    console.error(err)
  }
}

main()
