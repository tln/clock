import { EventEmitter } from 'events';

const CITIES = {
  'Los Angeles': 'US/Pacific',
  'San Francisco': 'US/Pacific',
  'New York': 'US/Eastern',
  'London': 'Europe/London',
  'Paris': 'Europe/Paris',
  'Moscow': 'Europe/Moscow',
  'Dubai': 'Asia/Dubai',
  'Beijing': 'Asia/Shanghai',
  'Tokyo': 'Asia/Tokyo',
}

const CLOCK_THEMES = [
  'light',
  'dark',
  'aqua',
  'lime',
  'sherbert',
  'navy',
]

const BACKGROUND_THEMES = [
  'light',
  'dark'
]

function successor(list, item) {
  return list[(list.indexOf(item)+1)%list.length];
}

// stores state in hash.
// provides abstractions over the state.
// When in an iframe, editing is disabled unless a message
// is posted to the window.
export default class Store extends EventEmitter {
  emitChange() {
    this.emit('change', this.state);
  }

  constructor() {
    super();
    this.state = {};
    this.initFrameProtocol();
    let hash = window.location.hash.replace(/^#/, '');
    if (hash) {
      try {
        Object.assign(this.state, JSON.parse(hash));
      } catch(e) {
        console.log("Bad hash:", hash);
        window.location.hash = '';
      }
    }
    this.setDefaults();
  }

  initFrameProtocol() {
    this.postUrlChanges = false;
    this.state = {enableEditing: this.isTopWindow()};
    this.listenToPostMessage();
  }

  isTopWindow() {
    try {
      return window.parent === window;
    } catch(e) {
      // If we get an access violation, we can't be top window.
      return false;
    }
  }

  listenToPostMessage() {
    if (!this.isTopWindow()) {
      // enable editing protocol:
      // 1. send message to parent with data {message:'widget-edit-enabled'}
      // 2. listen for message from parent with {message:'enable-widget-edit'}
      // 3. send messages to parent with {message:'widget-edited',url:...}
      window.addEventListener('message', (event) =>{
        console.log("message", event.data);
        if (event.data.message === 'enable-widget-edit') {
          // Enable editing
          this.state.enableEditing = true;
          this.postUrlChanges = true;
          this.emitChange();
          this.updateHash();
        }
      });
      window.parent.postMessage({message:'widget-edit-enabled'}, '*');
    }
  }

  setDefaults() {
    if (!this.state.cities) {
      this.state.cities = ['San Francisco'];
    }
    if (!this.state.clockTheme) {
      this.state.clockTheme = 'light';
    }
  }

  addCity(cityName) {
    this.state.cities.push(cityName);
    this.emitChange();
    this.updateHash();
  }

  removeCity(cityName) {
    const ix = this.state.cities.indexOf(cityName);
    if (ix >= 0) {
      this.state.cities.splice(ix, 1);
      this.emitChange();
      this.updateHash();
    }
  }

  updateHash() {
    const hashState = Object.assign({}, this.state);
    delete hashState.editing;
    delete hashState.enableEditing;
    window.location.hash = JSON.stringify(hashState);
    if (this.postUrlChanges) {
      window.parent.postMessage({
        message: 'widget-edited',
        url: window.location+''
      }, '*');
    }
  }

  availableCities() {
    return Object.keys(CITIES).filter((city) => this.state.cities.indexOf(city) === -1);
  }

  cityInfo(city) {
    return {name: city, tz: CITIES[city]};
  }

  setEditingMode(editing) {
    this.state.editing = editing;
    this.emitChange();
    this.updateHash();
  }

  nextClockTheme() {
    this.state.clockTheme = successor(CLOCK_THEMES, this.state.clockTheme);
    this.emitChange();
    this.updateHash();
  }

  nextBackgroundTheme() {
    this.state.backgroundTheme = successor(BACKGROUND_THEMES, this.state.backgroundTheme);
    this.emitChange();
    this.updateHash();
  }
}
