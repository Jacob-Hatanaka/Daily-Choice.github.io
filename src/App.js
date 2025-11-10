'use client';
import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import Cookies from 'universal-cookie';
const cookies = new Cookies();
// npm run deploy to crerate a gh-pages branch with the build folder
let Game = {};

class Resource {
  constructor(name, amount) {
    this.name = name;
    this.amount = cookies.get(name) ? parseInt(cookies.get(name)) : amount;
  }
  addAmount(amount) {
    this.amount += amount;
    cookies.set(this.name, this.amount, { path: '/' });
    document.getElementById(this.name).innerHTML = this.name + ': ' + this.amount;
  }
}
Game.resources = {
  choices: new Resource('choices', 0),
  decisions: new Resource('decisions', 0),
}
cookies.get('lastChoiceClick') ? Game.lastDate = parseInt(cookies.get('lastChoiceClick')) : Game.lastDate = null;
Game.ChoiceClick = function () {
  Game.resources.choices.addAmount(1);
  cookies.set('lastChoiceClick', getNumericalDate(), { path: '/' });
  //document.getElementById('addValue').innerHTML = Game.value;
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

    return () => clearInterval(intervalId);
  }, []);
  console.log(Game.resources);
  console.log(currentTime, cookies.get('lastChoiceClick'));
  return (
    <div>
      <Container>
        <Row>
          <Col>
            {Object.entries(Game.resources).map(([key, value]) => (
              <div id={value.name} key={key}>{value.name}: {value.amount}</div>
            ))}
          </Col>
          <Col xs="8">
            <Button id="addValue" onClick={function () { Game.ChoiceClick(); document.getElementById('addValue').disabled=true; }} disabled={cookies.get('lastChoiceClick') && cookies.get('lastChoiceClick') === currentTime}>Make a Choice</Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
