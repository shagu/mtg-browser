/* filter logic and variables */
const filter = {
  activecolor: '',
  activetext: '',
  activetype: 'instantcreaturesorceryartifactenchantmentplaneswalker',

  apply: function (collection) {
    const output = {}
    for (const x in collection) {
      const object = collection[x]
      if (filter.hasText(object) && filter.hasColor(object) && filter.hasType(object)) {
        output[x] = object
      }
    }

    return output
  },

  toggle: function (self) {
    const types = document.getElementById('types')
    const sort = document.getElementById('sort')

    self.classList.remove('selected')

    if (types.style.display === 'inline-block') {
      types.style.display = 'none'
      sort.style.display = 'none'
    } else {
      types.style.display = 'inline-block'
      sort.style.display = 'inline-block'
      self.classList.add('selected')
    }
  },

  setColor: function (color) {
    if (!color) { return }
    const button = document.getElementById('filter-' + color)
    if (filter.activecolor.includes(color)) {
      filter.activecolor = filter.activecolor.replace(color, '')
      button.classList.remove('selected')
    } else {
      filter.activecolor = filter.activecolor + color
      button.classList.add('selected')
    }

    view.repaint()
  },

  setText: function () {
    filter.activetext = document.getElementById('search-text').value
    view.repaint()
  },

  setType: function (type) {
    if (!type) { return }
    const button = document.getElementById('types-' + type)
    if (filter.activetype.includes(type)) {
      filter.activetype = filter.activetype.replace(type, '')
      button.classList.remove('selected')
    } else {
      filter.activetype = filter.activetype + type
      button.classList.add('selected')
    }

    view.repaint()
  },

  hasColor: function (object) {
    if (!filter.activecolor) { return true }
    if (filter.activecolor.includes('a') && !object.color) { return true }
    if (!object.color) { return false }
    if (object.color.includes(',') && filter.activecolor.includes('m')) { return true }
    for (const color of object.color.toLowerCase().split(',')) {
      if (!filter.activecolor.toLowerCase().includes(color)) { return false }
    }
    return true
  },

  hasText: function (object) {
    if (!filter.activetext) { return true }
    if (object.name && object.name.toLowerCase().includes(filter.activetext.toLowerCase())) { return true }
    if (object.name_loc && object.name_loc.toLowerCase().includes(filter.activetext.toLowerCase())) { return true }
    if (object.text && object.text.toLowerCase().includes(filter.activetext.toLowerCase())) { return true }
    if (object.text_loc && object.text_loc.toLowerCase().includes(filter.activetext.toLowerCase())) { return true }
    return false
  },

  hasType: function (object) {
    if (!filter.activetype) { return true }
    if (filter.activetype.includes('a') && !object.types) { return true }
    if (!object.types) { return false }

    for (const type of object.types.toLowerCase().split(',')) {
      if (filter.activetype.toLowerCase().includes(type)) { return true }
    }
    return false
  }
}

/* sort logic */
const sort = {
  /* state variables */
  reverse: false,
  mode: 'name',

  /* map rarity text to numbers */
  raritymap: {
    unknown: 0,
    common: 2,
    uncommon: 4,
    rare: 8,
    mythic: 16
  },

  setMode: function (mode) {
    sort.mode = mode

    /* switch asc/desc on 2nd click */
    const button = document.getElementById('sort-' + sort.mode)
    const arrow = document.getElementById('sort-' + sort.mode + '-arrow')
    if (button.classList.contains('selected')) {
      if (button.classList.contains('asc')) {
        arrow.innerHTML = '▲'
        button.classList.remove('asc')
        button.classList.add('desc')
        sort.reverse = false
      } else {
        arrow.innerHTML = '▼'
        button.classList.remove('desc')
        button.classList.add('asc')
        sort.reverse = true
      }
    }

    /* make selected sort method visible */
    const buttons = document.getElementsByClassName('sort')
    for (let i = 0; i < buttons.length; i++) {
      buttons.item(i).classList.remove('selected')
    }
    button.classList.add('selected')

    view.repaint()
  },

  getSortIndex: function (collection, mode) {
    /* build the search index */
    const index = []
    for (const x in collection) {
      let tmp = collection[x][mode] ? collection[x][mode] : 'Z'

      /* use proper order for rarities */
      if (mode === 'rarity') {
        tmp = collection[x][mode] ? collection[x][mode] : 'unknown'
        tmp = sort.raritymap[tmp]
      }

      /* use localized titles where possible */
      if (mode === 'name') {
        tmp = collection[x].name_loc ? collection[x].name_loc : collection[x].name
      }

      index.push({ key: x, cmp: tmp })
    }

    index.sort(function (a, b) {
      const as = a.cmp; const bs = b.cmp
      return as === bs ? 0 : (as > bs ? 1 : -1)
    })

    if (sort.reverse) {
      index.reverse()
    }

    return index
  }
}

