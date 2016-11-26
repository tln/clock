import React, { Component } from 'react';
import AnalogClock, { Themes } from 'react-analog-clock';
import { dateAtTimezone } from './tz';
import './App.css';

// Wraps event handler, calls iff editing is set.
// Stops event propogation.
var appEditing;
function editHandler(func) {
  return (event) => {
    event.stopPropagation();
    if (appEditing) func();
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = props.store.state;
    props.store.on('change', (state) => {
      console.log('change', state);
      this.setState(state);
    });
  }

  render() {
    const {
      editing, cities, clockTheme, backgroundTheme, enableEditing
    } = this.state;
    const {store} = this.props;
    const context = {editing, store};
    appEditing = editing;  // update wrapper state
    return (
      <div>
        <div onClick={editHandler(() => store.nextBackgroundTheme())} className={`Clocks theme-${backgroundTheme}`}>
          {cities.map((city) =>
            <Clock {...context} city={store.cityInfo(city)} width="200" theme={Themes[clockTheme||'light']} />
          )}
          {editing ? <AddCity {...context}/> : []}
        </div>
        {enableEditing ? <EditingSwitch {...context}/> : []}
      </div>
    );
  }
}

function EditingSwitch(props) {
  return <div className="EditingSwitch" mode={props.editing ? 'editing' : 'viewing'}
    onClick={(event) => {
      event.stopPropagation();
      props.store.setEditingMode(!props.editing);
    }}
  >{props.editing ? 'Done' : 'Edit'}</div>
}

function AddCity(props) {
  return <div className="AddCity">
      {props.store.availableCities().map((city) =>
        <div onClick={editHandler(() => props.store.addCity(city))}>{city}</div>
      )}
    </div>;
}

function RemoveCity(props) {
  return <div className="RemoveCity"
    onClick={editHandler(() => props.store.removeCity(props.city.name))}
  >&#10006;</div>;
}

function Clock(props) {
  let { city, editing } = props;
  let date = dateAtTimezone(city.tz);
  console.log(date, props);
  return <div onClick={editHandler(() => props.store.nextClockTheme())} className="Clock">
    {editing ? <RemoveCity {...props} /> : []}
    <AnalogClock date={date} {...props} />
    <div className="cityName">{city.name}</div>
  </div>;
}

export default App;
