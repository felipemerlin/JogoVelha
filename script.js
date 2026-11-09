
// ========================================
// CONFIGURAÇÕES DO JOGO
// ========================================

const celulas = document.querySelectorAll(".board-cell");

const gameBoard = document.getElementById("gameBoard");

const gameMessage = document.getElementById("gameMessage");

const turnIndicator = document.getElementById("turnIndicator");

const turnSymbol = document.getElementById("turnSymbol");

const turnLabel = document.getElementById("turnLabel");

const turnName = document.getElementById("turnName");

const resultModal = document.getElementById("resultModal");

const announcer = document.getElementById("announcer");


const combinacoesVencedoras = [

    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6]

];


// ========================================
// VARIÁVEIS
// ========================================

let tabuleiro = ["", "", "", "", "", "", "", "", ""];

let jogadorAtual = "X";

let jogoFinalizado = false;

let modoJogo = "pvp";

let dificuldade = "easy";

let jogadorPensando = false;

let tempoIA = null;

let pontuacao = {

    X: 0,

    O: 0,

    empate: 0

};

let sonsAtivados = false;

let temaClaro = false;

let contextoAudio = null;


// ========================================
// ELEMENTOS DO HTML
// ========================================

const scoreX = document.getElementById("scoreX");

const scoreO = document.getElementById("scoreO");

const scoreDraws = document.getElementById("scoreDraws");

const nameX = document.getElementById("nameX");

const nameO = document.getElementById("nameO");

const legendO = document.getElementById("legendO");

const difficultyGroup = document.getElementById("difficultyGroup");

const settingsDescription = document.getElementById("settingsDescription");

const resetScoreButton = document.getElementById("resetScoreButton");

const newGameButton = document.getElementById("newGameButton");

const playAgainButton = document.getElementById("playAgainButton");

const closeResultButton = document.getElementById("closeResultButton");

const soundToggle = document.getElementById("soundToggle");

const themeToggle = document.getElementById("themeToggle");


// ========================================
// ATUALIZAR PLACAR
// ========================================

function atualizarPlacar() {

    scoreX.textContent = pontuacao.X;

    scoreO.textContent = pontuacao.O;

    scoreDraws.textContent = pontuacao.empate;

}


// ========================================
// ATUALIZAR NOMES DOS JOGADORES
// ========================================

function atualizarNomes() {

    if (modoJogo === "ai") {

        nameX.textContent = "Você";

        nameO.textContent = "Inteligência Artificial";

        legendO.textContent = "Inteligência Artificial";

    } else {

        nameX.textContent = "Você";

        nameO.textContent = "Jogador O";

        legendO.textContent = "Jogador O";

    }

}


// ========================================
// ATUALIZAR INDICADOR DE VEZ
// ========================================

function atualizarIndicador() {

    if (jogoFinalizado) {
        return;
    }

    turnSymbol.classList.remove("x-symbol", "o-symbol");

    turnSymbol.classList.add(
        jogadorAtual === "X" ? "x-symbol" : "o-symbol"
    );

    turnSymbol.textContent = jogadorAtual;


    if (jogadorPensando) {

        turnLabel.textContent = "INTELIGÊNCIA ARTIFICIAL";

        turnName.textContent = "Analisando jogadas...";

        turnIndicator.classList.add("thinking");

        turnSymbol.textContent = "O";

    } else {

        turnLabel.textContent = "VEZ DO JOGADOR";

        if (modoJogo === "ai" && jogadorAtual === "O") {

            turnName.textContent = "Inteligência Artificial";

        } else {

            turnName.textContent =
                modoJogo === "ai" ? "Sua vez!" : "Jogador " + jogadorAtual;

        }

        turnIndicator.classList.remove("thinking");

    }

    announcer.textContent = jogadorPensando
        ? "A inteligência artificial está pensando."
        : "Vez do jogador " + jogadorAtual;

}


// ========================================
// ATUALIZAR MENSAGEM
// ========================================

function atualizarMensagem(mensagem) {

    gameMessage.textContent = mensagem;

}


// ========================================
// VERIFICAR VENCEDOR
// ========================================

function verificarVencedor(matriz) {

    for (let i = 0; i < combinacoesVencedoras.length; i++) {

        const combinacao = combinacoesVencedoras[i];

        const a = combinacao[0];

        const b = combinacao[1];

        const c = combinacao[2];


        if (
            matriz[a] !== "" &&
            matriz[a] === matriz[b] &&
            matriz[a] === matriz[c]
        ) {

            return {

                jogador: matriz[a],

                combinacao: combinacao

            };

        }

    }

    return null;

}


