// -------------------------------------------------------------

// guesses là một mảng có 6 phần từ
// tương ứng với 6 lần mà người dùng nhập
// lưu lại tiến trình chơi của người dùng

// Mỗi phần từ lớn là một mảng có 5 phần từ con
// Mỗi phần tử con chứa một chữ cái mà người dùng chọn
let guesses = [
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
];



// gọi hàm getUserGuess lấy từ mà người dùng đoán dưới dạng chuỗi
function getUserGuess(row = currentRow) {
  return guesses[row].join("");
}

// currentRow cho biết lượt thử hiện tại của người dùng
// currentRow là một số nguyên có giá trị từ 0 đến 5
let currentRow = 0;

// currentRow cho biết con trỏ mà người dùng nhập ở lượt hiện tại
// currentRow là một số nguyên có giá trị từ 0 đến 4
let currentTile = 0;

// keyword là từ mà người dùng cần phải tìm
// keyword sẽ được tạo ngẫu nhiên
let keyword = "";

let isWinning = false;

function loadLocalSave()//function dùng để load lại màn hình hiển thị và dữ liệu màn chơi dở
{
  keyword = window.localStorage.getItem('keyword')
  row=Number(window.localStorage.getItem('currentRow'))
  guess= JSON.parse(window.localStorage.getItem("guesses"))
  result=JSON.parse(window.localStorage.getItem('result'))
  if(guess!=null){
    guesses=guess
    for(let i=0;i<=row;i++)
    {
        for(let j=0;j<5;j++)
        {
          updateTileLetter()
          addKeysColor(result)
          currentTile++;
        }
        addTilesColor(result)
        currentRow++;
        currentTile=0;
    }
    currentRow=row+1;
  }
}

function saveGameState(result)//function dùng để lưu những thông tin cần thiết để có thể load lại màn đang chơi dở
{
  window.localStorage.setItem('keyword', keyword)
  window.localStorage.setItem('guesses', JSON.stringify(guesses));
  window.localStorage.setItem('currentRow', currentRow);
  window.localStorage.setItem('result', JSON.stringify(result))
  window.localStorage.setItem('Reset',false)
  
}

// -------------------------------------------------------------
// KEYBOARD EVENT

const keys = document.querySelectorAll(".key");
keys.forEach((key) => {
  key.addEventListener("click", () => {
    // Người dùng chỉ có thể ấn khi trò chơi chưa kết thúc
    if (gameIsOver()) return;

    // Tuỳ vào loại phím mà người dùng có thể thêm, xoá ký tự
    // hoặc gửi lên để hệ thống kiểm tra kết quả
    switch (key.id) {
      case "key-enter":
        submitGuess();
        break;

      case "key-delete":
        deleteLetter();
        break;

      default:
        const letter = getLetterFromKey(key);
        addLetter(letter);
        break;
    }
  });
});

function getLetterFromKey(key) {
  // Trả về chữ cái tương ứng với phím key
  // Dữ liệu trả về là chuỗi có 1 ký tự
  return key.id.charAt(key.id.length - 1);
}

// -------------------------------------------------------------
// UPDATE LETTER

function addLetter(letter) {
  if (canAddLetter()) {
    updateGuess(letter);
    currentTile++;
    console.log(
      `Guess is '${getUserGuess()}'`,
      `Cursor is at row ${currentRow}, tile ${currentTile}`
    );
  }
}

function deleteLetter() {
  if (canDeleteLetter()) {
    currentTile--;
    updateGuess("");
    console.log(
      `Guess is '${getUserGuess()}'`,
      `Cursor is at row ${currentRow}, tile ${currentTile}`
    );
  }
}

function updateGuess(letter, tile = currentTile, row = currentRow) {
  guesses[row][tile] = letter;
  updateTileLetter();
}

function updateTileLetter(
  letter = guesses[currentRow][currentTile],
  row = currentRow,
  tile = currentTile
) {
  // TODO: Cập nhập ký tự letter lên Board
  // dựa vào row và tile để xác định vị trí cần thêm vào
  row++;
  const nextRow = document.getElementById('row-' + row);
  const nextTile = nextRow.querySelectorAll('span.tile');
  nextTile[tile].textContent=letter

}

function canAddLetter(tile = currentTile) {
  return tile < 5;
}
function canDeleteLetter(tile = currentTile) {
  return tile > 0;
}

// -------------------------------------------------------------
// SUMMIT & CHECK GUESS

function submitGuess() {
  if (guessIsValid()) {
    const result = checkUserGuess();
    console.log(result);

    // result sẽ trả về một mảng 5 phần tử
    // chứa 1 trong 3 giá trị correct, present hoặc absent
    // function saveGameState() sẽ được gọi mỗi khi có từ hợp lệ được nhập
    saveGameState(result);
    addTilesColor(result);
    addTilesAnimation();

    if (guessIsCorrect(result)) {
      handleWinning();
    } else {
      console.log("Guess is NOT correct");

      addKeysColor(result);
      currentRow++;
      currentTile = 0;

      if (gameIsOver()) {
        handleLosing();
      }
    }
  } else {
    console.log(`Guess '${getUserGuess()}' is not valid`);
    shakeTiles();
  }
}

