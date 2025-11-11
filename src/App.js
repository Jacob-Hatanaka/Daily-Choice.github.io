'use client';
import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import Cookies from 'universal-cookie';
const cookies = new Cookies();
// npm run deploy to crerate a gh-pages branch with the build folder
let Game = {};

class Resource {
  constructor(name, amount, displayed = true, gain = 0, unlockindex=0) {
    this.name = name;
    this.amount = cookies.get(name) ? parseInt(cookies.get(name)) : amount;
    this.gain = cookies.get(name + 'Gain') ? parseInt(cookies.get(name + 'Gain')) : gain;
    this.displayed = displayed;
    this.unlockindex = unlockindex;
  }
  addAmount(amount) {
    this.amount += amount;
    cookies.set(this.name, this.amount, { path: '/' });
    if (this.displayed) document.getElementById(this.name).innerHTML = this.name + ': ' + this.amount;
    window.location.reload();
  }
  setAmount(amount) {
    this.amount = amount;
    cookies.set(this.name, this.amount, { path: '/' });
    if (this.displayed) document.getElementById(this.name).innerHTML = this.name + ': ' + this.amount;
    window.location.reload();
  }
  addGain(gain) {
    this.gain += gain;
    cookies.set(this.name + 'Gain', this.gain, { path: '/' });
    if (this.displayed) document.getElementById(this.name).innerHTML = this.name + ': ' + this.amount;
    window.location.reload();
  }
  setGain(gain) {
    this.gain = gain;
    cookies.set(this.name + 'Gain', this.gain, { path: '/' });
    if (this.displayed) document.getElementById(this.name).innerHTML = this.name + ': ' + this.amount;
    window.location.reload();
  }
}
Game.resources = {
  daily: new Resource('daily', 0, false),
  unlocks: new Resource('unlocks', 0, false),
  choices: new Resource('choices', 0, true, 1, 0),
  decisions: new Resource('decisions', 0, true, 0, 1),
}
//special resources
cookies.get('lastChoiceClick') ? Game.lastDate = parseInt(cookies.get('lastChoiceClick')) : Game.lastDate = null;

//buttons

class ButtonAction {
  constructor(name, action, cost, tooltip, unlockindex=0) {
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
  }, { daily: 1 }, 'Make a choice to gain 1 Choice resource. Resets daily.'),
  makeDecision: new ButtonAction('Ponder Decisively', function () {
    Game.resources.decisions.addGain(1);
  }, { choices: 1 }, 'Ponder to gain 1 Decision resource per Make a Choice. Costs 1 Choice resource.',1),
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
  let timeUntilMidnight = (23-date.getHours())+'hrs, ' + (60-date.getMinutes())+'mins';
  return (
    <div className="d-flex flex-column min-vh-100">
      <Container className="flex-grow-1">
        <Row>
          <Col>
            {Object.entries(Game.resources).filter(([key, value]) => { return value.displayed && value.unlockindex <= Game.resources.unlocks.amount; }).map(([key, value]) => {
              const tooltipId = `tooltip-${key}`;
              return (
                <div>
                  <div id={value.name} key={key} className="tooltip-container d-inline-block m-2" tabIndex={0} aria-describedby={tooltipId}>
                    {value.name}: {value.amount}
                    {value.gain > 0 && <div id={tooltipId} role="tooltip" className="tooltip-text">
                      <p>Gain {value.gain} every Make a Choice</p>
                    </div>}
                  </div>
                </div>
              );
            })}
          </Col>
          <Col xs="8">
            {Object.entries(Game.buttonActions).filter(([key,value]) => { return value.unlockindex <= Game.resources.unlocks.amount; }).map(([key, value]) => {
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
                    <p>{value.tooptip}</p>
                  </div>}
                </div>
              );
            })}
          </Col>
        </Row>
      </Container>
      <footer className="mt-auto">
        <button onClick={() => {
          cookies.remove('choices', { path: '/' });
          cookies.remove('choicesGain', { path: '/' });
          cookies.remove('decisions', { path: '/' });
          cookies.remove('decisionsGain', { path: '/' });
          cookies.remove('lastChoiceClick', { path: '/' });
          cookies.remove('daily', { path: '/' });
          cookies.remove('unlocks', { path: '/' });
          window.location.reload();
        }}>Reset Game</button>
        &nbsp;next day in: {timeUntilMidnight}
      </footer>
    </div>
  );
}

/* to do
enable buttons when affordable again

*/