// ========================================
// VERIFICAR EMPATE
// ========================================

function verificarEmpate(matriz) {

    return matriz.every(function(casa) {

        return casa !== "";

    });

}


// ========================================
// FAZER UMA JOGADA
// ========================================

function fazerJogada(indice, jogador) {

    if (jogoFinalizado || tabuleiro[indice] !== "") {

        return;

    }


    tabuleiro[indice] = jogador;


    const celula = celulas[indice];

    const marca = celula.querySelector(".cell-mark");


    marca.textContent = jogador;

    marca.classList.add(
        jogador === "X" ? "mark-x" : "mark-o"
    );

    celula.classList.add(
        jogador === "X" ? "cell-x" : "cell-o"
    );

    celula.disabled = true;

    celula.setAttribute(
        "aria-label",
        "Casa " + (indice + 1) + ", jogador " + jogador
    );


    tocarSom("jogada");


    const resultado = verificarVencedor(tabuleiro);


    if (resultado) {

        finalizarPartida(resultado.jogador, resultado.combinacao);

        return;

    }


    if (verificarEmpate(tabuleiro)) {

        finalizarPartida(null, null);

        return;

    }


    jogadorAtual = jogador === "X" ? "O" : "X";


    atualizarIndicador();


    if (modoJogo === "ai" && jogadorAtual === "O") {

        atualizarMensagem("🤖 A inteligência artificial está pensando...");

        jogarIA();

    } else {

        atualizarMensagem(
            "Vez do jogador " + jogadorAtual + ". Faça sua jogada!"
        );

    }

}


// ========================================
// CLIQUE NAS CASAS
// ========================================

celulas.forEach(function(celula) {

    celula.addEventListener("click", function() {

        if (jogoFinalizado || jogadorPensando) {

            return;

        }

        if (modoJogo === "ai" && jogadorAtual === "O") {

            return;

        }


        const indice = Number(celula.dataset.index);

        fazerJogada(indice, jogadorAtual);

    });

});


// ========================================
// FINALIZAR PARTIDA
// ========================================

function finalizarPartida(vencedor, combinacao) {

    jogoFinalizado = true;

    jogadorPensando = false;

    clearTimeout(tempoIA);


    // IMPEDIR NOVAS JOGADAS

    celulas.forEach(function(celula) {

        celula.disabled = true;

    });


    // QUANDO EXISTE UM VENCEDOR

    if (vencedor !== null) {

        pontuacao[vencedor]++;

        tocarSom("vitoria");


        combinacao.forEach(function(indice) {

            celulas[indice].classList.add("winning-cell");

        });


        atualizarMensagem(
            "🏆 Jogador " + vencedor + " venceu a partida!"
        );


        mostrarResultado(vencedor);

        criarConfetes();

    }


    // QUANDO OCORRE EMPATE

    else {

        pontuacao.empate++;

        tocarSom("empate");

        atualizarMensagem("🤝 Deu velha! Ninguém venceu desta vez.");

        mostrarResultado(null);

    }


    atualizarPlacar();

}


// ========================================
// MOSTRAR TELA DE RESULTADO
// ========================================

function mostrarResultado(vencedor) {

    const resultIcon = document.getElementById("resultIcon");

    const resultEyebrow = document.getElementById("resultEyebrow");

    const resultTitle = document.getElementById("resultTitle");

    const resultDescription = document.getElementById("resultDescription");

    const resultWinner = document.getElementById("resultWinner");

    const resultScore = document.getElementById("resultScore");


    if (vencedor === null) {

        resultIcon.textContent = "🤝";

        resultEyebrow.textContent = "PARTIDA FINALIZADA";

        resultTitle.textContent = "EMPATE!";

        resultDescription.textContent =
            "Foi por pouco! Os dois jogadores fizeram uma ótima partida.";

        resultWinner.textContent = "Ninguém";

        resultScore.textContent = "Empate";

    } else {

        resultIcon.textContent = vencedor === "X" ? "🏆" : "🥇";

        resultEyebrow.textContent = "TEMOS UM VENCEDOR!";

        resultTitle.textContent = "VITÓRIA!";


        if (modoJogo === "ai" && vencedor === "X") {

            resultDescription.textContent =
                "Parabéns! Você conseguiu vencer a inteligência artificial!";

            resultWinner.textContent = "Você";

        } else if (modoJogo === "ai" && vencedor === "O") {

            resultDescription.textContent =
                "A inteligência artificial venceu! Tente novamente e mude sua estratégia.";

            resultWinner.textContent = "Inteligência Artificial";

        } else {

            resultDescription.textContent =
                "Parabéns! Você venceu esta partida. Excelente estratégia!";

            resultWinner.textContent = "Jogador " + vencedor;

        }

        resultScore.textContent = "Vitória de " + vencedor;

    }


    resultModal.hidden = false;

    playAgainButton.focus();

}


