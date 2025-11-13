'use client';
import { useEffect, useState } from "react";
import { Button, Col, Container, Nav, Navbar, Row } from "react-bootstrap";
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
  patience: new Resource('patience', 0, true, 0, 2),
  action: new Resource('action', 0, true, 0, 3),
  balance: new Resource('balance', 0, true, 0, 6),
}
//special resources
cookies.get('lastChoiceClick') ? Game.lastDate = parseInt(cookies.get('lastChoiceClick')) : Game.lastDate = null;

//buttons

class ButtonAction {
  constructor(name, action, cost, unlockindex, roworder, tooltip) {
    this.name = name;//name of button display
    this.action = action;//name of function to call on click (mostly just adds resource or gain)
    this.cost = cost;//resources required to click button
    this.tooptip = tooltip;//quote and cost
    this.unlockindex = unlockindex;//level of unlock required
    this.roworder = unlockindex;//level in the row of buttons this appears
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
  }, { daily: 1 }, 0, 0, 'Resets daily.'),

  makeDecision: new ButtonAction('Ponder', function () { //perhaps the buttons with names not including its own resource gives gain but those with its resource simply give it
    Game.resources.decisions.addGain(1);
  }, { choices: 1 }, 1, 0, '\'Choices are the hinges of destiny\', perhaps you should Ponder. Costs 1 Choice.'),//Edmund Markham or Pythagoras?

  waitPatiently: new ButtonAction('Wait Patiently', function () {
    Game.resources.patience.addAmount(1);
  }, { decisions: 1 }, 2, 1, '\'To the mind that is still, the whole universe surrenders\', Wait Patiently. Costs 1 Decision.'), //Lao Tzu

  takeAction: new ButtonAction('Take Action', function () {
    Game.resources.action.addAmount(1);
  }, { decisions: 1, patience: 1 }, 3, 1, '\'He who hesitates is lost\', Take Action. Costs 1 Decision and 1 Patience.'),//Joseph Addison 

  quickThinking: new ButtonAction('Quick Thinking', function () {
    Game.resources.choices.addGain(1);
  }, { choices: 1, action: 1 }, 4, 2, '\'What are we busy about?.\' Costs 1 Choice and 1 Action.'), //Henry David Thoreau It is not enough to be busy; so are the ants. The question is: What are we busy about?

  stillness: new ButtonAction('Embrace Stillness', function () {
    Game.resources.patience.addGain(1);
  }, { choices: 1, patience: 1 }, 4, 2, '\'In the midst of movement and chaos, keep stillness inside of you,\' Embrace Stillness. Costs 1 Choice and 1 Patience.'), //Deepak Chopra

  cycleAction: new ButtonAction('Cycle', function () {
    Game.resources.action.addGain(1);
  }, { action: 1, patience: 1 }, 5, 3, '\'Nature does not hurry, yet everything is accomplished.\' Costs 1 Action and 1 Patience.'), //Lao Tzu

  balance: new ButtonAction('Balance', function () {
    Game.resources.balance.addAmount(1);
  }, { choices: 2, decisions: 2, patience: 5, action: 5 }, 6, 3, 'Find the converging path. Costs 2 Choices, 2 Decisions, 5 Patience, and 5 Action.'),

  //'\'Happiness is not a matter of intensity but of balance, order, rhythm and harmony.\' can be used when we have all of those resources
}

function getNumericalDate() {
  let date = new Date();
  return parseInt(date.getFullYear() + '' + (date.getMonth() + 1) + '' + date.getDate());
}

export default function App() {
  const [currentTime, setCurrentTime] = useState(getNumericalDate());
  //cookies.set('cheats', true, { path: '/' }); //uncomment to enable cheats for testing
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
      <Navbar className="topnav m-0 py-1 px-2">
        <Navbar.Brand href="#home">Daily Choice</Navbar.Brand>
      </Navbar>
      <Container className="flex-grow-1 mt-3">
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
            {Array.from({ length: Game.resources.unlocks.amount + 1 }, (v, i) => i).map((currentstep) =>
            (
              <div key={currentstep}>
                {Object.entries(Game.buttonActions).filter(([key, value]) => { return value.roworder == currentstep && value.unlockindex <= Game.resources.unlocks.amount; }).map(([key, value]) => {
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
              </div>
            ))}
          </Col>
        </Row>
      </Container>
      <footer className="mt-auto mx-2">
        <Navbar className="d-flex">
          <Nav className="me-auto">
            <button onClick={() => {
              for (let resource in Game.resources) {
                cookies.remove(Game.resources[resource].name, { path: '/' });
                cookies.remove(Game.resources[resource].name + 'Gain', { path: '/' });
              }
              cookies.remove('lastChoiceClick', { path: '/' });
              window.location.reload();
            }} className="mx-2">Reset Game</button>
            next day in: {timeUntilMidnight}
            <button onClick={() => { Game.resources.daily.addAmount(1); }} className={cookies.get('cheats') ? 'mx-2' : 'd-none'}>Skip to Next Day</button>
          </Nav>
          <Nav className="ms-auto">
            <Nav.Link href="https://ko-fi.com/nyancake" target="_blank" rel="noopener noreferrer">
              <img
                src="https://cdn.ko-fi.com/cdn/kofi3.png?v=2"
                alt="Buy Me a Coffee at ko-fi.com"
                style={{ height: '36px' }}
              />
            </Nav.Link>
          </Nav>
        </Navbar>
      </footer>
    </div >
  );
}

/* to do
  add cheat cookie for next day button for testing
  add function to action and patience
  hold- wait for time (give up daily choice)
*/