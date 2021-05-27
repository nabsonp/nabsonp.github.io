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
  let egg;
  let playing;
  let gameOver;
  let pause;
  let pauseAllowed;
  let frames;
  const eatEggAudio = new Audio('./sounds/eat-egg.wav');
  const pauseAudio = new Audio('./sounds/pause.wav');
  const soundTrack = new Audio('./sounds/sound-track.wav');
  const gameOverTrack = new Audio('./sounds/game-over.wav');
  soundTrack.loop = true;

  function init() {
    load();
    board.showInitModal();
  }

  function load() {
    document.body.innerHTML = "";
    board = new Board();
    snake = new Snake();
    FPS = 5;
    egg = undefined;
    playing = false;
    pause = false;
    pauseAllowed = false;
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
        soundTrack.play()

        if (gameOver) {
          gameOverTrack.pause()
          load();
        } else {
          board.closeModal();
        }

        pauseAllowed = true;
        playing = true;
        run();
        break;
      case "p":
        if (!pauseAllowed) break;

        if (pause) {
          pause = false;
          board.closeModal();
          soundTrack.play()
          run();
        } else {
          soundTrack.pause()
          board.showPauseModal();
          pause = true;
          pauseAudio.play()
        }
        break;
    }
  });

  class Board {
    constructor() {
      this.modal = document.createElement("div");
      this.header = document.createElement("span");
      this.header.className = "points";
      this.header.innerHTML = "00000";
      this.pontuacao = 0;


      this.spanName = document.createElement("h1");
      this.spanName.className = "my-name";
      this.spanName.innerHTML = "Nabson Paiva";

      this.element = document.createElement("table");
      this.element.setAttribute("id", "board");
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
      document.body.prepend(this.spanName);
      document.body.prepend(this.modal);
    }

    incrementarPontuacao(pontos) {
      this.pontuacao += pontos;
      this.header.innerHTML = ("0000" + this.pontuacao).slice(-5);
    }

    closeModal() {
      this.modal.innerHTML = "";
      this.modal.className = undefined;
    }

    showGaveOverModal() {
      this.modal.className = "game-over";

      const title = document.createElement("h1");
      const titleText = document.createTextNode("Game Over");
      title.appendChild(titleText);
      this.modal.appendChild(title);

      const legend = document.createElement("h2");
      const legendText = document.createTextNode(
        `SCORE: ${("0000" + this.pontuacao).slice(-5)}`
      );
      legend.appendChild(legendText);
      this.modal.appendChild(legend);

      const start = document.createElement("h3");
      const startText = document.createTextNode(
        `Pressione "S" para jogar novamente!`
      );
      start.appendChild(startText);
      this.modal.appendChild(start);
    }

    showInitModal() {
      this.modal.className = "init";

      const titleContainer = document.createElement("span");

      const image = document.createElement("img")
      image.src = "./images/python.png"
      image.alt = 'python'
      titleContainer.appendChild(image);

      const title = document.createElement("h1");
      const titleText = document.createTextNode("JOGO DA PYTHON");
      title.appendChild(titleText);
      titleContainer.appendChild(title);


      this.modal.appendChild(titleContainer);

      const legend = document.createElement("h2");
      const legendText = document.createTextNode(`REGRAS`);
      legend.appendChild(legendText);
      this.modal.appendChild(legend);

      let instructions = document.createElement("p");
      let instructionsText = document.createTextNode(
        `- Use as setas para se mover.`
      );
      instructions.appendChild(instructionsText);
      this.modal.appendChild(instructions);

      instructions = document.createElement("p");
      instructionsText = document.createTextNode(
        `- Ovos vermelhos valem 2 pontos e pretos valem 1 ponto.`
      );
      instructions.appendChild(instructionsText);
      this.modal.appendChild(instructions);

      instructions = document.createElement("p");
      instructionsText = document.createTextNode(
        `- Pressione "P" para pausar o jogo.`
      );
      instructions.appendChild(instructionsText);
      this.modal.appendChild(instructions);

      const start = document.createElement("h3");
      const startText = document.createTextNode(`Pressione "S" para começar!`);
      start.appendChild(startText);
      this.modal.appendChild(start);
    }

    showPauseModal() {
      this.modal.className = "pause";

      const titleContainer = document.createElement("span");

      const image = document.createElement("img")
      image.src = "./images/pause.png"
      image.alt = 'pause'
      titleContainer.appendChild(image);

      const title = document.createElement("h1");
      const titleText = document.createTextNode("PAUSE");
      title.appendChild(titleText);
      titleContainer.appendChild(title);


      this.modal.appendChild(titleContainer);

      const start = document.createElement("h3");
      const startText = document.createTextNode(
        `Pressione "P" para continuar!`
      );
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
      this.className = "python_body";
      this.direcaoMudou = false

      this.direcao = Direcao.DIREITA;
      this.corpo.forEach(
        (campo) =>
          (document.querySelector(
            `#board tr:nth-child(${campo[0]}) td:nth-child(${campo[1]})`
          ).className = this.className)
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

      this.direcaoMudou = false;

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
      ).className = 'python_body';
      
      let rem = this.corpo.shift();
      document.querySelector(
        `#board tr:nth-child(${rem[0]}) td:nth-child(${rem[1]})`
      ).className = undefined;

      if (add[0] === egg.posicao[0] && add[1] === egg.posicao[1]) {
        return Evento.COIN_COLLECTED;
      }
    }

    crescer() {
      eatEggAudio.play()
      const x = this.corpo[0][0];
      const y = this.corpo[0][1];
      this.corpo.unshift([x, y]);
    }

    mudarDirecao(direcao) {
      if (
        (direcao === Direcao.BAIXO && this.direcao === Direcao.CIMA) ||
        (direcao === Direcao.CIMA && this.direcao === Direcao.BAIXO) ||
        (direcao === Direcao.ESQUERDA && this.direcao === Direcao.DIREITA) ||
        (direcao === Direcao.DIREITA && this.direcao === Direcao.ESQUERDA) ||
        this.direcaoMudou
      ) {
        return;
      }

      this.direcaoMudou = true;

      this.direcao = direcao;
    }
  }

  class Egg {
    constructor() {
      const x = Math.floor(Math.random() * (TAM - 2)) + 1;
      const y = Math.floor(Math.random() * (TAM - 2)) + 1;
      this.posicao = [x, y];
      if (Math.random() > 0.33) {
        this.className = "blue_egg";
        this.pontos = 1;
      } else {
        this.className = "red_egg";
        this.pontos = 2;
      }
      document.querySelector(
        `#board tr:nth-child(${x}) td:nth-child(${y})`
      ).className = this.className;
    }
  }

  function run() {
    if (!playing || pause) {
      return;
    }

    if (egg === undefined) {
      egg = new Egg();
    }

    frames++;
    if (frames % 60 === 0 && FPS < 100) {
      FPS++;
      console.log("A velocidade da cobra aumentou!");
    }

    const evento = snake.andar();
    switch (evento) {
      case Evento.GAME_OVER:
        gameOverTrack.play()
        soundTrack.pause()
        playing = false;
        gameOver = true;
        pauseAllowed = false;
        board.showGaveOverModal();
        return;
      case Evento.COIN_COLLECTED:
        board.incrementarPontuacao(egg.pontos);
        snake.crescer();
        egg = new Egg();
        break;
    }
    setTimeout(run, 1000 / FPS);
  }

  init();
})();
