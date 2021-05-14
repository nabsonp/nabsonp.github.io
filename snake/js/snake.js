(function () {
  const Evento = {
    GAME_OVER: "GAME_OVER",
    COIN_COLLECTED: "COIN_COLLECTED",
  };
  const Direcao = {
    CIMA: 0,
    DIREITA: 1,
    BAIXO: 2,
    ESQUERDA: 3,
  };
  const TAM = 40;
  let FPS = 5;
  let board;
  let snake;
  let coin;
  let playing;
  let gameOver;
  let pause;
  let frames;

  function init() {
    load();
    board.showInitModal();
  }

  function load() {
    document.body.innerHTML = "";
    board = new Board();
    snake = new Snake();
    FPS = 5;
    coin = undefined;
    playing = false;
    pause = false;
    gameOver = false;
    frames = 0;
  }

  window.addEventListener("keydown", function (e) {
    switch (e.key) {
      case "ArrowUp":
        snake.mudarDirecao(Direcao.CIMA);
        break;
      case "ArrowRight":
        snake.mudarDirecao(Direcao.DIREITA);
        break;
      case "ArrowDown":
        snake.mudarDirecao(Direcao.BAIXO);
        break;
      case "ArrowLeft":
        snake.mudarDirecao(Direcao.ESQUERDA);
        break;
      case "s":
        if (playing) break;

        if (gameOver) {
          load()
        } else {
          board.closeModal();
        }

        playing = true;
        run();
        break;
      case "p":
        if (pause) {
          pause = false;
          board.closeModal()
          run();
        } else {
          board.showPauseModal()
          pause = true;
        }
        break;
    }
  });

  class Board {
    constructor() {
      this.modal = document.createElement("div");
      this.header = document.createElement("span");
      this.header.innerHTML = "00000";
      this.pontuacao = 0;

      this.element = document.createElement("table");
      this.element.setAttribute("id", "board");
      this.cor = "#EEEEEE";
      for (let i = 0; i < TAM; i++) {
        let row = document.createElement("tr");
        for (let j = 0; j < TAM; j++) {
          let campo = document.createElement("td");
          row.appendChild(campo);
        }
        this.element.appendChild(row);
      }
      document.body.prepend(this.element);
      document.body.prepend(this.header);
      document.body.prepend(this.modal);
    }

    incrementarPontuacao(pontos) {
      this.pontuacao += pontos;
      this.header.innerHTML = ("0000" + this.pontuacao).slice(-5);
    }

    closeModal() {
      this.modal.innerHTML = "";
      this.modal.className = "";
    }

    showGaveOverModal() {
      this.modal.className = "game-over";

      const title = document.createElement("h1");
      const titleText = document.createTextNode("Game Over");
      title.appendChild(titleText);
      this.modal.appendChild(title);

      const legend = document.createElement("p");
      const legendText = document.createTextNode(
        `Score: ${("0000" + this.pontuacao).slice(-5)}`
      );
      legend.appendChild(legendText);
      this.modal.appendChild(legend);

      const start = document.createElement("h3");
      const startText = document.createTextNode(
        `Aperte "s" para jogar novamente.`
      );
      start.appendChild(startText);
      this.modal.appendChild(start);
    }

    showInitModal() {
      this.modal.className = "init";

      const title = document.createElement("h1");
      const titleText = document.createTextNode("Jogo da Cobrazinha");
      title.appendChild(titleText);
      this.modal.appendChild(title);

      const legend = document.createElement("p");
      const legendText = document.createTextNode(
        `Movimente-se usando as teclas de seta e tente comer as maçãs sem morrer.`
      );
      legend.appendChild(legendText);
      this.modal.appendChild(legend);

      const start = document.createElement("h3");
      const startText = document.createTextNode(`Aperte "s" para começar`);
      start.appendChild(startText);
      this.modal.appendChild(start);
    }

    showPauseModal() {
      this.modal.className = "pause";

      const title = document.createElement("h1");
      const titleText = document.createTextNode("PAUSE");
      title.appendChild(titleText);
      this.modal.appendChild(title);

      const start = document.createElement("h3");
      const startText = document.createTextNode(`Aperte "p" para continuar`);
      start.appendChild(startText);
      this.modal.appendChild(start);
    }
  }

  class Snake {
    constructor() {
      this.corpo = [
        [4, 5],
        [4, 6],
        [4, 7],
      ];
      this.cor = "#111111";
      this.direcao = Direcao.DIREITA;
      this.corpo.forEach(
        (campo) =>
          (document.querySelector(
            `#board tr:nth-child(${campo[0]}) td:nth-child(${campo[1]})`
          ).style.backgroundColor = this.cor)
      );
    }

    andar() {
      let head = this.corpo[this.corpo.length - 1];
      let add;
      switch (this.direcao) {
        case Direcao.CIMA:
          add = [head[0] - 1, head[1]];
          break;
        case Direcao.DIREITA:
          add = [head[0], head[1] + 1];
          break;
        case Direcao.BAIXO:
          add = [head[0] + 1, head[1]];
          break;
        case Direcao.ESQUERDA:
          add = [head[0], head[1] - 1];
          break;
      }

      if (
        this.corpo.filter((pos) => pos[0] === add[0] && pos[1] === add[1])
          .length > 0 ||
        add[0] <= 0 ||
        add[0] > TAM ||
        add[1] <= 0 ||
        add[1] > TAM
      ) {
        return Evento.GAME_OVER;
      }

      this.corpo.push(add);

      document.querySelector(
        `#board tr:nth-child(${add[0]}) td:nth-child(${add[1]})`
      ).style.backgroundColor = this.cor;
      let rem = this.corpo.shift();
      document.querySelector(
        `#board tr:nth-child(${rem[0]}) td:nth-child(${rem[1]})`
      ).style.backgroundColor = "";

      if (add[0] === coin.posicao[0] && add[1] === coin.posicao[1]) {
        return Evento.COIN_COLLECTED;
      }
    }

    crescer() {
      const x = this.corpo[0][0];
      const y = this.corpo[0][1];
      this.corpo.unshift([x, y]);
    }

    mudarDirecao(direcao) {
      if (
        (direcao === Direcao.BAIXO && this.direcao === Direcao.CIMA) ||
        (direcao === Direcao.CIMA && this.direcao === Direcao.BAIXO) ||
        (direcao === Direcao.ESQUERDA && this.direcao === Direcao.DIREITA) ||
        (direcao === Direcao.DIREITA && this.direcao === Direcao.ESQUERDA)
      ) {
        return;
      }

      this.direcao = direcao;
    }
  }

  class Coin {
    constructor() {
      const x = Math.floor(Math.random() * (TAM - 1)) + 1;
      const y = Math.floor(Math.random() * (TAM - 1)) + 1;
      this.posicao = [x, y];
      if (Math.random() > 0.33) {
        this.cor = "#000000";
        this.pontos = 1;
      } else {
        this.cor = "#ff0000";
        this.pontos = 2;
      }
      document.querySelector(
        `#board tr:nth-child(${x}) td:nth-child(${y})`
      ).style.backgroundColor = this.cor;
    }
  }

  function run() {
    if (!playing || pause) {
      return;
    }

    if (coin === undefined) {
      coin = new Coin();
    }

    frames++;
    if (frames % 60 === 0 && FPS < 100) {
      FPS++;
      console.log("A velocidade da cobra aumentou!");
    }

    const evento = snake.andar();
    switch (evento) {
      case Evento.GAME_OVER:
        playing = false;
        gameOver = true;
        board.showGaveOverModal();
        return;
      case Evento.COIN_COLLECTED:
        board.incrementarPontuacao(coin.pontos);
        snake.crescer();
        coin = new Coin();
        break;
    }
    setTimeout(run, 1000 / FPS);
  }

  init();
})();
