import React, { Component } from 'react';
import AnalogClock, { Themes } from 'react-analog-clock';
import { dateAtTimezone } from './tz';
import './App.css';

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
    const {editing, cities, clockTheme} = this.state;
    const {store} = this.props;
    const context = {editing, store};
    return (
      <div>
        <div className="Clocks">
          {cities.map((city) =>
            <Clock {...context} city={store.cityInfo(city)} width="200" theme={Themes[clockTheme||'light']} />
          )}
          {editing ? <AddCity {...context}/> : []}
        </div>
        <EditingSwitch {...context}/>
      </div>
    );
  }
}

function EditingSwitch(props) {
  return <div className="EditingSwitch" mode={props.editing ? 'editing' : 'viewing'}
    onClick={() => props.store.setEditingMode(!props.editing)}
  >{props.editing ? 'Done' : 'Edit'}</div>
}

function AddCity(props) {
  return <div className="AddCity">
      {props.store.availableCities().map((city) =>
        <div onClick={() => props.store.addCity(city)}>{city}</div>
      )}
    </div>;
}

function RemoveCity(props) {
  return <div className="RemoveCity"
    onClick={() => props.store.removeCity(props.city.name)}
  >&#10006;</div>;
}

function Clock(props) {
  let { city, editing } = props;
  let date = dateAtTimezone(city.tz);
  console.log(date, props);
  function onClick() {
    if (editing) {
      props.store.nextClockTheme();
    }
  }
  return <div onClick={onClick} className="Clock">
    {editing ? <RemoveCity {...props} /> : []}
    <AnalogClock date={date} {...props} />
    <div className="cityName">{city.name}</div>
  </div>;
}

export default App;