function guessIsValid(userGuess = getUserGuess()) {
  if (userGuess.length !== 5) return false;
  if (!dictionary.includes(userGuess)) return false;
  return true;
}

function guessIsCorrect(result) {
  return result.every((letter) => isCorrect(letter));
}

function gameIsOver() {
  return isWinning || currentRow > 5;
}

function handleWinning() {
  isWinning = true;
  console.log("Guess is correct");
  //sử dụng key 'Reset' để quyết định tạo màn chơi mới khi đoán đúng, hết lượt hay load lại màn đang chơi dở
  window.localStorage.setItem("Reset", true);
  setTimeout(showModal, 2500);
}

function handleLosing() {
  console.log(`You lose! Keyword is ${keyword}`);
  window.localStorage.setItem("Reset", true);
  setTimeout(showModal, 2500);
}

// -------------------------------------------------------------
// VALIDATION

const correct = "🟢";
const present = "🟡";
const absent = "🔴";

function isCorrect(letter) {
  return letter == correct;
}

function isPresent(letter) {
  return letter == present;
}

function isAbsent(letter) {
  return letter == absent;
}

function checkUserGuess(userGuess = getUserGuess(), solutionWord = keyword) {
  // Hàm này nhận giá trị đầu vào là 2 chuỗi ký tự
  // và trả về một mảng kết quả so sánh của hai chuỗi đó

  let result = [absent, absent, absent, absent, absent];

  // Kiểm tra điều kiện đúng ký tự đúng vị trí
  for (let i = 0; i < 5; i++) {
    if (userGuess.charAt(i) === solutionWord.charAt(i)) {
      result[i] = correct;
      const cutIndex = i;
      solutionWord = cutLetter(solutionWord, cutIndex);
    }
  }

  // Kiểm tra điều kiện đúng ký tự SAI vị trí
  for (let i = 0; i < 5; i++) {
    if (solutionWord.includes(userGuess.charAt(i)) && !isCorrect(result[i])) {
      result[i] = present;
      const cutIndex = solutionWord.indexOf(userGuess.charAt(i));
      solutionWord = cutLetter(solutionWord, cutIndex);
    }
  }

  return result;
}

function cutLetter(word, index) {
  return word.slice(0, index) + "-" + word.slice(index + 1);
}

// -------------------------------------------------------------
// ADD COLOR & ANIMATION

function addTilesColor(result, row = currentRow) {
  // TODO: Cập nhập màu sắc của các tiles trên row hiện tại theo result
  // Chú ý tương thích với hiệu ứng
  result = checkUserGuess();
  const boardRow = document.getElementById(`row-${row + 1}`);
  const tiles = boardRow.querySelectorAll(".tile");
  for(let i = 0; i < 5; i++){
    const tile = tiles[i];
    if(result[i] == correct){
      tile.classList.add('tile--correct');
    } else if(result[i] == present){
      tile.classList.add('tile--present');
    }else{
      tile.classList.add('tile--absent')
    }
    // Gợi ý: Thêm các lớp tile--absent, tile--present, và tile--correct
    // vào các tile tương ứng
  }
}

function addTilesAnimation(row = currentRow) {
  // TODO: Thêm hiệu ứng hiển thị tiles trên row hiện tại
  // Lưu ý có delay giữa các phím. Chú ý tương thích khi thêm màu
  const boardRow = document.getElementById(`row-${row + 1}`);
  const tiles = boardRow.querySelectorAll(".tile");

  for (let i = 0; i < 5; i++) {
    const tile = tiles[i];
    tile.classList.add("tile--flip");
    tile.style.animationDelay = `${i / 3}s`;
    tile.style.transitionProperty = "background-color";
    tile.style.transitionDelay = `${i / 3}s`;

    setTimeout(() => {
      tile.removeAttribute("style");
      tile.classList.remove("tile--flip");
    }, 2500);
  }
  // Gợi ý: Thêm lớp tile--flip vào tile
}

function addKeysColor(result, guessRow = guesses[currentRow]) {
  // TODO: Cập nhập màu sắc của các phím đã vừa ấn
  
  // Hàm này truyền vào một mảng 5 phần tử chính là 5 ký tự mà người dùng vừa nhập
  // Đổi màu các phím guessRow trên bàn phím dựa vào kết quả result
  for (i = 0; i < 5; i++)
  {
    let key = document.getElementById('key-' + guessRow[i]);
    if(isCorrect(result[i])) {
      key.classList.remove('key--absent');
      key.classList.remove('key--present');
      key.classList.add('key--correct');
    }
    else if (isPresent(result[i])){
      if(key.classList.value != 'key key--correct'){
        key.classList.remove('key--absent');
        key.classList.add('key--present');
      }
    }
    else {
      if(key.classList.value != 'key key--correct' && 
        key.classList.value != 'key key--present')
      key.classList.add('key--absent');
    }
  }
  // Gợi ý: Thêm các lớp key--absent, key--present, và key--correct
  // vào các phím tương ứng
}

