// @ts-check
import "modern-css-reset";
import "./styles.css";
import { Game } from "./game";
import { Tuna } from "./tuna";
import { Vector } from "./vector";
import { Boundary } from './boundary';

const main = () => {
  const canvas = document.getElementById("background-image")! as HTMLCanvasElement;
  const context = (canvas as any).getContext("2d");
  context.fillStyle = "#ffc0cb";
  context.fillRect(0, 0, (canvas as any).width, (canvas as any).height);
  document.addEventListener("click", () => {
    if (game.running) {
      game.stop();
    } else {
      game.start();
    }
  });
  window.addEventListener('blur', () => {
    game.stop();
  })

  window.addEventListener('focus', () => {
    game.start();
  })

  const game = new Game(canvas);
  // game.debug = true;
  game.start();
  game.spawn(
    new Boundary(new Vector(canvas.clientWidth / 2, canvas.clientHeight + 10))
  );
  setInterval(() => {
    const offset = new Vector(Math.random() * canvas.clientWidth, 0);
    game.spawn(new Tuna(offset));
  }, 500)
};

document.addEventListener("DOMContentLoaded", main);