// ========================================
// FECHAR TELA DE RESULTADO
// ========================================

function fecharResultado() {

    resultModal.hidden = true;

    newGameButton.focus();

}

closeResultButton.addEventListener("click", fecharResultado);


// ========================================
// CRIAR CONFETES
// ========================================

function criarConfetes() {

    const container = document.getElementById("confettiContainer");

    container.innerHTML = "";


    const simbolos = ["✦", "★", "◆", "●", "✧"];

    const cores = [

        "#36dcf5",
        "#9470ff",
        "#42e6ae",
        "#ff75b5",
        "#f7d46b"

    ];


    for (let i = 0; i < 55; i++) {

        const confete = document.createElement("span");

        confete.className = "confetti-piece";

        confete.textContent =
            simbolos[Math.floor(Math.random() * simbolos.length)];

        confete.style.left = Math.random() * 100 + "%";

        confete.style.color =
            cores[Math.floor(Math.random() * cores.length)];

        confete.style.fontSize =
            (8 + Math.random() * 14) + "px";

        confete.style.setProperty(
            "--duration",
            (2 + Math.random() * 3) + "s"
        );

        confete.style.animationDelay =
            Math.random() * 1.5 + "s";


        container.appendChild(confete);

    }


    setTimeout(function() {

        container.innerHTML = "";

    }, 6000);

}


// ========================================
// NOVA PARTIDA
// ========================================

function novaPartida() {

    clearTimeout(tempoIA);

    tabuleiro = ["", "", "", "", "", "", "", "", ""];

    jogadorAtual = "X";

    jogoFinalizado = false;

    jogadorPensando = false;


    // LIMPAR AS CASAS

    celulas.forEach(function(celula) {

        const marca = celula.querySelector(".cell-mark");

        marca.textContent = "";

        marca.className = "cell-mark";

        celula.classList.remove(
            "cell-x",
            "cell-o",
            "winning-cell"
        );

        celula.disabled = false;

        celula.setAttribute(
            "aria-label",
            "Casa " + (Number(celula.dataset.index) + 1) + " vazia"
        );

    });


    // FECHAR MODAL

    resultModal.hidden = true;


    // LIMPAR CONFETES

    document.getElementById("confettiContainer").innerHTML = "";


    atualizarIndicador();

    atualizarMensagem(
        modoJogo === "ai"
            ? "🤖 Sua vez! Você joga com X."
            : "Faça sua jogada e boa sorte!"
    );


    newGameButton.focus();

}


// ========================================
// BOTÕES DE NOVA PARTIDA
// ========================================

newGameButton.addEventListener("click", novaPartida);

playAgainButton.addEventListener("click", novaPartida);


// ========================================
// ZERAR PLACAR
// ========================================

resetScoreButton.addEventListener("click", function() {

    pontuacao = {

        X: 0,

        O: 0,

        empate: 0

    };


    atualizarPlacar();


    atualizarMensagem("Placar zerado! Vamos começar novamente.");

});


// ========================================
// SELEÇÃO DE MODO DE JOGO
// ========================================

const botoesModo = document.querySelectorAll(".mode-button");


botoesModo.forEach(function(botao) {

    botao.addEventListener("click", function() {

        modoJogo = botao.dataset.mode;


        botoesModo.forEach(function(item) {

            item.classList.remove("active");

            item.setAttribute("aria-pressed", "false");

        });


        botao.classList.add("active");

        botao.setAttribute("aria-pressed", "true");


        // MOSTRAR OU ESCONDER DIFICULDADE

        difficultyGroup.hidden = modoJogo !== "ai";


        atualizarNomes();


        if (modoJogo === "ai") {

            settingsDescription.textContent =
                "Desafie a inteligência artificial e teste suas habilidades!";

        } else {

            settingsDescription.textContent =
                "Convide alguém e descubra quem é o verdadeiro estrategista!";

        }


        novaPartida();

    });

});


