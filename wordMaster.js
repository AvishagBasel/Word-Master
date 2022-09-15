const letters = document.querySelectorAll('.playboard-letter');
const loadingDiv = document.querySelector('.loader');
const ANSWER_LENGTH = 5;
const ROW_AMOUNT = 6;
const WORD_URL = "https://words.dev-apis.com/word-of-the-day";
const CHECK_VALIDATION_OF_WORD_URL = "https://words.dev-apis.com/validate-word";
let done = false;
let isLoading = false;
let currentGuess = '';
let currentRow = 0;

async function init(){
    //init the game
    setLoading();
    currentGuess = '';
    currentRow = 0;
    //finding the answer word
    const res = await fetch(WORD_URL);
    const resObj = await res.json();
    const word = resObj.word.toUpperCase();
    //letting the user play
    setLoading();

    document.addEventListener('keydown', function handleKeyPress(event){
        if (done || isLoading){
            //do nothing
        } else {
            const action = event.key;
            if (action === 'Enter'){
                enterLetter(word);
            } else if (action === 'Backspace'){
                backspaceLetter();
            } else if (isLetter(action)){
                addLetter(action.toUpperCase())
            } else {
                //do nothing
            }
        }
    })
}

async function setLoading(){
    isLoading = !isLoading;
    loadingDiv.classList.toggle('hidden', !isLoading);
}

async function enterLetter(word){
    setLoading();
    let isValid = await checkIfValidWord();
    setLoading();

    if (currentGuess.length < ANSWER_LENGTH){
        //do nothing
    } //checking the answerlength valid word guess
    else if (currentRow < ROW_AMOUNT && isValid ){
        //checking if win
        const guessChars = currentGuess.split("");
        const wordChars = word.split("");
        const wordCharMap = makeMap(wordChars);
        markPositionsValidGuess(wordCharMap, wordChars,guessChars);
        if(currentGuess === word){
            winningState();
            return;
        } 
        //the last round
        else if (currentRow === ROW_AMOUNT-1 ){
            lossingState(word);
            return; 
        }
        currentRow++;
        currentGuess='';

    }//dealing with aswerlength but invalid word 
    else if(!isValid){
        markPositionsInvalidGuess();
    }
}

function backspaceLetter(){
    if (currentGuess.length > 0){
        letters[ANSWER_LENGTH * currentRow + currentGuess.length-1].innerText= '';
        currentGuess = currentGuess.substring(0, currentGuess.length-1);
    } else{
        //do nothing
    }
}


function isLetter(letter){
    return /^[a-zA-Z]$/.test(letter);
}

function addLetter(letter){
    if (currentGuess.length === ANSWER_LENGTH){
        //add letter to the end when the row not full
        currentGuess = currentGuess.substring(0,4);
        currentGuess += letter;
    } else {
        //replace the last letter when the row is full
        currentGuess += letter;
    }
    letters[ANSWER_LENGTH * currentRow + currentGuess.length-1].innerText= letter;
}



async function checkIfValidWord(){
    const res = await fetch(CHECK_VALIDATION_OF_WORD_URL, {
        method: "POST",
        body: JSON.stringify({word : currentGuess})
    });
    const resObj = await res.json();
    const isValid = resObj.validWord;
    return isValid;
}


function makeMap(array) {
    const obj = {};
    for (let i = 0; i < array.length; i++) {
      if (obj[array[i]]) {
        console.log(obj[array[i]]);
        obj[array[i]]++;
      } else {
        obj[array[i]] = 1;
      }
    }
    return obj;
  }


function markPositionsValidGuess(wordCharMap, wordChars, guessChars){
    //marking the correct position
    for(let i = 0; i < ANSWER_LENGTH; i++){
        if (guessChars[i] === wordChars[i]){
            letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
            wordCharMap[guessChars[i]]--;
        }
    }
    //marking the correct letters in wrong positions and wrong letters
    for(let i = 0; i < ANSWER_LENGTH; i++){
        if (guessChars[i] === wordChars[i]){
            //do nothing
        }
        else if ( wordChars.includes(guessChars[i]) && wordCharMap[guessChars[i]] > 0){
                letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
                wordCharMap[guessChars[i]]--;
        } else {
            letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
        }
    }

}

function winningState(){
    console.log(3);
    alert ("You win!");
    done = true;
    document.querySelector('.brand').classList.add("winner");
}

function lossingState(answer){
    alert (`You loose! the word was ${answer}`)
    done = true; 
}

function markPositionsInvalidGuess(){
    for(let i = 0; i < ANSWER_LENGTH; i++){
        letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");
        setTimeout(function(){
            letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid");
        })
    }
}

init();