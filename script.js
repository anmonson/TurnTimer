function toggleScreen() {
	const mainScreen = document.getElementById("mainScreen");
	const shelf = document.getElementById("setupScreen");
	const isOpening = !shelf.classList.contains("open");
  
	shelf.classList.toggle("open");
	mainScreen.classList.toggle("mainScreenShifted");
  
	const menuButton = document.querySelector(".menu-button:not(.close-button)");
	const closeButton = document.querySelector(".menu-button.close-button");

	
  
	if (isOpening) {
	  menuButton.style.display = "none";
	  closeButton.style.display = "block";
	} else {
	  menuButton.style.display = "block";
	  closeButton.style.display = "none";
	}
  }
  
  let players = ["andy", "joel fishman", "sapenis", "big bruce", "pbg", "lil willy with the lil willy"];
  let timers = [];
  let currentIndex = 0;
  let interval = null;
  let countingDown = true;
let duration = 90;
  
let lastFlashedSecond = null;
  let menuButton;
  let closeButton;
  
  
  document.addEventListener("DOMContentLoaded", () => {
	document.addEventListener("keydown", (e) => {
		if (e.code === "Space") {
		  e.preventDefault();
		  nextPlayer();
		} else if (e.code === "Backspace") {
		  e.preventDefault();
		  prevPlayer();
		}
	  });

	  function prevPlayer() {
		const track = document.querySelector(".carousel-track");
		const card = track.querySelector(".player-card");
		card.classList.add("slide-out");
		card.addEventListener("transitionend", () => {
		  currentIndex = (currentIndex - 1 + players.length) % players.length;
		  renderCarousel();
		  const newCard = document.querySelector(".player-card");
		  newCard.classList.add("slide-in");
		  requestAnimationFrame(() => {
			newCard.classList.remove("slide-in");
		  });
		}, { once: true });
	  }
	
	  window.prevPlayer = prevPlayer;
	  

	const carousel = document.getElementById("carousel");
  
	function initTimers() {
	  timers = players.map(() => (countingDown ? duration : 0));
	}
  
	function renderCarousel() {
      const carousel = document.getElementById("carousel");
      carousel.innerHTML = '<div class="carousel-track"></div>';
      const track = carousel.querySelector('.carousel-track');
      const div = document.createElement("div");
      timers[currentIndex] = countingDown ? duration : 0;
      div.className = "player-card current";
      div.innerHTML = `
        <div class="player-name">${players[currentIndex]}</div>
        <div class="timer" id="timer-${currentIndex}">${formatTime(timers[currentIndex])}</div>
        <button class="pause-button large-button${interval ? ' paused' : ''}">${interval ? "⏸" : "⏵"}</button>
      `;
      track.appendChild(div);
      const pauseBtn = track.querySelector(".pause-button");
      pauseBtn.addEventListener("click", toggleTimer);
      // start continuous gradient animation on the new card
      const card = document.querySelector(".player-card.current");
      card.style.setProperty('--duration', `${duration}s`);
      card.style.setProperty('--progress-angle', `360deg`);
      card.classList.add('animate');
	  card.style.setProperty('--progress-angle', `360deg`);
	}
  
	function formatTime(sec) {
	  const m = Math.floor(sec / 60);
	  const s = Math.floor(sec % 60);
	  return `${m}:${s.toString().padStart(2, "0")}`;
	}
  
	function toggleTimer() {
	  const pauseBtn = document.querySelector(".player-card.current .pause-button");
	  if (interval) {
	    clearInterval(interval);
	    interval = null;
	    if (pauseBtn) {
	      pauseBtn.classList.remove("paused");
	      pauseBtn.innerHTML = "⏵"; // sleek play icon
	    }
	  } else {
	    interval = setInterval(() => {
	      if (countingDown) {
	        if (timers[currentIndex] > 0) {
				timers[currentIndex] = Math.max(0, timers[currentIndex] - 0.1);
	        } else {
	          // Turn is over
	          clearInterval(interval);
	          interval = null;
	          nextPlayer();
	          return;
	        }
	      } else {
			timers[currentIndex] += 0.1;
	      }
	      updateTimerDisplay();
	      const card = document.querySelector(".player-card.current");
		if (card && countingDown) {
  const percent = timers[currentIndex] / duration;
  const angle = 360 * percent;
  card.style.setProperty('--progress-angle', `${angle}deg`);

  const timeLeft = timers[currentIndex];
  const secondsLeft = Math.floor(timeLeft);
			
  const tensecbeep = new Audio('sounds/10secondding.mp3')
  const threesecbeep = new Audio('sounds/4secondbeep.mp3');  

  card.classList.remove("solid-red");

  if (timeLeft <= 0.1) {
    card.classList.remove("flash-red");
    card.classList.add("solid-red");
    clearInterval(interval);
    interval = null;
  }  else if (secondsLeft == 10) {
    tensecbeep.play();
    lastFlashedSecond = 10;
}else if ([5, 4, 3, 2, 1].includes(secondsLeft)) {
    if (secondsLeft !== lastFlashedSecond) {
      card.classList.remove("flash-red");
      void card.offsetWidth; // force reflow
      card.classList.add("flash-red");
      setTimeout(() => {
        card.classList.remove("flash-red");
      }, 400);
      lastFlashedSecond = secondsLeft;
	  if(secondsLeft == 3){
		threesecbeep.play(); 
	  }
    }
  } 
}else {
    card.classList.remove("flash-red");
  
}
	    }, 100);
	    if (pauseBtn) {
	      pauseBtn.classList.add("paused");
	      pauseBtn.innerHTML = "⏸"; // sleek pause icon
	    }
	  }
	}
  
	function updateTimerDisplay() {
	  const timerEl = document.getElementById(`timer-${currentIndex}`);
  if (timerEl) timerEl.textContent = formatTime(timers[currentIndex]);
	}
  
	function nextPlayer() {
    const track = document.querySelector(".carousel-track");
    const card = track.querySelector(".player-card");
    card.classList.add("slide-out");
    card.addEventListener("transitionend", () => {
      currentIndex = (currentIndex + 1) % players.length;
      renderCarousel();
      const newCard = document.querySelector(".player-card");
      newCard.classList.add("slide-in");
      requestAnimationFrame(() => {
        newCard.classList.remove("slide-in");
      });
    }, { once: true });
	}
  
	function resetTimer() {
	  timers[currentIndex] = countingDown ? duration : 0;
	  updateTimerDisplay();
	}
  
	function toggleMode() {
		const isCountdown = document.getElementById("modeToggle").checked;
		countingDown = isCountdown;
		timers = players.map(() => (countingDown ? duration : 0));
		renderCarousel();
	  
		const turnDurationInput = document.getElementById("turnDuration");
		const resetAllBtn = document.getElementById("resetAllBtn");
	  
		// This line works as long as these elements exist
		turnDurationInput.style.display = isCountdown ? "block" : "none";
		resetAllBtn.style.display = isCountdown ? "none" : "block";
	  
		// But this assumes modeLabelUp/modeLabelDown exist, which they don't
		document.getElementById("modeLabelUp").classList.toggle("active-mode", !isCountdown);
		document.getElementById("modeLabelDown").classList.toggle("active-mode", isCountdown);
	  }
  
	function resetAll() {
	  timers = players.map(() => 0);
	  renderCarousel();
	}
	window.resetAll = resetAll;
  
	function updatePlayerList() {
	  const list = document.getElementById("playerList");
	  list.innerHTML = "";
	  players.forEach((name, index) => {
		const li = document.createElement("li");
  
		const input = document.createElement("input");
		input.value = name;
		input.addEventListener("input", () => {
		  players[index] = input.value;
		  renderCarousel();
		});
  
		const delBtn = document.createElement("button");
		delBtn.innerHTML = "&#x1F5D1;";
		delBtn.onclick = () => {
		  players.splice(index, 1);
		  timers.splice(index, 1);
		  currentIndex = Math.max(0, currentIndex - (index <= currentIndex ? 1 : 0));
		  updatePlayerList();
		  renderCarousel();
		};
  
		li.appendChild(input);
		li.appendChild(delBtn);
		list.appendChild(li);
	  });
	}
  
	function addPlayer() {
	  const input = document.getElementById("newPlayerName");
	  const name = input.value.trim();
	  if (name) {
		players.push(name);
		timers.push(countingDown ? duration : 0);
		input.value = "";
		updatePlayerList();
		renderCarousel();
	  }
	}
  
	document.getElementById("turnDuration").addEventListener("input", (e) => {
	  const val = parseInt(e.target.value);
	  if (!isNaN(val)) {
		duration = val;
		if (countingDown) {
		  timers = players.map(() => duration);
		  renderCarousel();
		}
	  }
	});
  
	window.nextPlayer = nextPlayer;
	window.toggleTimer = toggleTimer;
	window.resetTimer = resetTimer;
	window.toggleMode = toggleMode;
	window.addPlayer = addPlayer;
  
	initTimers();
	renderCarousel();
	updatePlayerList();
	document.getElementById("newPlayerName").addEventListener("keydown", (e) => {
	  if (e.key === "Enter") {
		addPlayer();
	  }
	});
  
	const mainScreen = document.getElementById("mainScreen");
  
	menuButton = document.createElement("button");
	menuButton.type = "button";
	menuButton.className = "menu-button";
	menuButton.innerHTML = "☰";
	menuButton.onclick = () => {
	  toggleScreen();
	  menuButton.style.display = 'none';
	  closeButton.style.display = 'block';
	};
  
	closeButton = document.createElement("button");
	closeButton.type = "button";
	closeButton.className = "menu-button close-button";
	closeButton.innerHTML = "✕";
	closeButton.style.display = 'none';
	closeButton.onclick = () => {
	  toggleScreen();
	  menuButton.style.display = 'block';
	  closeButton.style.display = 'none';
	};
  
	const shelf = document.getElementById("setupScreen");
	shelf.appendChild(closeButton);
	mainScreen.insertBefore(menuButton, carousel);
  
	carousel.addEventListener("click", (e) => {
    if (e.target.classList.contains("pause-button")) return;
    nextPlayer();
  });
  });
