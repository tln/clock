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

export default class Store extends EventEmitter {
  emitChange() {
    this.emit('change', this.state);
  }

  // stores state in hash.
  // provides abstractions over the state.
  constructor() {
    super();
    this.state = {};
    let hash = window.location.hash.replace(/^#/, '');
    if (hash) {
      try {
        this.setNewState(JSON.parse(hash));
      } catch(e) {
        console.log("Bad hash:", hash);
        window.location.hash = '';
        this.setNewState({});
      }
    } else {
      this.setNewState({});
    }
  }

  setNewState(newState) {
    if (!newState.cities) {
      newState.cities = ['San Francisco'];
    }
    this.state = newState;
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
    window.location.hash = JSON.stringify(this.state);
  }

  availableCities() {
    return Object.keys(CITIES).filter((city) => this.state.cities.indexOf(city) == -1);
  }

  cityInfo(city) {
    return {name: city, tz: CITIES[city]};
  }

  setEditingMode(editing) {
    this.state.editing = editing;
    this.emitChange();
    this.updateHash();
  }
}
