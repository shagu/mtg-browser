  /* filter logic and variables */
  const filter = {
    activecolor: '',
    activetext: '',
    activetype: 'instantcreaturesorceryartifactenchantmentplaneswalker',

    toggle: function(self) {
      let types = document.getElementById('types')
      let sort = document.getElementById('sort')

      self.classList.remove("selected")

      if (types.style.display == "inline-block") {
        types.style.display = "none"
        sort.style.display = "none"
      } else {
        types.style.display = "inline-block"
        sort.style.display = "inline-block"
        self.classList.add("selected")
      }
    },

    setColor: function(color) {
      if (!color) { return }
      let button = document.getElementById('filter-'+color)
      if (filter.activecolor.includes(color)) {
        filter.activecolor = filter.activecolor.replace(color,'')
        button.classList.remove("selected")
      } else {
        filter.activecolor = filter.activecolor + color
        button.classList.add("selected")
      }

      view.repaint()
    },

    setText: function() {
      filter.activetext = document.getElementById('search-text').value
      view.repaint()
    },

    setType: function(type) {
      if (!type) { return }
      let button = document.getElementById('types-'+type)
      if (filter.activetype.includes(type)) {
        filter.activetype = filter.activetype.replace(type,'')
        button.classList.remove("selected")
      } else {
        filter.activetype = filter.activetype + type
        button.classList.add("selected")
      }

      view.repaint()
    },

    hasColor: function(object) {
      if (!filter.activecolor) { return true }
      if (filter.activecolor.includes("a") && !object.color) { return true }
      if (!object.color) { return false }
      if (object.color.includes(",") && filter.activecolor.includes("m")) { return true }
      for (color of object.color.toLowerCase().split(",")) {
        if (!filter.activecolor.toLowerCase().includes(color)) { return false }
      }
      return true
    },

    hasText: function(object) {
      if (!filter.activetext) { return true }
      if (object.name && object.name.toLowerCase().includes(filter.activetext.toLowerCase())) { return true }
      if (object.name_lang && object.name_lang.toLowerCase().includes(filter.activetext.toLowerCase())) { return true }
      return false
    },

    hasType: function(object) {
      if (!filter.activetype) { return true }
      if (filter.activetype.includes("a") && !object.types) { return true }
      if (!object.types) { return false }

      for (type of object.types.toLowerCase().split(",")) {
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
      mythic:16,
    },

    setMode: function(mode) {
      sort.mode = mode

      /* switch asc/desc on 2nd click */
      let button = document.getElementById('sort-'+sort.mode)
      let arrow = document.getElementById('sort-'+sort.mode+"-arrow")
      if (button.classList.contains("selected")) {
        if (button.classList.contains("asc")) {
          arrow.innerHTML = "▲"
          button.classList.remove("asc")
          button.classList.add("desc")
          sort.reverse = false
        } else {
          arrow.innerHTML = "▼"
          button.classList.remove("desc")
          button.classList.add("asc")
          sort.reverse = true
        }
      }

      /* make selected sort method visible */
      var buttons = document.getElementsByClassName("sort");
      for (var i = 0; i < buttons.length; i++) {
        buttons.item(i).classList.remove("selected")
      }
      button.classList.add("selected")

      view.repaint()
    },

    getSortIndex: function(collection) {
      /* build the search index */
      var index = []
      for (var x in collection[0]) {
        let tmp = collection[0][x][sort.mode] ? collection[0][x][sort.mode] : "Z"

        /* use proper order for rarities */
        if (sort.mode == "rarity") {
          tmp = collection[0][x][sort.mode] ? collection[0][x][sort.mode] : "unknown"
          tmp = sort.raritymap[tmp]
        }

        index.push({ 'key': x, 'cmp': tmp })
      }


      index.sort(function (a, b) {
        var as = a['cmp'], bs = b['cmp']
        return as == bs ? 0 : (as > bs ? 1 : -1)
      })

      if (sort.reverse) {
        index.reverse()
      }

      return index
    },
  }

  /* preview popup */
  const preview = {
    show: function(self, id) {
      let preview = document.getElementById('preview')
      let image = document.getElementById('preview-image')
      image.src = self.url
      preview.style.visibility = "visible"
    },
    hide: function(self, id) {
      let preview = document.getElementById('preview')
      preview.style.visibility = "hidden"
    }
  }

  const decks = {
    drag: '',
    data: {
      'Enter Deckname': {
        '{G} Adventurous Impulse {Sorcery} (1)': 1,
      },
    },

    toggle: function() {
      let deckbuilder = document.getElementById('deckbuilder')
      let button = document.getElementById('deckbuilder-toggle')
      let viewport = document.getElementById('viewport')

      if(deckbuilder.style.width == '60px' || !deckbuilder.style.width) {
        deckbuilder.style.width = '500px'
        viewport.style.width = 'calc(100% - 500px)'
        button.innerHTML = "▼ Decks"
      } else {
        deckbuilder.style.width = '60px'
        viewport.style.width = 'calc(100% - 55px)'
        button.innerHTML = "▲ Decks"
      }

      decks.reload()
    },

    reload: function() {
      const deckview = document.getElementById('decks')
      deckview.innerHTML = ""

      for (const [name, deck] of Object.entries(decks.data)) {
        /* deckbox main frame */
        const frame = document.createElement('div')
        frame.className = "deck"

        const header = document.createElement('div')
        header.className = "deck-header"
        frame.appendChild(header)

        const caption = document.createElement('span')
        caption.className = "deck-title"
        caption.innerHTML = name
        header.appendChild(caption)

        frame.ondrop = function (ev) {
          console.log(decks.drag)
        }

        frame.ondragover=function (ev) {
          ev.preventDefault()
          let deckbuilder = document.getElementById('deckbuilder')
          let button = document.getElementById('deckbuilder-toggle')
        }

        frame.ondragleave = function (ev) {
          let deckbuilder = document.getElementById('deckbuilder')
          let button = document.getElementById('deckbuilder-toggle')
        }

        /* create deck card entries */
        for (const [id, place] of Object.entries(deck)) {

        }

        deckview.appendChild(frame)
      }
    }
  }

  const view = {
    repaint: function() {
      /* refresh view */
      let view = document.getElementById('viewport')
      view.innerHTML = ""

      /* get a sorted index array for collection */
      let index = sort.getSortIndex(collection)

      /* apply filters and draw */
      let count = 0
      for (var i = 0; i < index.length; i++) {
        let object = collection[0][index[i]['key']]
        if (filter.hasText(object) && filter.hasColor(object) && filter.hasType(object)) {
          view.appendChild(collection[0][index[i]['key']].frame)
          count++
        }
      }

      let results = document.getElementById('results')
      results.innerHTML = "Found <span>" + count + "</span> cards."
    },

    createCard: function(id, data) {
      // card root frame
      const frame = document.createElement('div')
      frame.className = "card"
      frame.setAttribute('draggable', true)
      frame.ondragstart = function() {
        frame.style.border = '1px #3fc solid'
        decks.drag = id
      }

      frame.ondragend = function() {
        frame.style.border = ''
        decks.drag = ""
      }

      // card image
      const image = document.createElement('div')
      image.className = "card-image lazy"
      image.setAttribute("data-src", "url(\"collection/" + id + ".jpg\")")
      image.url = "collection/" + id + ".jpg"
      image.onclick = function() { preview.show(image, id) }
      frame.append(image)

      // card title
      title = document.createElement('div')
      title.className = "card-title"
      title.innerHTML = data.name
      frame.append(title)

      return frame
    }
  }

  /* update elements on responsive layout changes */
  window.onresize = function(self) {
    let filter = document.getElementById('filter')
    let types = document.getElementById('types')
    let sort = document.getElementById('sort')

    /* ensure visibility of advanced filters in full mode */
    if (window.innerWidth >= 1090) {
      types.style.display = "inline-block"
      sort.style.display = "inline-block"
      filter.classList.add("selected")
    }

    /* update filter button state */
    if (types.style.display == "inline-block") {
      filter.classList.add("selected")
    } else {
      filter.classList.remove("selected")
    }
  }

  /* initialize viewport */
  document.addEventListener("DOMContentLoaded", function() {
    let viewport = document.getElementById('viewport')

    for (var key in collection[0]) {
      if (typeof collection[0][key].frame === 'undefined') {
        collection[0][key].frame = view.createCard(key, collection[0][key])
        collection[0][key].frame.parent = collection[0][key]
      }
      viewport.appendChild(collection[0][key].frame)
    }

    let lazyloadImages = document.querySelectorAll(".lazy")
    let options = {
      rootMargin: '1000px 0px',
      threshold: 0.1
    }

    var imageObserver = new IntersectionObserver (function (entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var image = entry.target
          image.style.backgroundImage = image.dataset.src
          image.classList.remove("lazy")
          imageObserver.unobserve(image)
        }
      })
    }, options)

    lazyloadImages.forEach(function(image) {
      imageObserver.observe(image)
    })

    view.repaint()
  })