/* all kind of converter functions */
const convert = {
  parse: function (str) {
    if (!str) { return str }
    // replace known mana symbols
    str = str.replaceAll('{B}', '<img class="mana" src=res/black.png>')
    str = str.replaceAll('{U}', '<img class="mana" src=res/blue.png>')
    str = str.replaceAll('{G}', '<img class="mana" src=res/green.png>')
    str = str.replaceAll('{R}', '<img class="mana" src=res/red.png>')
    str = str.replaceAll('{W}', '<img class="mana" src=res/white.png>')

    str = str.replaceAll('{B/G}', '<img class="mana" src=res/black-green.png>')
    str = str.replaceAll('{B/R}', '<img class="mana" src=res/black-red.png>')
    str = str.replaceAll('{U/B}', '<img class="mana" src=res/blue-black.png>')
    str = str.replaceAll('{U/R}', '<img class="mana" src=res/blue-red.png>')
    str = str.replaceAll('{G/U}', '<img class="mana" src=res/green-blue.png>')
    str = str.replaceAll('{G/W}', '<img class="mana" src=res/green-white.png>')
    str = str.replaceAll('{R/G}', '<img class="mana" src=res/red-green.png>')
    str = str.replaceAll('{R/W}', '<img class="mana" src=res/red-white.png>')
    str = str.replaceAll('{W/B}', '<img class="mana" src=res/white-black.png>')
    str = str.replaceAll('{W/U}', '<img class="mana" src=res/white-blue.png>')

    str = str.replaceAll('{S}', '<img class="mana" src=res/snow.png>')
    str = str.replaceAll('{T}', '<img class="mana" src=res/tap.png>')

    // replace remaining occurrences
    str = str.replaceAll(/{(.+)}/g, (str, value) => {
      return '<span class="mana">' + value + '</span>'
    })

    return str
  },

  colorStringToHex: function (str) {
    if (!str) return '#876543'

    let last
    let multi = false
    let artifact = false
    const matches = str.match(/[A-Za-z]/g)

    if (matches) {
      matches.forEach((match) => {
        if (!last) { last = match }
        if (last !== match) {
          multi = true
        }
      })
    } else {
      artifact = true
    }

    if (multi) {
      return '#a07d10'
    } else if (artifact) {
      return '#969ea1'
    } else {
      /* remove brackets from cmc strings */
      str = str.replaceAll('{', '')
      str = str.replaceAll('}', '')

      /* return single-color code */
      switch (str.match(/[A-Za-z]/g)[0]) {
        case 'B': return '#55524a'
        case 'U': return '#0780c4'
        case 'G': return '#017d49'
        case 'R': return '#f6452a'
        case 'W': return '#eae8e4'
      }
    }
  }
}

