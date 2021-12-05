//     --------------------Snake---game------------------------------

class Snake {
    constructor (head_elem, box) {
        // Initialize snake's body
        this.snakeBody.push({
            element: head_elem,
            directionKey: 40,
            currentDirection: null,
            targetFood: null,
        });

        this.container = box;
        // Initialize contoling buttons
        this.controlButtons = document.querySelectorAll('.control-btn');
        
        // Intialize score
        this._score = 0;
        this.updateScore();
        // Start with 3 boxes
        this.add(2);

        // Spawn the food
        this.spawnFood();
    }

    snakeBody = [];
    // Initialize sounds
    eat_Sound = new Audio('./assets/bite.mp3');
    crash_Sound = new Audio('./assets/crash-sound.mp3');
    // Snake's width
    snakeWidth = 20;

    // Snake's speed
    speed = 60;

    // Method checks if the snake's head on legal coordinates
    legalCoord(elem) {
        // Check if it is inside the container
        if (elem.offsetTop < 0) return false;
        if (elem.offsetTop > this.container.clientHeight - this.snakeWidth) return false;
        if (elem.offsetLeft < 0) return false;
        if (elem.offsetLeft > this.container.clientWidth - this.snakeWidth) return false;

        // Check if it has crashed into its body
        if (this.snakeBody.length > 1) {
            for (let i = 1; i < this.snakeBody.length; i++) {
                if (elem.offsetTop === this.snakeBody[i].element.offsetTop 
                    && elem.offsetLeft === this.snakeBody[i].element.offsetLeft) return false;
            }
        }
        return true;
    }

    // Method changes direction of the head
    changeDirection(directionCode) {
        if (directionCode === 37 || directionCode === 38 || directionCode === 39 || directionCode === 40) {
            if (this.snakeBody[0].directionKey === directionCode) return;

            // Snake cannot turn to opposite direction
            if (directionCode + 2 === this.snakeBody[0].currentDirection || directionCode - 2 === this.snakeBody[0].currentDirection) return;
 
            this.snakeBody[0].directionKey = directionCode;
        }
    }

    // Method handles changing direction with keyboard or mouse
    changeDirectionHandler = function(e) {
        if (e.type === 'keydown') {
            this.changeDirection(e.keyCode);
        } else {
            let direction = e.currentTarget.id;
            let directionKey;
            switch (direction) {
                case 'up':
                    directionKey = 38;
                    break;
                case 'right':
                    directionKey = 39;
                    break;
                case 'down':
                    directionKey = 40;
                    break;
                case 'left':
                    directionKey = 37;
                    break;
            }
            if (directionKey) this.changeDirection(directionKey);
        }
    }

    // Method starts the game
    start() {
        // Add event listeners for keyboard and buttons
        document.addEventListener('keydown', this.changeDirectionHandler.bind(this));

        for (let button of this.controlButtons) {
            button.addEventListener('click', this.changeDirectionHandler.bind(this));
        }

        // Set interval and move every iteration 
        this.goInterval = setInterval(() => {
            // Move head element in its new direction
            this.go(this.snakeBody[0].element, this.snakeBody[0].directionKey);
            // Only after move change current direction to new direction 
            this.snakeBody[0].currentDirection = this.snakeBody[0].directionKey;

            // If snake's lenght more than one tell the direction change to the second element
            if (this.snakeBody[1]) {
                // Add the new direction to the turn list of the second element
                if (this.snakeBody[1].turnList.length > 0) {
                    this.snakeBody[1].turnList.push({
                        turnTimer: 0,
                        directionOnTurn: this.snakeBody[0].directionKey,
                    });
                } else {                
                    this.snakeBody[1].turnList.push({
                        turnTimer: 1,
                        directionOnTurn: this.snakeBody[0].directionKey,
                    });
                }
            }
 
            for (let i = 1; i < this.snakeBody.length; i++) {
                // Check if parent has changed its direction
                if (this.snakeBody[i].turnList.length !== 0) {
                    // Check if that element has reached where the turn happened
                    if (this.snakeBody[i].turnList[0].turnTimer === 0) {
                        // turn
                        this.snakeBody[i].directionKey = this.snakeBody[i].turnList[0].directionOnTurn;

                        // Tell about the turn the following body
                        if (this.snakeBody[i+1]) {

                            if (this.snakeBody[i+1].turnList.length > 0) {
                                this.snakeBody[i+1].turnList.push({
                                    turnTimer: 0,
                                    directionOnTurn: this.snakeBody[i].directionKey,
                                });
                            }
                            else {                
                                this.snakeBody[i+1].turnList.push({
                                    turnTimer: 1,
                                    directionOnTurn: this.snakeBody[i].directionKey,
                                });
                            } 
                        }
                        // Continue on new direction
                        this.go(this.snakeBody[i].element, this.snakeBody[i].directionKey);
                        // Delete the turn from turn list
                        this.snakeBody[i].turnList.shift();
                    } else {
                        // If it hasn't reached the turn, continue on your own direction

                        this.snakeBody[i].turnList[0].turnTimer -= 1;
                        this.go(this.snakeBody[i].element, this.snakeBody[i].directionKey);
                    }
                } else {
                    // If the parent didn't change its direction, just continue on your own direction
                    this.go(this.snakeBody[i].element, this.snakeBody[i].directionKey);
                }
            }

            // If head is on the food, eat it
            if (this.snakeBody[0].element.offsetTop === this.snakeBody[0].targetFood.offsetTop 
                && this.snakeBody[0].element.offsetLeft === this.snakeBody[0].targetFood.offsetLeft) this.eatFood();

            // Check if the head is on legal coordinates
            // If it is not, stop the game
            if (!this.legalCoord(this.snakeBody[0].element)) this.stop();
            
        }, this.speed);
    }

