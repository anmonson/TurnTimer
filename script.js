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
  
  let players = ["Alice", "Bob", "Charlie", "Dana"];
  let timers = [];
  let currentIndex = 0;
  let interval = null;
  let countingDown = false;
  let duration = 30;
  
  let menuButton;
  let closeButton;
  
  document.addEventListener("DOMContentLoaded", () => {
	const carousel = document.getElementById("carousel");
  
	function initTimers() {
	  timers = players.map(() => (countingDown ? duration : 0));
	}
  
	function renderCarousel() {
	  const carousel = document.getElementById("carousel");
	  carousel.innerHTML = '<div class="carousel-track"></div>';
	  const track = carousel.querySelector('.carousel-track');

	  const getCard = (index, isCurrent) => {
		const div = document.createElement("div");
		div.className = "player-card" + (isCurrent ? " current" : "");
		div.innerHTML = `
		  <div class="player-name">${players[index]}</div>
		  <div class="timer" id="timer-${index}">${formatTime(timers[index])}</div>
		  ${isCurrent ? `<button class="pause-button${interval ? ' paused' : ''}">${interval ? "⏸️" : "▶️"}</button>` : ''}
		`;
		return div;
	  };

	  const prev = (currentIndex - 1 + players.length) % players.length;
	  const next = (currentIndex + 1) % players.length;

	  track.appendChild(getCard(prev, false));
	  track.appendChild(getCard(currentIndex, true));
	  track.appendChild(getCard(next, false));

	  const newPauseBtn = track.querySelector(".player-card.current .pause-button");
	  if (newPauseBtn) {
		newPauseBtn.addEventListener("click", toggleTimer);
	  }

	  track.style.transition = "none";
      track.style.transform = "translateX(0%)";
	}
  
	function formatTime(sec) {
	  const m = Math.floor(sec / 60);
	  const s = sec % 60;
	  return `${m}:${s.toString().padStart(2, "0")}`;
	}
  
	function toggleTimer() {
	  const pauseBtn = document.querySelector(".player-card.current .pause-button");
	  if (interval) {
	    clearInterval(interval);
	    interval = null;
	    if (pauseBtn) {
	      pauseBtn.classList.remove("paused");
	      pauseBtn.innerHTML = "▶️";
	    }
	  } else {
	    interval = setInterval(() => {
	      if (countingDown) {
	        if (timers[currentIndex] > 0) {
	          timers[currentIndex]--;
	        } else {
	          // Turn is over
	          clearInterval(interval);
	          interval = null;
	          nextPlayer();
	          return;
	        }
	      } else {
	        timers[currentIndex]++;
	      }
	      updateTimerDisplay();
	    }, 1000);
	    if (pauseBtn) {
	      pauseBtn.classList.add("paused");
	      pauseBtn.innerHTML = "⏸️";
	    }
	  }
	}
  
	function updateTimerDisplay() {
	  const timerEl = document.getElementById(`timer-${currentIndex}`);
	  if (timerEl) timerEl.textContent = formatTime(timers[currentIndex]);
	}
  
	function prevPlayer() {
       const track = document.querySelector(".carousel-track");
       if (!track) return;
       const firstCard = track.children[0];
       const cardWidth = parseFloat(getComputedStyle(firstCard).width);
       const gap = parseFloat(getComputedStyle(track).gap) || 0;
       const offset = cardWidth + gap;
       track.style.transition = "none";
       track.style.transform = "translateX(0)";
       track.getBoundingClientRect(); // force reflow
       track.style.transition = "transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)";
       track.style.transform = `translateX(${offset}px)`;
       track.addEventListener("transitionend", () => {
         track.style.transition = "none";
         track.style.transform = "translateX(0)";
         currentIndex = (currentIndex - 1 + players.length) % players.length;
         if (countingDown) timers[currentIndex] = duration;
         renderCarousel();
       }, { once: true });
	}
  
	function nextPlayer() {
       const track = document.querySelector(".carousel-track");
       if (!track) return;
       const firstCard = track.children[0];
       const cardWidth = parseFloat(getComputedStyle(firstCard).width);
       const gap = parseFloat(getComputedStyle(track).gap) || 0;
       const offset = cardWidth + gap;
       track.style.transition = "none";
       track.style.transform = "translateX(0)";
       track.getBoundingClientRect(); // force reflow
       track.style.transition = "transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)";
       track.style.transform = `translateX(-${offset}px)`;
       track.addEventListener("transitionend", () => {
         track.style.transition = "none";
         track.style.transform = "translateX(0)";
         currentIndex = (currentIndex + 1) % players.length;
         if (countingDown) timers[currentIndex] = duration;
         renderCarousel();
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
  
	window.prevPlayer = prevPlayer;
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

	  const clickedCard = e.target.closest(".player-card");
	  const cards = document.querySelectorAll(".player-card");

	  if (clickedCard === cards[0]) {
	    prevPlayer();
	  } else {
	    nextPlayer();
	  }
	});
  });