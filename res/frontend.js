/* filter logic and variables */
const filter = {
  activecolor: '',
  activetext: '',
  activetype: 'instantcreaturesorceryartifactenchantmentplaneswalker',

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
    if (object.name_lang && object.name_lang.toLowerCase().includes(filter.activetext.toLowerCase())) { return true }
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

  getSortIndex: function (collection) {
    /* build the search index */
    const index = []
    for (const x in collection[0]) {
      let tmp = collection[0][x][sort.mode] ? collection[0][x][sort.mode] : 'Z'

      /* use proper order for rarities */
      if (sort.mode === 'rarity') {
        tmp = collection[0][x][sort.mode] ? collection[0][x][sort.mode] : 'unknown'
        tmp = sort.raritymap[tmp]
      }

      /* use localized titles where possible */
      if (sort.mode === 'name') {
        tmp = collection[0][x].name_loc ? collection[0][x].name_loc : collection[0][x].name
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
  manaStringHTML: function (str) {
    // replace known mana symbols
    str = str.replaceAll('{B}', '<img src=res/black.png>')
    str = str.replaceAll('{U}', '<img src=res/blue.png>')
    str = str.replaceAll('{G}', '<img src=res/green.png>')
    str = str.replaceAll('{R}', '<img src=res/red.png>')
    str = str.replaceAll('{W}', '<img src=res/white.png>')

    // replace remaining occurrences
    str = str.replaceAll(/{(.+)}/g, (str, value) => {
      return '<span class="mana">' + value + '</span>'
    })

    return str
  }
}

/* preview popup */
const preview = {
  show: function (self, id) {
    const preview = document.getElementById('preview')
    const image = document.getElementById('preview-image')
    image.src = self.url
    preview.style.visibility = 'visible'
  },
  hide: function (self, id) {
    const preview = document.getElementById('preview')
    preview.style.visibility = 'hidden'
  }
}

const decks = {
  drag: '',
  data: {
    'New Deck': { }
  },

  toggle: function () {
    const deckbuilder = document.getElementById('deckbuilder')
    const button = document.getElementById('deckbuilder-toggle')
    const viewport = document.getElementById('viewport')

    const content = document.getElementById('decks')
    const toolbar = document.getElementById('decks-toolbar')

    if (deckbuilder.style.width === '60px' || !deckbuilder.style.width) {
      deckbuilder.style.width = '500px'
      viewport.style.width = 'calc(100% - 500px)'
      button.innerHTML = '▼ Decks'
      content.style.display = 'block'
      toolbar.style.display = 'block'
    } else {
      deckbuilder.style.width = '60px'
      viewport.style.width = 'calc(100% - 55px)'
      button.innerHTML = '▲ Decks'
      content.style.display = 'none'
      toolbar.style.display = 'none'
    }

    decks.reload()
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
      frame.appendChild(header)

      const caption = document.createElement('span')
      caption.className = 'deck-title'
      caption.innerHTML = name
      header.appendChild(caption)

      frame.ondrop = function (ev) {
        deck[decks.drag] = 1
        decks.reload()
      }

      let dragger = 0
      frame.ondragover = function (ev) {
        ev.preventDefault()

        frame.classList.add('deck-drag')
        dragger = Date.now()
      }

      frame.ondragleave = function (ev) {
        frame.classList.remove('deck-drag')
      }

      /* create deck card entries */
      for (const [id, place] of Object.entries(deck)) {
        const card = document.createElement('div')
        card.className = 'deck-card'

        const label = document.createElement('span')
        label.classList = 'deck-card-label'
        label.innerHTML = collection[0][id].name_loc ? collection[0][id].name_loc : collection[0][id].name
        card.appendChild(label)

        const mana = document.createElement('span')
        mana.classList = 'deck-card-mana'
        mana.innerHTML = convert.manaStringHTML(collection[0][id].mana)
        card.appendChild(mana)

        frame.append(card)
      }

      deckview.appendChild(frame)
    }
  }
}

const view = {
  repaint: function () {
    /* refresh view */
    const view = document.getElementById('viewport')
    view.innerHTML = ''

    /* get a sorted index array for collection */
    const index = sort.getSortIndex(collection)

    /* apply filters and draw */
    let count = 0
    for (let i = 0; i < index.length; i++) {
      const object = collection[0][index[i].key]
      if (filter.hasText(object) && filter.hasColor(object) && filter.hasType(object)) {
        view.appendChild(collection[0][index[i].key].frame)
        count++
      }
    }

    const results = document.getElementById('results')
    results.innerHTML = 'Found <span>' + count + '</span> cards.'
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

  view.repaint()
})