    // Method for moving the snake
    go(element, directionKey) {
        switch (directionKey) {
            case 37: 
                    element.style.left = `${element.offsetLeft - this.snakeWidth}px`;
                    break;
            case 38: 
                    element.style.top = `${element.offsetTop - this.snakeWidth}px`;
                    break;
            case 39: 
                    element.style.left = `${element.offsetLeft + this.snakeWidth}px`;
                    break;
            case 40: 
                    element.style.top = `${element.offsetTop + this.snakeWidth}px`;
                    break;
        } 
    }

    // Method for stoping the game
    stop() {
        // If the game stoping, than crash happened, play the sound
        this.crash_Sound.play();
        clearInterval(this.goInterval);

        // Set new record, if there is
        let record = localStorage.getItem('record');
        if (record < this._score) {
            localStorage.setItem('record', this._score);
        }

        // Show menu
        this.showMenu();
    }

    add(count = 1) {
        // add "count" amount of boxes
        // append box to body and add its reference to snakebody array 
        for (let i = 0; i < count; i++) {            
            let div = document.createElement('div');
            div.className = 'snake-box';

            switch (this.snakeBody[this.snakeBody.length-1].directionKey) {
                case 37: 
                        div.style.top = `${this.snakeBody[this.snakeBody.length-1].element.offsetTop}px`;
                        div.style.left = `${this.snakeBody[this.snakeBody.length-1].element.offsetLeft + this.snakeWidth}px`;
                        break;
                case 38:
                        div.style.top = `${this.snakeBody[this.snakeBody.length-1].element.offsetTop + this.snakeWidth}px`;
                        div.style.left = `${this.snakeBody[this.snakeBody.length-1].element.offsetLeft}px`;
                        break;
                case 39: 
                        div.style.top = `${this.snakeBody[this.snakeBody.length-1].element.offsetTop}px`;
                        div.style.left = `${this.snakeBody[this.snakeBody.length-1].element.offsetLeft - this.snakeWidth}px`;
                        break;
                case 40: 
                        div.style.top = `${this.snakeBody[this.snakeBody.length-1].element.offsetTop - this.snakeWidth}px`;
                        div.style.left = `${this.snakeBody[this.snakeBody.length-1].element.offsetLeft}px`;
                        break;
            }
            
            this.snakeBody.push({
                element: div,
                directionKey: this.snakeBody[this.snakeBody.length-1].directionKey,
                turnList: [],
            });
            this.container.append(div);
        }
    }

    // Eat food 
    eatFood() {
        // eat food, add score, add box to snake, and spawn food
        this.eat_Sound.play();
        this._score += 3;
        this.updateScore();
        this.add();
        this.snakeBody[0].targetFood.remove();
        this.spawnFood();
    }