/* preview popup */
const preview = {
  setbutton: function (element, entry) {
    if (entry) {
      element.onclick = function () { preview.show(false, entry) }
      element.style.display = 'flex'
    } else {
      element.onclick = ''
      element.style.display = 'none'
    }
  },

  neighbors: function (where, id) {
    let prev, current, next

    if (where === 'deck') {
      for (const name in decks.data) {
        if (decks.data[name][id]) {
          const keys = Object.keys(decks.data[name])
          prev = keys[keys.indexOf(id) - 1]
          next = keys[keys.indexOf(id) + 1]
          break
        }
      }
    } else if (where === 'collection') {
      /* create decklist array */
      const decklist = []
      for (const name in decks.data) {
        for (const card in decks.data[name]) {
          decklist[card] = true
        }
      }

      /* iterate collection */
      const index = sort.getSortIndex(filter.apply(collection[0]), sort.mode)
      for (let i = 0; i < index.length; i++) {
        if (index[i].key == id) {
          current = index[i].key
        } else if (!current && !decklist[index[i].key]) {
          prev = index[i].key
        } else if (current && !decklist[index[i].key]) {
          next = index[i].key
          break
        }
      }
    }

    return {
      prev: prev,
      next: next
    }
  },

  show: function (self, id) {
    const previewframe = document.getElementById('preview')
    const image = document.getElementById('preview-image')
    const text = document.getElementById('preview-text')
    const btnprev = document.getElementById('preview-prev')
    const btnnext = document.getElementById('preview-next')

    window.onkeydown = function (event) {
      if (event.keyCode === 27) {
        event.preventDefault()
        preview.hide()
      } else if (event.keyCode === 37) {
        event.preventDefault()
        btnprev.click()
      } else if (event.keyCode === 39) {
        event.preventDefault()
        btnnext.click()
      }
    }

    image.setAttribute('draggable', true)
    image.ondragstart = function () { decks.drag = id }
    image.ondragend = function () {
      decks.drag = ''

      /* update to next card in collection */
      if (decks.contains(id)) {
        const neighbors = preview.neighbors('collection', id)
        if (neighbors.next) {
          preview.show(false, neighbors.next)
        } else if (neighbors.prev) {
          preview.show(false, neighbors.prev)
        }
      }
    }

    const card = collection[0][id]
    if (card !== 'undefined') {
      image.src = 'collection/' + id + '.jpg'
      previewframe.style.visibility = 'visible'

      text.innerHTML = `
      <span class='title'>${card.name || ''}${card.name_loc ? '<br/><small>(' + card.name_loc + ')</small>' : ''}</span>
      <span class='types'>${card.types || ''}</span>
      <span class='text'>${convert.parse(card.text) || ''}</span>
      <span class='lookup'>Lookup:
      <ul>
        <li><a href='https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=${card.multiverse}'>gatherer.wizards</a></li>
        <li><a href='https://scryfall.com/card/${card.scryfall}'>scryfall</a></li>
      </ul>
      </span>

      <span id="preview-filename">${id}</span>
      `
    }

    /* assign prev/next to either deck or collection */
    const neighbors = preview.neighbors(decks.contains(id) ? 'deck' : 'collection', id)
    preview.setbutton(btnprev, neighbors.prev)
    preview.setbutton(btnnext, neighbors.next)
  },

  hide: function (self, id) {
    const preview = document.getElementById('preview')
    preview.style.visibility = 'hidden'
  }
}

