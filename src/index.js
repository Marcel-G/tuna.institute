// @ts-check
import "modern-css-reset";
import "./styles.css";
import { Game } from "./game";
import { Tuna } from "./tuna";
import { Vector } from "./vector";
import { Boundary } from './boundary';

const main = () => {
  /**
   * @type {HTMLCanvasElement} canvas
   */
  const canvas = document.getElementById("background-image");
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffc0cb";
  context.fillRect(0, 0, canvas.width, canvas.height);
  document.addEventListener("click", () => {
    if (game.running) {
      game.stop();
    } else {
      game.start();
    }
  });

  const game = new Game(canvas);
  game.start();
  game.spawn(
    new Boundary(new Vector(canvas.clientWidth / 2, canvas.clientHeight - 100))
  );
  setInterval(() => {
    const offset = new Vector(Math.random() * canvas.clientWidth, 0);
    game.spawn(new Tuna(offset));
  }, 500)
};

document.addEventListener("DOMContentLoaded", main);