// ========================================
// SELEÇÃO DE DIFICULDADE
// ========================================

const botoesDificuldade = document.querySelectorAll(".difficulty-button");


botoesDificuldade.forEach(function(botao) {

    botao.addEventListener("click", function() {

        dificuldade = botao.dataset.difficulty;


        botoesDificuldade.forEach(function(item) {

            item.classList.remove("active");

            item.setAttribute("aria-pressed", "false");

        });


        botao.classList.add("active");

        botao.setAttribute("aria-pressed", "true");


        if (dificuldade === "easy") {

            settingsDescription.textContent =
                "Modo fácil: a IA realiza jogadas aleatórias.";

        }

        if (dificuldade === "medium") {

            settingsDescription.textContent =
                "Modo médio: a IA tenta vencer e bloquear suas jogadas.";

        }

        if (dificuldade === "hard") {

            settingsDescription.textContent =
                "Modo difícil: a IA utiliza uma estratégia avançada para jogar.";

        }


        novaPartida();

    });

});


// ========================================
// INTELIGÊNCIA ARTIFICIAL
// ========================================

function jogarIA() {

    jogadorPensando = true;

    gameBoard.classList.add("thinking");

    atualizarIndicador();


    tempoIA = setTimeout(function() {

        if (jogoFinalizado || modoJogo !== "ai") {

            jogadorPensando = false;

            gameBoard.classList.remove("thinking");

            return;

        }


        const indice = escolherJogadaIA();


        jogadorPensando = false;

        gameBoard.classList.remove("thinking");


        if (indice !== -1) {

            fazerJogada(indice, "O");

        }

    }, 550);

}


// ========================================
// ESCOLHER JOGADA DA IA
// ========================================

function escolherJogadaIA() {

    const casasDisponiveis = [];


    for (let i = 0; i < 9; i++) {

        if (tabuleiro[i] === "") {

            casasDisponiveis.push(i);

        }

    }


    if (casasDisponiveis.length === 0) {

        return -1;

    }


    // DIFICULDADE FÁCIL

    if (dificuldade === "easy") {

        const sorteio = Math.floor(
            Math.random() * casasDisponiveis.length
        );

        return casasDisponiveis[sorteio];

    }


    // DIFICULDADE MÉDIA

    if (dificuldade === "medium") {

        // TENTAR VENCER

        const oportunidadeIA = encontrarJogadaVencedora("O");

        if (oportunidadeIA !== -1) {

            return oportunidadeIA;

        }


        // TENTAR BLOQUEAR O JOGADOR

        const bloquearJogador = encontrarJogadaVencedora("X");

        if (bloquearJogador !== -1) {

            return bloquearJogador;

        }


        // ESCOLHER UMA CASA ALEATÓRIA

        const sorteio = Math.floor(
            Math.random() * casasDisponiveis.length
        );

        return casasDisponiveis[sorteio];

    }


    // DIFICULDADE DIFÍCIL

    if (dificuldade === "hard") {

        return encontrarMelhorJogada();

    }


    return casasDisponiveis[0];

}


// ========================================
// ENCONTRAR JOGADA VENCEDORA
// ========================================

function encontrarJogadaVencedora(jogador) {

    for (let i = 0; i < 9; i++) {

        if (tabuleiro[i] === "") {

            const copia = [...tabuleiro];

            copia[i] = jogador;


            if (verificarVencedor(copia)) {

                return i;

            }

        }

    }

    return -1;

}


// ========================================
// IA DIFÍCIL - MINIMAX
// ========================================

function encontrarMelhorJogada() {

    let melhorPontuacao = -Infinity;

    let melhorIndice = -1;


    for (let i = 0; i < 9; i++) {

        if (tabuleiro[i] === "") {

            const copia = [...tabuleiro];

            copia[i] = "O";


            const pontuacao = minimax(copia, false, 0);


            if (pontuacao > melhorPontuacao) {

                melhorPontuacao = pontuacao;

                melhorIndice = i;

            }

        }

    }


    return melhorIndice;

}


// ========================================
// ALGORITMO MINIMAX
// ========================================