function shakeTiles(row = currentRow) {
  // TODO: Thêm animation hiển thị tile khi nhập phím và error khi nhập không hợp lệ
  const boardRow = document.getElementById(`row-${row + 1}`);
  const tiles = boardRow.querySelectorAll(".tile");

  for (let i = 0; i < 5; i++) {
    const tile = tiles[i];
    tile.classList.add("tile--shake");

    setTimeout(() => {
      tile.classList.remove("tile--shake");
    }, 500);
  }
}

// -------------------------------------------------------------
// MODAL

const modalContainer = document.querySelector(".modal-container");
const modalCloseBtn = document.querySelector(".modal__close");
const modalResetBtn = document.querySelector(".modal__reset");

function showModal() {
  modalContainer.classList.add("modal--show");

  const status = document.querySelector(".modal__status");
  status.textContent = isWinning ? "You win" : "You lose";

  const answer = document.querySelector(".modal__answer");
  answer.textContent = `The answer is ${keyword.toUpperCase()}`;
}

[modalContainer, modalCloseBtn, modalResetBtn].forEach((element) => {
  element.addEventListener("click", hideModal);
});

function hideModal() {
  modalContainer.classList.remove("modal--show");
  resetGame();
}

// -------------------------------------------------------------
// REAL KEYBOARD

// TODO: Tạo sự kiện cho các phím trên bàn phím thực
// có thể xử lý được như dùng bàn phím trên trang web
addEventListener("keyup",function(event){

  if(event.code  >= 'KeyA' && event.code  <= 'KeyZ')
    addLetter(event.key);
  else if (event.code == 'Enter')
    submitGuess();
  else if (event.code == 'Backspace')
    deleteLetter();
})
// Chỉ yêu cầu các phím chữ cái, nút xoá (backspace) và enter

// -------------------------------------------------------------
// FETCHING DATA

// dictionary chứa danh sách các từ có 5 chữ cái có nghĩa
// dùng để kiểm tra từ mà người dùng nhập
let dictionary = [];

// targetWords chỉ chứa một phần các từ phổ biến
// dùng để sinh từ khoá cho người dùng tìm
let targetWords = [];

async function updateDictionary() {
  const response = await fetch("./data/dictionary.json");
  dictionary = await response.json();
}

async function updateTargetWords() {
  const response = await fetch("./data/targetWords.json");
  targetWords = await response.json();
}

// -------------------------------------------------------------
// RESET GAME

const resetBtn = document.querySelector(".header__resetBtn");
resetBtn.addEventListener("click", resetGame);

function resetGame() {
  // Clean board
  const tileClasses = [
    "tile--absent",
    "tile--present",
    "tile--correct",
    "tile--flip",
    "tile--shake",
  ];

  const tiles = document.querySelectorAll(".tile");
  tiles.forEach((tile) => {
    tile.classList.remove(...tileClasses);
    tile.textContent = "";
  });

  // Clean keyboard
  const keyClasses = ["key--absent", "key--present", "key--correct"];

  const keys = document.querySelectorAll(".key");
  keys.forEach((key) => {
    key.classList.remove(...keyClasses);
  });

  newGame();
  saveGameState();
}

// -------------------------------------------------------------
// UTILS

function startGame() {
  //Nếu key 'Reset là false thì load lại màn đang chơi dở còn không thì tạo một keyword ngấu nhiên và bắt đầu màn chơi mới
  if (JSON.parse(window.localStorage.getItem("Reset")) == false) {
    loadLocalSave();
  } else {
    newGame();
  }
}

function newGame() {
  keyword = getRandomWord();
  guesses = [
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
  ];
  currentRow = 0;
  currentTile = 0;
  isWinning = false;
}

function getRandomWord() {
  return randomItem(targetWords);
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

(async function () {
  await updateDictionary();
  await updateTargetWords();
  startGame();
})();


/*Dark mode*/

const swithButton = document.getElementsByClassName('mode');
const defualtLight =matchMedia('(prefers-color-scheme: light)').matches;
let theme = localStorage.getItem('theme') ? localStorage.getItem('theme') : (defualtLight ? "light" : "dark");
const iconMode = document.getElementById("mode");
const iconReset = document.getElementById("reset");
//Set theme theo hệ thống
setTheme(theme);
//Đổi giữa dark mode và light mode
function switchTheme()
{
  theme = theme ==="light" ? "dark": "light";
  localStorage.setItem("theme", theme);
  setTheme(theme);
}

//Set lại theme sau khi thay đổi mode
function setTheme (mode)
{
  if (mode === 'light')
  {
    document.body.classList.remove('dark'); 
    document.body.classList.toggle('light');
    iconMode.setAttribute('src',"./assets/dark_mode_black.svg");
    iconReset.setAttribute('src',"./assets/refresh_black.svg");
  }
  if (mode === 'dark')
  { 
    document.body.classList.remove('light');
    document.body.classList.toggle('dark');
    iconMode.setAttribute('src',"./assets/dark_mode_white.svg");
    iconReset.setAttribute('src',"./assets/refresh_white.svg");
  }
}

