const canvas = document.querySelector('#tetris');
const ctx = canvas.getContext('2d');
let modal3 = document.querySelector('.modal3');
let closeBtn3 = document.getElementsByClassName('closeBtn3')[0];
let submitBtn = document.querySelector('.highScoreForm');
let nameInput = document.querySelector('.nameInput');

ctx.scale(20, 20);

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        player.score += rowCount * 10;
        rowCount *= 2;
    }
}


function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (y = 0; y < m.length; ++y) {
        for (x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createBlock(type) {
    if (type === 'T') {
        return  [  
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];
    } else if (type === 'O') {
        return  [  
            [2, 2],
            [2, 2],
        ];
    } else if (type === 'L') {
        return  [  
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ];
    } else if (type === 'J') {
        return  [  
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0],
        ];
    } else if (type === 'I') {
        return  [  
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
        ];
    } else if (type === 'S') {
        return  [  
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z') {
        return  [  
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    }
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena,{x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = colors[value];
                ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        })
    })
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(direction) {
    player.pos.x += direction;
    if (collide(arena, player)) {
        player.pos.x -= direction;
    }
}

function playerReset() {
    const blocks = 'ILJOTSZ';
    player.matrix = createBlock(blocks[blocks.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        currentScore = player.score;
        arena.forEach(row => row.fill(0));
        modal3.style.display = 'block';
        document.querySelector('.score').textContent = `Your score was: ${player.score}`;
        submitBtn.addEventListener('submit', (e) => {
            modal3.style.display = 'none';
            reload();
            e.preventDefault();
            input = {
                name: nameInput.value,
                score: currentScore
            }
            rootRef.push(input);
            closeInput();
        });
        closeBtn3.addEventListener('click', closeInput);
    }
}

function closeInput() {  
        modal3.style.display = 'none';
        player.score = 0;
        updateScore();
}

function playerRotate(direction) {
    let offset = 1;
    const pos = player.pos.x;
    rotate(player.matrix, direction);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = - (offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -direction);
            player.pos.x = pos;
            return;
        }
    }
}

function rotate(matrix, direction) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (direction > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;


function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if(dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.querySelector('#score').innerText = `Score: ${player.score}`;
}

const colors = [
    null,
    '#AC58FF',
    '#FFFF58',
    '#5858FF',
    '#58FF58',
    '#FF5858',
    '#FFAC58',
    '#58FFFF'
]

const arena = createMatrix(12, 20);

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
}
document.addEventListener('keydown', e => {
    if(e.keyCode === 37) {
        playerMove(-1);
    } else if (e.keyCode === 39) {
        playerMove(1);
    } else if (e.keyCode === 40) {
        playerDrop();
    } else if (e.keyCode === 81) {
        playerRotate(-1);
    } else if (e.keyCode === 87) {
        playerRotate(1);
    }
})

playerReset();
updateScore();
update();

let modal = document.querySelector('.modal');
let btn = document.querySelector('.controls');
let closeBtn = document.getElementsByClassName('closeBtn')[0];

btn.addEventListener('click', () => modal.style.display = 'block');
closeBtn.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (e) => {
    if(e.target == modal) {
        modal.style.display = 'none' 
    }
});


let modal2 = document.querySelector('.modal2');
let btnHiScore = document.querySelector('.highScores');
let closeBtn2 = document.getElementsByClassName('closeBtn2')[0];


btnHiScore.addEventListener('click', () => modal2.style.display = 'block');
closeBtn2.addEventListener('click', () => modal2.style.display = 'none');
window.addEventListener('click', (e) => {
    if(e.target == modal2) {
        modal2.style.display = 'none' 
    }
});


let config = {
    apiKey: "AIzaSyCR1koFL8dMfx6tzPfgW4Xo5BF3CCXA-cI",
    authDomain: "tetris-game-60854.firebaseapp.com",
    databaseURL: "https://tetris-game-60854.firebaseio.com",
    projectId: "tetris-game-60854",
    storageBucket: "",
    messagingSenderId: "984622444173"
  };
  firebase.initializeApp(config);

let rootRef = firebase.database().ref('scores');

rootRef.on('value', getData, (err) => console.log(err));

function getData(data) {
    reload();
    // console.log(data.val());
    let playerScores = data.val();
    let keys = Object.keys(playerScores);
    // console.log(keys);
    keys.forEach((i) => { 
        let name = playerScores[i].name;
        let score = playerScores[i].score;
        // console.log(name, score);
        let li = document.createElement('li');
        li.classList.add('sli');
        li.textContent = name + ': ' + score;
        document.querySelector('.scoreList').appendChild(li);
    });
}

function reload() {
    let sli = document.querySelectorAll('.sli');
    for (i = 0; i < sli.length; i++) {
        sli[i].remove(); 
    }
}
// testing 
// let myHighScore = {
//     name: "Azez",
//     score: 120
// }
//rootRef.push(myHighScore);