const decks = {
  drag: '',
  data: {},
  folded: {},

  file: {
    onChange: function (event) {
      const reader = new FileReader()
      reader.onload = decks.file.onReaderLoad
      reader.readAsText(event.target.files[0])
    },

    onReaderLoad: function (event) {
      decks.data = JSON.parse(event.target.result)
      decks.reload()
    },

    export: function () {
      const button = document.getElementById('deck-export')
      const content = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(decks.data))
      button.setAttribute('href', content)
      button.setAttribute('download', 'mtgb-decks.json')
    }
  },

  contains: function (id) {
    for (const name in decks.data) {
      if (decks.data[name][id]) {
        return true
      }
    }

    return false
  },

  toggle: function () {
    const deckbuilder = document.getElementById('deckbuilder')
    const button = document.getElementById('deckbuilder-toggle')
    const viewport = document.getElementById('viewport')
    const preview = document.getElementById('preview-space')

    const content = document.getElementById('decks')
    const toolbar = document.getElementById('decks-toolbar')

    if (deckbuilder.style.width === '60px' || !deckbuilder.style.width) {
      deckbuilder.style.width = '500px'
      viewport.style.width = 'calc(100% - 500px)'
      preview.style.width = 'calc(100% - 500px)'
      button.innerHTML = '▼ Decks'
      content.style.display = 'block'
      toolbar.style.display = 'block'
    } else {
      deckbuilder.style.width = '60px'
      viewport.style.width = 'calc(100% - 55px)'
      preview.style.width = '100%'
      button.innerHTML = '▲ Decks'
      content.style.display = 'none'
      toolbar.style.display = 'none'
    }

    decks.reload()
  },

  folding: function (frame, name) {
    if (decks.folded[name]) {
      frame.content.style.display = 'none'
      frame.caption.style.fontSize = '16pt'
      frame.style.height = '30px'
    } else {
      frame.content.style.display = 'block'
      frame.caption.style.fontSize = '24pt'
      frame.style.height = ''
    }
  },

  reset: function () {
    if (confirm('Are you sure you want to remove all decks?')) {
      decks.data = {}
      decks.reload()
    }
  },

  reload: function () {
    const deckview = document.getElementById('decks')
    deckview.innerHTML = ''

    for (const [name, deck] of Object.entries(decks.data)) {
      /* deckbox main frame */
      const frame = document.createElement('div')
      frame.className = 'deck'

      const header = document.createElement('div')
      header.className = 'deck-header'
      header.onclick = function () {
        /* toggle folding */
        if (decks.folded[name]) {
          delete decks.folded[name]
        } else {
          decks.folded[name] = true
        }

        /* update folding state */
        decks.folding(frame, name)
      }
      frame.appendChild(header)

      const caption = document.createElement('span')
      caption.className = 'deck-title'
      caption.innerHTML = name
      header.appendChild(caption)
      frame.caption = caption

      const deldeck = document.createElement('span')
      deldeck.className = 'deck-delete'
      deldeck.innerHTML = '🗑'
      deldeck.onclick = function () {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
          delete decks.data[name]
          decks.reload()
        }
      }
      caption.appendChild(deldeck)

      const rename = document.createElement('span')
      rename.className = 'deck-rename'
      rename.innerHTML = '✎'
      rename.onclick = function () {
        const answer = prompt('Please enter a new deck name', name)
        if (answer && answer !== '' && !decks.data[answer]) {
          decks.data[answer] = decks.data[name]
          delete decks.data[name]
          decks.reload()
        }
      }
      caption.appendChild(rename)

      frame.ondrop = function (ev) {
        deck[decks.drag] = 1
        decks.reload()
      }

      frame.ondragover = function (ev) {
        if (!decks.drag || !collection[0][decks.drag]) { return }
        ev.preventDefault()
      }

      let dcount = 0
      frame.ondragenter = function (ev) {
        dcount++
        frame.classList.add('deck-drag')
      }

      frame.ondragleave = function (ev) {
        dcount--

        if (dcount <= 0) {
          frame.classList.remove('deck-drag')
        }
      }

      /* main content frame to toggle */
      const content = document.createElement('div')
      content.className = 'deck-content'
      frame.content = content
      frame.appendChild(content)

      const cmc = [0, 0, 0, 0, 0, 0, 0, 0, 0]
      let decksize = 0

      const cmcindex = []
      const decklist = {}
      for (const [id, place] of Object.entries(deck)) {
        const index = collection[0][id].name
        decksize = decksize + 1

        if (!decklist[index]) {
          decklist[index] = { count: 1, id: id }
          cmcindex.push({ key: index, cmp: collection[0][id].cmc })
        } else {
          decklist[index].count++
        }
      }

      cmcindex.sort(function (a, b) {
        return a.cmp === b.cmp ? 0 : (a.cmp > b.cmp ? 1 : -1)
      })

      /* create deck card entries */
      const decksizelabel = document.createElement('div')
      decksizelabel.classList = 'deck-decksize'
      decksizelabel.innerHTML = 'Cards in Total: <b>' + decksize + '</b>'
      content.appendChild(decksizelabel)

      for (let i = 0; i < cmcindex.length; i++) {
        const data = decklist[cmcindex[i].key]
        const id = data.id
        const count = data.count
        const isLand = collection[0][id].types.toLowerCase().includes('land')

        const card = document.createElement('div')
        card.style.backgroundColor = convert.colorStringToHex(collection[0][id].color)
        card.className = 'deck-card'

        const remove = document.createElement('span')
        remove.classList = 'deck-card-remove'
        remove.innerHTML = 'x'
        remove.onclick = function () {
          delete (deck[id])
          decks.reload()
        }

        card.appendChild(remove)

        const counter = document.createElement('span')
        counter.classList = 'deck-card-count'
        if (isLand || count <= 4) {
          counter.innerHTML = count
        } else {
          counter.innerHTML = '<span style="color: #ff5555">' + count + '</span>'
        }

        card.appendChild(counter)

        const label = document.createElement('span')
        label.classList = 'deck-card-label'
        label.innerHTML = collection[0][id].name_loc ? collection[0][id].name_loc : collection[0][id].name
        label.onclick = function () { preview.show(card, id) }
        card.appendChild(label)

        const mana = document.createElement('span')
        mana.classList = 'deck-card-mana'
        mana.innerHTML = convert.parse(collection[0][id].mana)
        card.appendChild(mana)

        /* add cmc calc */
        const cost = collection[0][id].cmc || 0
        if (cost < 1 && isLand) {
          if (!cmc['99']) { cmc['99'] = 0 }
          cmc['99'] = cmc['99'] + count
        } else {
          if (!cmc[cost]) { cmc[cost] = 0 }
          cmc[cost] = cmc[cost] + count
        }

        content.appendChild(card)
      }

      /* add cost overview to deck */
      const costarea = document.createElement('div')
      costarea.classList = 'deck-costarea'

      const costview = document.createElement('div')
      costview.classList = 'deck-costview'

      const costrow = document.createElement('div')
      costrow.classList = 'deck-costrow'

      cmc.forEach((id, i) => {
        const count = cmc[i] ? cmc[i] : ''
        const bar = document.createElement('span')
        bar.classList = 'deck-costbar'
        bar.innerHTML = count

        const value = document.createElement('span')
        value.classList = 'deck-costbarval'
        value.style.height = count === '' || i === 99 ? '1px' : count * 5 + 'px'

        bar.appendChild(value)
        costrow.appendChild(bar)
        costview.appendChild(costrow)
      })

      const namerow = document.createElement('div')
      namerow.classList = 'deck-costrow'

      cmc.forEach((id, i) => {
        const name = document.createElement('span')
        name.classList = 'deck-costlabel'
        name.innerHTML = i === 99 ? 'L' : i
        namerow.appendChild(name)
        costview.appendChild(namerow)
      })

      costarea.appendChild(costview)
      content.appendChild(costarea)

      /* add deck to pane */
      deckview.appendChild(frame)

      /* update deck visibility */
      decks.folding(frame, name)
    }

    const createnew = document.createElement('div')
    createnew.classList = 'deck-new'
    createnew.innerHTML = '<span>+</span>New Deck'
    createnew.onclick = function () {
      let i = 1
      while (decks.data[`New Deck (${i})`]) { i++ }
      decks.data[`New Deck (${i})`] = {}
      decks.reload()
    }

    deckview.appendChild(createnew)

    view.repaint()
  }
}

