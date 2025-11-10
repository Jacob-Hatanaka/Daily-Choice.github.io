'use client';
import { useState } from "react";
import Cookies from 'universal-cookie';
const cookies = new Cookies();

let Game = {};
cookies.get('value') ? Game.value = parseInt(cookies.get('value')) : Game.value = 0;
Game.ValueClick=function() {
  console.log('clicked');
  cookies.set('value', ++Game.value, { path: '/' });//cookies.get('value')
  document.getElementById('addValue').innerHTML = Game.value;
}

export default function App() {
  return <button id="addValue" onClick={function(){Game.ValueClick()}}>{Game.value}</button>;
}
