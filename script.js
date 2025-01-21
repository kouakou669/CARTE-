let cards = [];
let cardValues = [];
let cardIds = [];
let matchedCards = [];
let score = 0;
let timer;
let timeLimit;
let gameStarted = false;
let highScores = [];

const levelConfigurations = {
    easy: { pairs: 8, grid: 4, time: 120 },
    medium: { pairs: 12, grid: 4, time: 180 },
    hard: { pairs: 16, grid: 4, time: 300 }
};

const themes = {
    letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    animals: '🐶🐱🐭🐹🐰🐻🐼🐯🐨🐸',
    fruits: '🍎🍌🍒🍇🍉🍊🍍🍑🍓🍈'
};

function startGame() {
    // Afficher l'avertissement
    document.getElementById('warningSection').classList.remove('hidden');

    if (gameStarted) {
        if (!confirm("Voulez-vous vraiment recommencer le jeu ?")) {
            return;
        }
    }

    // Démarrer le jeu après un délai pour lire l'avertissement
    setTimeout(() => {
        document.getElementById('warningSection').classList.add('hidden');
        gameStarted = true;
        const selectedLevel = document.getElementById('levelSelect').value;
        const selectedTheme = document.getElementById('themeSelect').value;
        const { pairs, time } = levelConfigurations[selectedLevel];
        cards = generateCards(pairs, selectedTheme);
        resetGame();
        createBoard();
        document.getElementById('message').textContent = '';

        timeLimit = time;
        document.getElementById('timer').textContent = timeLimit;
        startTimer();
        showCards();
    }, 3000); // Temps pour lire l'avertissement (3 secondes)
}

function generateCards(pairs, theme) {
    const values = themes[theme].split('').slice(0, pairs);
    return [...values, ...values].sort(() => Math.random() - 0.5);
}

function resetGame() {
    cardValues = [];
    cardIds = [];
    matchedCards = [];
    score = 0;
    document.getElementById('score').textContent = score;
    document.getElementById('gameBoard').innerHTML = '';
    clearInterval(timer);
}

function createBoard() {
    const gameBoard = document.getElementById('gameBoard');
    const { grid } = levelConfigurations[document.getElementById('levelSelect').value];
    gameBoard.style.gridTemplateColumns = `repeat(${grid}, auto)`;

    cards.forEach((value, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.setAttribute('data-id', index);
        
        const front = document.createElement('div');
        front.classList.add('front');
        
        const back = document.createElement('div');
        back.classList.add('back');
        back.textContent = value;
        
        card.appendChild(front);
        card.appendChild(back);
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

function showCards() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.classList.add('flipped');
    });
    setTimeout(hideCards, 2000);
}

function hideCards() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.classList.remove('flipped');
    });
}

function startTimer() {
    timer = setInterval(() => {
        timeLimit--;
        document.getElementById('timer').textContent = timeLimit;

        if (timeLimit <= 10) {
            document.getElementById('timer').classList.add('urgent');
        }

        if (timeLimit <= 0) {
            endGame(false);
        }
    }, 1000);
}

function flipCard() {
    const cardId = this.getAttribute('data-id');
    const flipSound = document.getElementById('flipSound');

    if (cardIds.length < 2 && !matchedCards.includes(cardId) && !cardValues.includes(cardId)) {
        flipSound.play();
        this.classList.add('flipped');
        cardValues.push(cards[cardId]);
        cardIds.push(cardId);

        if (cardValues.length === 2) {
            setTimeout(checkMatch, 1000);
        }
    }
}

function checkMatch() {
    const cardsElements = document.querySelectorAll('.card');
    const [firstId, secondId] = cardIds;

    if (cardValues[0] === cardValues[1]) {
        matchedCards.push(firstId, secondId);
        cardsElements[firstId].classList.add('matched');
        cardsElements[secondId].classList.add('matched');
        score += 10;
        document.getElementById('score').textContent = Math.min(score, 100);
        
        const matchSound = document.getElementById('matchSound');
        matchSound.play();

        if (matchedCards.length === cards.length) {
            endGame(true);
        }
    } else {
        setTimeout(() => {
            cardsElements[firstId].classList.remove('flipped');
            cardsElements[secondId].classList.remove('flipped');
            if (document.getElementById('levelSelect').value === 'hard') {
                swapCards(firstId, secondId);
            }
        }, 1000);
    }

    cardValues = [];
    cardIds = [];
}

function swapCards(firstId, secondId) {
    const cardsElements = document.querySelectorAll('.card');
    const tempValue = cards[firstId];
    cards[firstId] = cards[secondId];
    cards[secondId] = tempValue;

    // Mise à jour de l'affichage
    cardsElements[firstId].querySelector('.back').textContent = cards[firstId];
    cardsElements[secondId].querySelector('.back').textContent = cards[secondId];
}

function endGame(isWin) {
    gameStarted = false;
    const messageElement = document.getElementById('message');
    clearInterval(timer);

    if (isWin) {
        messageElement.textContent = `Bravo ! Vous avez gagné avec un score de ${Math.min(score, 100)} points !`;
        highScores.push(Math.min(score, 100));
        updateScoreBoard();
    } else {
        messageElement.textContent = `Temps écoulé ! Votre score final est de ${Math.min(score, 100)} points.`;
    }

    document.querySelectorAll('.card').forEach(card => {
        card.removeEventListener('click', flipCard);
    });
}

function updateScoreBoard() {
    const scoreBoard = document.getElementById('scoreBoard');
    scoreBoard.innerHTML = '';
    highScores.sort((a, b) => b - a); // Tri décroissant

    highScores.slice(0, 5).forEach(score => {
        const scoreItem = document.createElement('li');
        scoreItem.textContent = score;
        scoreBoard.appendChild(scoreItem);
    });
}

document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('toggleRules').addEventListener('click', function() {
    const rulesSection = document.getElementById('rulesSection');
    rulesSection.classList.toggle('hidden');
});

// Fonctionnalité Pause
document.getElementById('pauseButton').addEventListener('click', function() {
    if (gameStarted) {
        clearInterval(timer);
        gameStarted = false;
        this.classList.add('hidden');
        document.getElementById('message').textContent = 'Jeu en pause. Cliquez sur "Commencer" pour reprendre.';
    }
});
