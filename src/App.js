'use client';
import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import Cookies from 'universal-cookie';
const cookies = new Cookies();
// npm run deploy to crerate a gh-pages branch with the build folder
let Game = {};

class Resource {
  constructor(name, amount, displayed = true, gain = 0, unlockindex = 0) {
    this.name = name;
    this.amount = cookies.get(name) ? parseInt(cookies.get(name)) : amount;
    this.gain = cookies.get(name + 'Gain') ? parseInt(cookies.get(name + 'Gain')) : gain;
    this.displayed = displayed;
    this.unlockindex = unlockindex;
  }
  addAmount(amount) {
    this.amount += amount;
    cookies.set(this.name, this.amount, { path: '/' });
    if (this.isDisplayed()) document.getElementById(this.name).innerHTML = this.name + ': ' + this.amount;
    window.location.reload();
  }
  setAmount(amount) {
    this.amount = amount;
    cookies.set(this.name, this.amount, { path: '/' });
    if (this.isDisplayed()) document.getElementById(this.name).innerHTML = this.name + ': ' + this.amount;
    window.location.reload();
  }
  addGain(gain) {
    this.gain += gain;
    cookies.set(this.name + 'Gain', this.gain, { path: '/' });
    if (this.isDisplayed()) document.getElementById(this.name).innerHTML = this.name + ': ' + this.amount;
    window.location.reload();
  }
  setGain(gain) {
    this.gain = gain;
    cookies.set(this.name + 'Gain', this.gain, { path: '/' });
    if (this.isDisplayed()) document.getElementById(this.name).innerHTML = this.name + ': ' + this.amount;
    window.location.reload();
  }
  isDisplayed() {
    return this.displayed && this.unlockindex <= Game.resources.unlocks.amount;
  }
}
Game.resources = {
  daily: new Resource('daily', 0, false),
  unlocks: new Resource('unlocks', 0, false),
  choices: new Resource('choices', 0, true, 1, 0),
  decisions: new Resource('decisions', 0, true, 0, 1),
  action: new Resource('action', 0, true, 0, 2),
  patience: new Resource('patience', 0, true, 0, 2),
}
//special resources
cookies.get('lastChoiceClick') ? Game.lastDate = parseInt(cookies.get('lastChoiceClick')) : Game.lastDate = null;

//buttons

class ButtonAction {
  constructor(name, action, cost, unlockindex = 0, tooltip) {
    this.name = name;
    this.action = action;
    this.cost = cost;
    this.tooptip = tooltip;
    this.unlockindex = unlockindex;
  }
  canAfford() {
    if (!this.cost) return true;
    for (let resource in this.cost) {
      if (Game.resources[resource].amount < this.cost[resource]) {
        return false;
      }
    }
    return true;
  }
  payCost() {
    if (!this.cost) return;
    for (let resource in this.cost) {
      Game.resources[resource].addAmount(-this.cost[resource]);
    }
    window.location.reload();
  }
}

Game.buttonActions = {
  makeChoice: new ButtonAction('Make a Choice', function () {
    Object.keys(Game.resources).forEach((key) => {
      if (Game.resources[key].gain > 0) {
        Game.resources[key].addAmount(Game.resources[key].gain);
      }
    });
    cookies.set('lastChoiceClick', getNumericalDate(), { path: '/' });
  }, { daily: 1 }, 0, 'Resets daily.'),

  makeDecision: new ButtonAction('Ponder', function () { //perhaps the buttons with names not including its own resource gives gain but those with its resource simply give it
    Game.resources.decisions.addGain(1);
  }, { choices: 1 }, 1, 'To which should thy thoughts lie, perhaps you should Ponder. Costs 1 Choice resource.'),

  takeAction: new ButtonAction('Take Action', function () {
    Game.resources.action.addAmount(1 + (Game.resources.patience.amount > Game.resources.action.amount));
  }, { decisions: 1 }, 2, 'Hesitation leads to death, be swift, Take Action. Costs 1 Decision resource.'),

  waitPatiently: new ButtonAction('Wait Patiently', function () {
    Game.resources.patience.addAmount(1 + (Game.resources.action.amount > Game.resources.patience.amount));
  }, { decisions: 1 }, 2, 'Swiftness only goads error, Wait Patiently. Costs 1 Decision resource.'),
}

function getNumericalDate() {
  let date = new Date();
  return parseInt(date.getFullYear() + '' + (date.getMonth() + 1) + '' + date.getDate());
}

export default function App() {
  const [currentTime, setCurrentTime] = useState(getNumericalDate());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(getNumericalDate());
    }, 60 * 1000); // Update every 60 seconds (1 minute)
    if (Game.resources.daily.amount == 0 && Game.lastDate < currentTime) {
      Game.resources.daily.addAmount(1);
    }
    return () => clearInterval(intervalId);
  }, []);
  let date = new Date();
  let timeUntilMidnight = (23 - date.getHours()) + 'hrs, ' + (60 - date.getMinutes()) + 'mins';
  return (
    <div className="d-flex flex-column min-vh-100">
      <Container className="flex-grow-1">
        <Row>
          <Col>
            {Object.entries(Game.resources).filter(([key, value]) => { return value.isDisplayed(); }).map(([key, value]) => {
              const tooltipId = `tooltip-${key}`;
              return (
                <div key={key}>
                  <div className="tooltip-container d-inline-block m-2" tabIndex={0} aria-describedby={tooltipId}>
                    <p id={value.name} className="m-0">{value.name}: {value.amount}</p>
                    {value.gain > 0 && <div id={tooltipId} role="tooltip" className="tooltip-text">
                      <p>Gain {value.gain} every Make a Choice</p>
                    </div>}
                  </div>
                </div>
              );
            })}
          </Col>
          <Col xs="8">
            {Object.entries(Game.buttonActions).filter(([key, value]) => { return value.unlockindex <= Game.resources.unlocks.amount; }).map(([key, value]) => {
              const tooltipId = `tooltip-${key}`;
              return (
                <div key={key} className="tooltip-container d-inline-block m-2" tabIndex={0} aria-describedby={tooltipId}>
                  <Button id={value.name} onClick={function () {
                    if (value.canAfford()) {
                      value.payCost();
                      value.action();
                      if (value.unlockindex === Game.resources.unlocks.amount) {
                        Game.resources.unlocks.addAmount(1);
                      }
                    } else {
                      console.log('Not enough resources!');
                    }
                  }} className="tooltip-button" disabled={!value.canAfford()}>
                    <h3 className="m-0">{value.name}</h3>
                  </Button>
                  {value.tooptip && <div id={tooltipId} role="tooltip" className="tooltip-text">
                    <h3 className="m-0">{value.name}</h3>
                    {value.tooptip.split('\n').map((line, index) => (
                      <p key={index} className="m-0">{line}</p>
                    ))}
                  </div>}
                </div>
              );
            })}
          </Col>
        </Row>
      </Container>
      <footer className="mt-auto">
        <button onClick={() => {
          for (let resource in Game.resources) {
            cookies.remove(Game.resources[resource].name, { path: '/' });
            cookies.remove(Game.resources[resource].name + 'Gain', { path: '/' });
          }
          cookies.remove('lastChoiceClick', { path: '/' });
          window.location.reload();
        }}>Reset Game</button>
        &nbsp;next day in: {timeUntilMidnight}&nbsp;
        <button onClick={() => { Game.resources.daily.addAmount(1); }} className='d-none'>Skip to Next Day</button>
      </footer>
    </div >
  );
}

/* to do
  add cheat cookie for next day button for testing
  add function to action and patience
  hold- wait for time (give up daily choice)
*/