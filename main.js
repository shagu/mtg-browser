/* built-in node modules */
const fs = require('fs')
const util = require('util')

/* external node modules */
const pdf = require('pdfkit')
const sqlite3 = require('better-sqlite3')

/* main config */
const config = {
  // write PDF file with attached JSON
  writePDF: null,

  // 1: lists, 2: decks, 3: want
  'delver-lists': {
    1: true,
    2: false,
    3: false
  }
}

/* initialize arrays */
const collection = {}
const cards = []

/* load delver backup file and app database */
const backup = new sqlite3('./cache/cards.sqlite')
const delver = new sqlite3('./cache/delver.sqlite')

/* load additional card data from mtgjson */
const mtgjson = new sqlite3('./cache/mtgjson.sqlite')

/* prepared statements */
const scry2mtgjson = mtgjson.prepare('SELECT * FROM cards WHERE scryfallId = ?')
const oracle2multiverse = mtgjson.prepare('SELECT multiverseid FROM cards WHERE scryfallOracleId = ?')
const set2setname = mtgjson.prepare('SELECT name, releaseDate FROM sets WHERE code = ?')
const uuid2locale = mtgjson.prepare('SELECT name, text FROM foreign_data WHERE uuid = ? AND language = ?')
const delver2scry = delver.prepare('SELECT scryfall_id FROM cards WHERE _id = ?')
const backup2list = backup.prepare('SELECT category from lists where _id = ?')

let current = 1
let overall = 0

/* create folder structure */
if (!fs.existsSync('./collection')) { fs.mkdirSync('./collection') }

/* read backup file into cards array and assign scryfall ID */
backup.prepare('SELECT * FROM cards ORDER BY card').all().forEach((row) => {
  const card = {
    id: row.card,
    foil: row.foil,
    image: row.image,
    quantity: row.quantity,
    language: row.language,
    category: backup2list.get(row.list).category
  }

  /* read scryfall id from delver database */
  card.scryfall = delver2scry.get(card.id).scryfall_id

  /* only add defined lists to collection */
  if (config['delver-lists'][card.category]) {
    cards.push(card)
  }
})

/* add jsondata and write outputs */
cards.forEach((card) => {
  /* read mtgjson data */
  const jsondata = scry2mtgjson.get(card.scryfall)
  card.multiverse = jsondata.multiverseId
  card.rarity = jsondata.rarity
  card.types = jsondata.types
  card.subtypes = jsondata.subtypes
  card.set = jsondata.setCode
  card.cmc = jsondata.convertedManaCost
  card.name = jsondata.name
  card.color = jsondata.colorIdentity
  card.text = jsondata.text

  /* add set data */
  const setdata = set2setname.get(card.set)
  card.date = setdata.releaseDate
  card.setname = setdata.name

  /* add locale data */
  const locales = uuid2locale.get(jsondata.uuid, card.language)
  if (locales) {
    card.name_loc = locales.name
    card.text_loc = locales.text
  }

  /* try to find alternative multiverse id */
  if (!card.multiverse && jsondata.scryfallOracleId) {
    oracle2multiverse.all(jsondata.scryfallOracleId).forEach((row) => {
      if (row.multiverseId) { card.multiverse = row.multiverseId }
    })
  }

  /* write all cards to filesystem */
  const image = card.image
  delete card.image

  for (let i = card.quantity; i > 0; i--) {
    /* increase card counter if already existing */
    let offset = 0
    const ipattern = `{${card.color}} ${card.name.replaceAll('/', '|')} {${card.types}} (%s)`

    while (collection[util.format(ipattern, (i + offset))]) {
      offset++
    }

    /* write collection data element */
    const index = util.format(ipattern, (i + offset))
    collection[index] = card
    overall++

    /* write card-image to collection */
    fs.writeFileSync(util.format(`./collection/${index}.%s`, 'jpg'), image, (err) => {
      if (err) return console.log(err)
    })

    /* write PDF (image + card data) if option is set */
    if (config.writePDF === true) {
      const doc = new pdf({
        size: [312, 445],
        margins: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        }
      })

      doc.pipe(fs.createWriteStream(util.format(`./collection/${index}.%s`, 'pdf')))
      doc.image(image, 0, 0, { fit: [312, 445] })
      doc.fontSize(0).text(JSON.stringify(card), 0, 0)
      doc.end()
    }
  }

  process.stdout.write(''.padEnd(process.stdout.columns, ' ') + '\r')
  process.stdout.write('[' + current + '/' + cards.length + '] ' + card.name + '\r')
  current++
})

/* save collection metadata */
process.stdout.write('\nWriting collection metadata.\n')
fs.writeFileSync('./collection/collection.js', 'const collection = [' + JSON.stringify(collection) + ']', (err) => {
  if (err) return console.log(err)
})

process.stdout.write(`\nDone. ${overall} Cards written.\n`)
