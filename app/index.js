import React from 'react'
import ReactDOM from 'react-dom'

const API_KEY = 'iumNWHtFimRyiaLUtcNMYicCnWoLaBJN'

function fetch (url, fn) {
  const http = new XMLHttpRequest()
  http.open('GET', url)
  http.send()
  http.onreadystatechange = function (e) {
    if (this.readyState === 4 && this.status === 200) {
      let data
      try { data = JSON.parse(http.responseText) }
      catch { data = null }
      fn(data)
    }
  }
}

class Page extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      gifs: [],
      loading: false,
      search: undefined,
      offset: 0,
      show_modal: false
    }
  }

  loadGIFs (term) {
    let endpoint = 'trending?'
    let offset = this.state.offset
    let isNew = false

    // if a search term is provided, use the search api
    if (term) {
      endpoint = `search?q=${encodeURIComponent(term)}&`
      if (term !== this.state.search) {
        offset = 0
        isNew = true
      }
    }

    // avoid making requests while 1 is in progress
    this.setState({ loading: true })

    fetch(`http://api.giphy.com/v1/gifs/${endpoint}api_key=${API_KEY}&limit=20&offset=${offset}`, obj => {
      let urls = []
      const currentGIFs = this.state.gifs

      // get the relevant data
      obj.data.forEach(gif => {
        urls.push({
          small: gif.images.preview_gif.url,
          large: gif.images.original.url
        })
      })

      this.setState({
        gifs: isNew ? urls : currentGIFs.concat(urls),
        loading: false,
        offset: offset + 20,
        search: term
      })
    })
  }

  componentDidMount () {
    this.loadGIFs(undefined)

    document.querySelector('.search').addEventListener('keyup', e => {
      if (e.keyCode === 13) {
        this.loadGIFs(e.target.value)
      }
    })

    window.addEventListener('scroll', () => {
      const el = document.querySelector('.gif-container')
      const rect = el.getBoundingClientRect()
      const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight)

      // check if the bottom of the container is in view
      // maybe check to see if we're scrolling down but not sure if that's necessary
      if (rect.bottom < viewHeight && this.state.loading === false) {
        this.loadGIFs(this.state.search)
      }
    })
  }


  render () {
    let key = 0
    let index = 0
    let columns = [[],[],[]]

    // evenly distribute gifs across three columns
    // so images can be evenly spaced apart
    this.state.gifs.forEach(gif => {
      columns[index].push(gif)
      index = index === 2 ? 0 : index + 1
    })

    return <div className='main-container'>
      {this.state.show_modal && <div className='modal' onClick={() => {
        this.setState({ show_modal: false })
      }}><img src={this.state.gif_url} /></div>}
      <input className='search' placeholder='SEARCH FOR GIFS' />
      {!this.state.gifs.length && <p className='message'>NO RESULTS</p>}
      <div className='gif-container'>
        {columns.map(column => {
          return <div key={key++} className='gif-column'>
            {column.map(gif => 
              <img className='gif' key={key++} src={gif.small} onClick={e => {
                this.setState({
                  gif_url: gif.large,
                  show_modal: true
                })
              }} />
            )}
          </div>
        })}
      </div>
    </div>
  }
}

ReactDOM.render(
  <Page />,
  document.getElementById('main')
)