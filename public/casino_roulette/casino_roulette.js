let names = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];
let seats = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
];

let selected = new Array();

let degree = 360 / seats.length;

$(".out-wrapper").on("click", function () {
  $(".notclick").show();
  let num = getNum();
  Roulette("#mask", 8000, seats.length, num, 1, 1, 1);
  Roulette("#midmask", 8000, seats.length, num, 2, 2, 0);
  Roulette("#nummask", 8000, seats.length, num, 1, 2, 0);
  Roulette("#insidemask", 8000, seats.length, num, 2, 1, 0);
});

for (let i = 0; i < seats.length; i++) {
  if (i % 2 == 0) {
    $(".out-circle").append(
      `<div class="cell" style="transform:rotate(${i * degree}deg)"></div>`
    );
    $(".mid-circle").append(
      `<div class="mid-cellb" style="transform:rotate(${i * degree}deg)"></div>`
    );
    $(".num-circle").append(
      `<div class="num-cell" style="transform:rotate(${i * degree}deg)"></div>`
    );
    $(".inside-circle").append(
      `<div class="inside-cellb" style="transform:rotate(${
        i * degree
      }deg)"></div>`
    );
  } else {
    $(".out-circle").append(
      `<div class="cellb" style="transform:rotate(${i * degree}deg)"></div>`
    );
    $(".mid-circle").append(
      `<div class="mid-cell" style="transform:rotate(${i * degree}deg)"></div>`
    );
    $(".num-circle").append(
      `<div class="num-cellb" style="transform:rotate(${i * degree}deg)"></div>`
    );
    $(".inside-circle").append(
      `<div class="inside-cell" style="transform:rotate(${
        i * degree
      }deg);"></div>`
    );
  }
  $(".out-circle").append(
    `<div class="name-card" style="transform:rotate(${
      degree * i
    }deg)"><div class="name">${names[i]}</div></div>`
  );
  $(".num-circle").append(
    `<div class="seat-card" style="transform:rotate(${
      degree * i
    }deg)"><div class="seat">${seats[i]}</div></div>`
  );
  $(".inside-circle").append(
    `<hr style="transform:rotate(${degree / 2 + degree * i}deg)">`
  );
}
setBorder();

function setBorder() {
  $(".cell,.cellb").css({
    "border-top":
      ($(window).height() * 0.425 * 3.14) / seats.length +
      "px solid transparent",
    "border-bottom":
      ($(window).height() * 0.425 * 3.14) / seats.length +
      "px solid transparent",
  });
  $(".mid-cell,.mid-cellb").css({
    "border-top":
      ($(window).height() * 0.35 * 3.14) / seats.length +
      "px solid transparent",
    "border-bottom":
      ($(window).height() * 0.35 * 3.14) / seats.length +
      "px solid transparent",
  });
  $(".num-cell,.num-cellb").css({
    "border-top":
      ($(window).height() * 0.25 * 3.14) / seats.length +
      "px solid transparent",
    "border-bottom":
      ($(window).height() * 0.25 * 3.14) / seats.length +
      "px solid transparent",
  });
  $(".inside-cell,.insid-cellb").css({
    "border-top":
      ($(window).height() * 0.2 * 3.14) / seats.length + "px solid transparent",
    "border-bottom":
      ($(window).height() * 0.2 * 3.14) / seats.length + "px solid transparent",
  });
}

function Roulette(dom, timelength, pieces, target, direction, speed, showname) {
  let timeGap = [1.5, 1, 0.75, 0.5, 0.25];
  let totalRounds = 0;
  let turn = 1;
  switch (direction) {
    case 1:
      totalRounds = pieces * 4 + target;
      turn = 1;
      break;
    case 2:
      totalRounds = pieces * 5 - target;
      turn = -1;
      break;
  }
  let div = Math.ceil((totalRounds - target) / 4);
  $(dom).show();

  let timers;

  switch (speed) {
    case 1:
      timers = setTimeout(timer, 10, dom, timelength, totalRounds);
      break;
    case 2:
      timers = setTimeout(timerSlower, 10, dom, timelength, totalRounds);
      break;
  }

  function timer(dom, time, rounds) {
    if (rounds < 0) {
      $(".target").html(names[target]);
      $(".notclick").hide();
      return;
    }
    let timezone = rounds > 5 ? Math.ceil((rounds - 5) / div) + 1 : 1;
    let timeInterval = 0;
    switch (timezone) {
      case 5:
      case 4:
        timeInterval = 1000 / (div * 2);
        break;
      case 3:
        timeInterval = 1000 / div;
        break;
      case 2:
        timeInterval = 1650 / div;
        break;
      case 1:
        timeInterval = timeGap[rounds - 1] * 1000;
        break;
    }
    time = time - timeInterval;
    if (time < 0) {
      clearTimeout(timers);
    } else {
      let ang = ((rounds + target * turn) % pieces) * degree * turn;
      $(dom).css({
        transform: `rotate(${ang}deg)`,
      });
      if (showname == 1) {
        let nowSeat = Math.floor(ang / degree);
        $(".target").html(names[nowSeat]);
      }
      rounds--;
      timers = setTimeout(timer, timeInterval, dom, time, rounds);
    }
  }

  function timerSlower(dom, time, rounds) {
    if (rounds < 0) {
      $(".target").html(names[target]);
      return;
    }
    let timezone = rounds > 5 ? Math.ceil((rounds - 5) / div) + 1 : 1;
    let timeInterval = 0;
    switch (timezone) {
      case 5:
      case 4:
      case 3:
        timeInterval = 2000 / (div * 3);
        break;
      case 2:
        timeInterval = 2000 / div;
        break;
      case 1:
        timeInterval = 3650 / 6;
        break;
    }
    time = time - timeInterval;
    if (time < 0) {
      clearTimeout(timers);
    } else {
      let ang = ((rounds + target * turn) % pieces) * degree * turn;
      $(dom).css({
        transform: `rotate(${ang}deg)`,
      });
      if (showname == 1) {
        let nowSeat = Math.floor(ang / degree);
        $(".target").html(names[nowSeat]);
      }
      rounds--;
      timers = setTimeout(timerSlower, timeInterval, dom, time, rounds);
    }
  }
}

function getNum() {
  let num2;
  do {
    num2 = Math.floor(Math.random() * seats.length);
  } while (selected.indexOf(num2) >= 0);
  if (selected.length < seats.length) {
    selected.push(num2);
  } else {
    selected.length = 0;
    selected.push(num2);
  }
  // console.log(selected)
  return num2;
}