    // Method for spawning the food
    spawnFood() {
        let x, y;

        // Get random field, if it is not legal field, get another
        while(true) {
            x = this.getRandomField(this.container.clientWidth);
            y = this.getRandomField(this.container.clientHeight);
            
            if (this.legalField(x, y)) break;
        }

        let div = document.createElement('div');
        div.className = 'food';


        div.style.left = `${x}px`;
        div.style.top = `${y}px`;

        this.container.append(div);
        this.snakeBody[0].targetFood = div;
    }

    // Method for checking if the feild is ledal (checks only if it is not the field that the snake on)
    legalField(x, y) {
        for (let i = 0; i < this.snakeBody.length; i++) {
            if (this.snakeBody[i].element.offsetTop === y && this.snakeBody[i].element.offsetLeft === x) return false;
        }
        return true;
    }

    // Method for getting random field
    getRandomField(max) {
        return Math.floor(Math.random() * (max / 20)) * 20;
    }

    // Method for updating the score
    updateScore() {
        let elem = document.getElementById('score');
        elem.innerHTML = this._score;
    }

    // Method for showing the menu after crush
    showMenu() {
        // Show the menu
        document.querySelector('.menu').setAttribute('aria-expanded', true);
        // Show the latest score
        document.querySelector('.your-score').setAttribute('aria-expanded', true);
        document.getElementById('menu-score').innerHTML = this._score;

        // Hide menu header
        document.querySelector('.menu-header').setAttribute('aria-expanded', false);
        // Show "You lost" header
        document.querySelector('.you-lost').setAttribute('aria-expanded', true);

        // update the best score
        this.constructor.showBestScore();
    }

    // Clear the container
    static clearContainer(head, container) {
        // Get all the body of the snake and remove, hide the head
        let bodyBoxes = container.querySelectorAll('.snake-box:not(#head)');
        for (let box of bodyBoxes) {
            box.remove();
        }

        head.setAttribute('aria-expanded', false);

        // Remove food
        let food = document.querySelector('.food');
        if (food) food.remove();
    }

    // Show the best score
    static showBestScore() {
        let bestScore = localStorage.getItem('record');

        if (!bestScore) localStorage.setItem('record', 0);
        
        document.getElementById('best-score').innerHTML = bestScore;
        document.getElementById('menu-best-score').innerHTML = bestScore;
    }
}

// -------------------------------------------------
// Show best score, shows 0 if there is no
Snake.showBestScore();

// Update the options, selects by default the middle difficulty
updateOptions();

// If the checkbox is checked, show the buttons
var checkbox = document.querySelector("input[name='use-buttons']");

checkbox.addEventListener('change', function() {
  if (this.checked) {
    document.querySelector('.controls').setAttribute('aria-expanded', true);
  } else {
    document.querySelector('.controls').setAttribute('aria-expanded', false);
  }
});


// Add event listener for play button
let playButton = document.querySelector('.play-btn');

playButton.addEventListener('click', () => {
    // Get the selected difficulty
    let speed = getDifficulty();
    // Hide the menu
    document.querySelector('.menu').setAttribute('aria-expanded', false);

    // Get the head and the containing box
    let box = document.querySelector(".box");
    let head = document.querySelector("#head");

    // Clear the container form the last play
    Snake.clearContainer(head, box);

    // Set head coordinates
    head.style.top = "100px";
    head.style.left = "240px";

    // Show the head
    head.setAttribute('aria-expanded', true);
    // Show the Score
    document.getElementById('score-h2').setAttribute('aria-expanded', true);

    // Begin a new game, set speed to selected speed
    let snake = new Snake(head, box);
    snake.speed = speed;

    snake.start();
});


// Function for getting the difficulty
function getDifficulty() {
    let difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    localStorage.setItem('difficulty', difficulty);

    switch (difficulty) {
        case 'python': return 60;
        case 'rabbit': return 80;
        case 'turtle': return 100;
    }
    return 80;
}

// Function for updating options
function updateOptions() {
    let selectedDifficulty = localStorage.getItem('difficulty');
    if (!selectedDifficulty) {
        localStorage.setItem('difficulty', 'rabbit');
    }

    let difficultyOptions = document.querySelectorAll('input[name="difficulty"]');
    for (let option of difficultyOptions) {
        if (selectedDifficulty === option.value) option.checked = true;
    }
}