const view = {
  repaint: function () {
    /* refresh view */
    const view = document.getElementById('viewport')
    view.innerHTML = ''

    /* get filtered results */
    const results = filter.apply(collection[0])

    /* get a sorted index array for results */
    const index = sort.getSortIndex(results, sort.mode)

    /* write all deck associated cards into array */
    const decklist = []
    for (const name in decks.data) {
      for (const card in decks.data[name]) {
        decklist[card] = true
      }
    }

    /* apply filters and draw */
    let count = 0
    for (let i = 0; i < index.length; i++) {
      const object = results[index[i].key]
      if (!decklist[index[i].key]) {
        view.appendChild(results[index[i].key].frame)
        count++
      }
    }

    const resultcount = document.getElementById('results')
    resultcount.innerHTML = 'Found <span>' + count + '</span> cards.'
  },

  createCard: function (id, data) {
    // card root frame
    const frame = document.createElement('div')
    frame.className = 'card'
    frame.setAttribute('draggable', true)
    frame.ondragstart = function () {
      frame.style.border = '1px #3fc solid'
      decks.drag = id
    }

    frame.ondragend = function () {
      frame.style.border = ''
      decks.drag = ''
    }

    // card image
    const image = document.createElement('div')
    image.className = 'card-image lazy'
    image.setAttribute('data-src', 'url("collection/' + id + '.jpg")')
    image.url = 'collection/' + id + '.jpg'
    image.onclick = function () { preview.show(image, id) }
    frame.append(image)

    // card title
    const title = document.createElement('div')
    title.className = 'card-title'
    title.innerHTML = data.name_loc ? data.name_loc : data.name
    frame.append(title)

    return frame
  }
}

/* update elements on responsive layout changes */
window.onresize = function (self) {
  const filter = document.getElementById('filter')
  const types = document.getElementById('types')
  const sort = document.getElementById('sort')

  /* ensure visibility of advanced filters in full mode */
  if (window.innerWidth >= 1090) {
    types.style.display = 'inline-block'
    sort.style.display = 'inline-block'
    filter.classList.add('selected')
  }

  /* update filter button state */
  if (types.style.display === 'inline-block') {
    filter.classList.add('selected')
  } else {
    filter.classList.remove('selected')
  }
}

/* initialize viewport */
document.addEventListener('DOMContentLoaded', function () {
  const viewport = document.getElementById('viewport')

  for (const key in collection[0]) {
    if (typeof collection[0][key].frame === 'undefined') {
      collection[0][key].frame = view.createCard(key, collection[0][key])
      collection[0][key].frame.parent = collection[0][key]
    }
    viewport.appendChild(collection[0][key].frame)
  }

  const lazyloadImages = document.querySelectorAll('.lazy')
  const options = {
    rootMargin: '1000px 0px',
    threshold: 0.1
  }

  const imageObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const image = entry.target
        image.style.backgroundImage = image.dataset.src
        image.classList.remove('lazy')
        imageObserver.unobserve(image)
      }
    })
  }, options)

  lazyloadImages.forEach(function (image) {
    imageObserver.observe(image)
  })

  /* add deck file upload events */
  document.getElementById('deck-file').addEventListener('change', decks.file.onChange)

  view.repaint()
})