function minimax(matriz, vezIA, profundidade) {

    const resultado = verificarVencedor(matriz);


    if (resultado && resultado.jogador === "O") {

        return 10 - profundidade;

    }


    if (resultado && resultado.jogador === "X") {

        return profundidade - 10;

    }


    if (verificarEmpate(matriz)) {

        return 0;

    }


    // VEZ DA INTELIGÊNCIA ARTIFICIAL

    if (vezIA) {

        let melhor = -Infinity;


        for (let i = 0; i < 9; i++) {

            if (matriz[i] === "") {

                matriz[i] = "O";

                const pontuacao = minimax(
                    matriz,
                    false,
                    profundidade + 1
                );

                matriz[i] = "";

                melhor = Math.max(melhor, pontuacao);

            }

        }


        return melhor;

    }


    // VEZ DO JOGADOR

    else {

        let melhor = Infinity;


        for (let i = 0; i < 9; i++) {

            if (matriz[i] === "") {

                matriz[i] = "X";

                const pontuacao = minimax(
                    matriz,
                    true,
                    profundidade + 1
                );

                matriz[i] = "";

                melhor = Math.min(melhor, pontuacao);

            }

        }


        return melhor;

    }

}


// ========================================
// EFEITOS SONOROS
// ========================================

function tocarSom(tipo) {

    if (!sonsAtivados) {

        return;

    }


    try {

        const AudioContext =
            window.AudioContext || window.webkitAudioContext;


        if (!AudioContext) {

            return;

        }


        if (!contextoAudio) {

            contextoAudio = new AudioContext();

        }


        if (contextoAudio.state === "suspended") {

            contextoAudio.resume();

        }


        const oscilador = contextoAudio.createOscillator();

        const volume = contextoAudio.createGain();


        oscilador.connect(volume);

        volume.connect(contextoAudio.destination);


        const agora = contextoAudio.currentTime;


        if (tipo === "jogada") {

            oscilador.frequency.setValueAtTime(520, agora);

            oscilador.frequency.exponentialRampToValueAtTime(
                350,
                agora + 0.08
            );

            volume.gain.setValueAtTime(0.07, agora);

            volume.gain.exponentialRampToValueAtTime(
                0.001,
                agora + 0.1
            );

            oscilador.start(agora);

            oscilador.stop(agora + 0.1);

        }


        if (tipo === "vitoria") {

            oscilador.type = "sine";

            oscilador.frequency.setValueAtTime(523, agora);

            oscilador.frequency.setValueAtTime(659, agora + 0.15);

            oscilador.frequency.setValueAtTime(784, agora + 0.3);

            volume.gain.setValueAtTime(0.08, agora);

            volume.gain.exponentialRampToValueAtTime(
                0.001,
                agora + 0.65
            );

            oscilador.start(agora);

            oscilador.stop(agora + 0.65);

        }


        if (tipo === "empate") {

            oscilador.type = "triangle";

            oscilador.frequency.setValueAtTime(300, agora);

            oscilador.frequency.setValueAtTime(250, agora + 0.2);

            volume.gain.setValueAtTime(0.07, agora);

            volume.gain.exponentialRampToValueAtTime(
                0.001,
                agora + 0.4
            );

            oscilador.start(agora);

            oscilador.stop(agora + 0.4);

        }

    } catch (erro) {

        // O jogo continua funcionando mesmo sem áudio.

    }

}


// ========================================
// ATIVAR E DESATIVAR SONS
// ========================================

soundToggle.addEventListener("click", function() {

    sonsAtivados = !sonsAtivados;


    soundToggle.classList.toggle("is-muted", !sonsAtivados);

    soundToggle.setAttribute(
        "aria-pressed",
        sonsAtivados
    );

    soundToggle.setAttribute(
        "aria-label",
        sonsAtivados ? "Desativar sons" : "Ativar sons"
    );


    if (sonsAtivados) {

        soundToggle.style.color = "var(--green)";

        tocarSom("jogada");

    } else {

        soundToggle.style.color = "";

    }

});


// ========================================
// ALTERNAR TEMA CLARO E ESCURO
// ========================================

themeToggle.addEventListener("click", function() {

    temaClaro = !temaClaro;

    document.body.classList.toggle("light-theme", temaClaro);


    themeToggle.setAttribute(
        "aria-pressed",
        temaClaro
    );

    themeToggle.setAttribute(
        "aria-label",
        temaClaro ? "Ativar tema escuro" : "Ativar tema claro"
    );

});


// ========================================
// FECHAR MODAL PELO FUNDO
// ========================================

const resultOverlay = document.querySelector(".result-overlay");

resultOverlay.addEventListener("click", fecharResultado);


// ========================================
// INICIAR O JOGO
// ========================================

atualizarPlacar();

atualizarNomes();

atualizarIndicador();

atualizarMensagem("Faça sua jogada e boa sorte!");

novaPartida();
