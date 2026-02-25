'use client';
import { useEffect, useState } from "react";
import { Button, Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import Cookies from 'universal-cookie';
const cookies = new Cookies();
// npm run deploy to crerate a gh-pages branch with the build folder
let Game = {};
class Resource {
  constructor(name, amount, displayed = true) {
    this.name = name;
    this.amount = cookies.get(name) ? parseInt(cookies.get(name)) : amount;
    this.displayed = displayed;
  }
  addAmount(amount) {
    this.amount += amount;
    cookies.set(this.name, this.amount, { path: '/' });
    if (this.isDisplayed()) document.getElementById(this.name).innerHTML = this.name + ': ' + this.amount;
  }
  setAmount(amount) {
    this.amount = amount;
    cookies.set(this.name, this.amount, { path: '/' });
    if (this.isDisplayed()) document.getElementById(this.name).innerHTML = this.name + ': ' + this.amount;
  }
  isDisplayed() {
    return this.displayed;
  }
}
Game.resources = {
  money: new Resource('money', 1, true),
  plants: new Resource('plants', 0, true),
  plotsize: new Resource('plotsize', 1, true),
  plantlevel: new Resource('plantlevel', 0, true),

};
class ButtonAction {
  constructor(name, action, cost, tooltip) {
    this.name = name;//name of button display
    this.action = action;//name of function to call on click (mostly just adds resource or gain)
    this.cost = cost;//resources required to click button
    this.tooltip = tooltip;//quote and cost
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
  }
}
Game.buttonActions = {
  buyPlant: new ButtonAction('Buy Plant', function () {
    Game.resources.plants.addAmount(1);
  }, { money: Game.resources.plants.amount*Game.resources.plantlevel.amount }, 'Cost: ' + Game.resources.plants.amount*Game.resources.plantlevel.amount + ' money'),
}
Game.time = 0;
const Plant =() => {
  disableTimer = -1;
  return  
    (
    <Button onClick={function () {Game.time += 1;Game.resources.money.addAmount(1+Game.resources.plantlevel.amount);disableTimer = Game.time+5;window.location.reload();}} disabled={disableTimer > Game.time}>
       
    </Button>
    );
};
/*
//special resources
cookies.get('lastChoiceClick') ? Game.lastDate = parseInt(cookies.get('lastChoiceClick')) : Game.lastDate = null;
}*/

function getNumericalDate() {
  let date = new Date();
  return parseInt(date.getFullYear() + '' + (date.getMonth() + 1) + '' + date.getDate());
}

export default function App() {
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
                  </div>
                </div>
              );
            })}
          </Col>
          <Col xs="8">
          <div>
          {Object.entries(Game.buttonActions).map(([key, value]) => {
                  const tooltipId = `tooltip-${key}`;
                  return (
                    <div key={key} className="tooltip-container d-inline-block m-2" tabIndex={0} aria-describedby={tooltipId}>
                      <Button id={value.name} onClick={function () {
                        if (value.canAfford()) {
                          value.payCost();
                          value.action();
                          window.location.reload();
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
            <div>
                <Button onClick={() => {Game.time += 1;window.location.reload();}}>Wait</Button>
            </div>
            <div>
              {Array.from({ length: Game.resources.plotsize.amount }, (v, i) => i).map((i) => (
                <div key={i} className="plot-cell">
                  {Array.from({length:Game.resources.plants.amount}, (v, j) => j).map((j) => (
                    <Plant key={j} />
                  ))}
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </Container>
      <footer className="mt-auto mx-2">
        <Navbar className="d-flex">
          <Nav className="me-auto">
            <button onClick={() => {
              for (let resource in Game.resources) {
                cookies.remove(Game.resources[resource].name, { path: '/' });
              }
              window.location.reload();
            }} className="mx-2">Reset Game</button>
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
  /*const [currentTime, setCurrentTime] = useState(getNumericalDate());
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
                          window.location.reload();
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
  );*/
}

/* to do
  fix loading so it doesnt flash
  hold- wait for time (give up daily choice)
*/