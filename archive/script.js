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

let players = ["Samantha", "Hannah", "Ariel", "Emma"];
let timers = [];
let currentIndex = 0;
let interval = null;
let countingDown = true;
let duration = 90;

let lastFlashedSecond = null;
let menuButton;
let closeButton;
let isTransitioning = false;

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("keydown", (e) => {
    // Don't interfere with input fields
    if (e.target.tagName === 'INPUT') return;
    
    if (e.code === "Space") {
      e.preventDefault();
      nextPlayer();
    } else if (e.code === "Backspace") {
      e.preventDefault();
      prevPlayer();
    } else if (e.key === "p" || e.code === "KeyP") {
      e.preventDefault();
      toggleTimer();
    }
  });

  function prevPlayer() {
    if (players.length === 0 || isTransitioning) return;
    animateTransition('prev');
  }

  window.prevPlayer = prevPlayer;

  const carousel = document.getElementById("carousel");

  function initTimers() {
    timers = players.map(() => (countingDown ? duration : 0));
  }

  function getCardPosition(index, currentIndex, totalPlayers) {
    const diff = index - currentIndex;
    const normalizedDiff = ((diff % totalPlayers) + totalPlayers) % totalPlayers;
    
    if (normalizedDiff === 0) return 'current';
    if (normalizedDiff === 1 || (normalizedDiff === totalPlayers - 1 && totalPlayers === 2)) return 'next';
    if (normalizedDiff === totalPlayers - 1) return 'prev';
    return 'hidden';
  }

  function renderCarousel() {
    const carousel = document.getElementById("carousel");
    const track = carousel.querySelector('.carousel-track');
    track.innerHTML = '';

    if (players.length === 0) return;

    // Reset timer for current player
    timers[currentIndex] = countingDown ? duration : 0;

    players.forEach((player, index) => {
      const div = document.createElement("div");
      const position = getCardPosition(index, currentIndex, players.length);
      
      div.className = `player-card ${position}`;
      div.dataset.index = index;
      
      const isCurrent = position === 'current';
      div.innerHTML = `
        <div class="player-name">${player}</div>
        <div class="timer" id="timer-${index}">${formatTime(timers[index])}</div>
        ${isCurrent ? `<button class="pause-button large-button${interval ? ' paused' : ''}">${interval ? "⏸" : "⏵"}</button>` : ''}
      `;
      
      track.appendChild(div);
      
      if (isCurrent) {
        const pauseBtn = div.querySelector(".pause-button");
        if (pauseBtn) {
          pauseBtn.addEventListener("click", toggleTimer);
        }
        
        // Set up progress animation
        div.style.setProperty('--duration', `${duration}s`);
        div.style.setProperty('--progress-angle', `360deg`);
        div.classList.add('animate');
      }
    });

    // Add click handlers for navigation
    track.querySelectorAll('.player-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('pause-button')) return;
        
        const clickedIndex = parseInt(card.dataset.index);
        const position = getCardPosition(clickedIndex, currentIndex, players.length);
        
        if (position === 'next' || position === 'far-next') {
          nextPlayer();
        } else if (position === 'prev' || position === 'far-prev') {
          prevPlayer();
        }
      });
    });
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
        pauseBtn.innerHTML = "⏵";
      }
    } else {
      interval = setInterval(() => {
        if (countingDown) {
          if (timers[currentIndex] > 0) {
            timers[currentIndex] = Math.max(0, timers[currentIndex] - 0.1);
          } else {
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
          
          const tensecbeep = new Audio('sounds/10secondding.mp3');
          const threesecbeep = new Audio('sounds/4secondbeep.mp3');

          card.classList.remove("solid-red");

          if (timeLeft <= 0.1) {
            card.classList.remove("flash-red");
            card.classList.add("solid-red");
            clearInterval(interval);
            interval = null;
          } else if (secondsLeft === 10) {
            if (lastFlashedSecond !== 10) {
              tensecbeep.play();
              lastFlashedSecond = 10;
            }
          } else if ([5, 4, 3, 2, 1].includes(secondsLeft)) {
            if (secondsLeft !== lastFlashedSecond) {
              card.classList.remove("flash-red");
              void card.offsetWidth;
              card.classList.add("flash-red");
              setTimeout(() => {
                card.classList.remove("flash-red");
              }, 400);
              lastFlashedSecond = secondsLeft;
              if (secondsLeft === 3) {
                threesecbeep.play();
              }
            }
          } else {
            card.classList.remove("flash-red");
          }
        }
      }, 100);
      
      if (pauseBtn) {
        pauseBtn.classList.add("paused");
        pauseBtn.innerHTML = "⏸";
      }
    }
  }

  function updateTimerDisplay() {
    const timerEl = document.getElementById(`timer-${currentIndex}`);
    if (timerEl) timerEl.textContent = formatTime(timers[currentIndex]);
  }

  function nextPlayer() {
    if (players.length === 0 || isTransitioning) return;
    animateTransition('next');
  }

  function animateTransition(direction) {
    if (isTransitioning) return;
    isTransitioning = true;

    const track = document.querySelector('.carousel-track');
    const existingCards = Array.from(track.querySelectorAll('.player-card'));
    
    // Update the current index
    const oldIndex = currentIndex;
    if (direction === 'next') {
      currentIndex = (currentIndex + 1) % players.length;
    } else {
      currentIndex = (currentIndex - 1 + players.length) % players.length;
    }

    // Reset timer for new current player
    timers[currentIndex] = countingDown ? duration : 0;

    // Create the new card that will slide in
    const newCardIndex = direction === 'next' ? 
      (oldIndex + 2) % players.length : 
      (oldIndex - 2 + players.length) % players.length;
    
    const newPosition = direction === 'next' ? 'next' : 'prev';
    const newCard = document.createElement("div");
    newCard.className = `player-card ${newPosition}`;
    newCard.dataset.index = newCardIndex;
    newCard.innerHTML = `
      <div class="player-name">${players[newCardIndex]}</div>
      <div class="timer" id="timer-${newCardIndex}">${formatTime(timers[newCardIndex])}</div>
    `;

    // Position new card off-screen
    if (direction === 'next') {
      newCard.style.transform = 'translateX(400px) translateZ(-300px) rotateY(-60deg) scale(0.6)';
      newCard.style.opacity = '0';
    } else {
      newCard.style.transform = 'translateX(-400px) translateZ(-300px) rotateY(60deg) scale(0.6)';
      newCard.style.opacity = '0';
    }
    newCard.style.transition = 'all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)';
    track.appendChild(newCard);

    // Animate existing cards and new card to their new positions
    requestAnimationFrame(() => {
      existingCards.forEach(card => {
        const cardIndex = parseInt(card.dataset.index);
        const newPosition = getCardPosition(cardIndex, currentIndex, players.length);
        
        // Update class names
        card.className = `player-card ${newPosition}`;
        
        // Update content for new current player
        if (newPosition === 'current') {
          card.innerHTML = `
            <div class="player-name">${players[cardIndex]}</div>
            <div class="timer" id="timer-${cardIndex}">${formatTime(timers[cardIndex])}</div>
            <button class="pause-button large-button${interval ? ' paused' : ''}">${interval ? "⏸" : "⏵"}</button>
          `;
        } else {
          card.innerHTML = `
            <div class="player-name">${players[cardIndex]}</div>
            <div class="timer" id="timer-${cardIndex}">${formatTime(timers[cardIndex])}</div>
          `;
        }
        
        // Animate to new position
        if (newPosition === 'current') {
          card.style.transform = 'translateZ(0px) scale(1.2)';
          card.style.opacity = '1';
        } else if (newPosition === 'prev') {
          card.style.transform = 'translateX(-200px) translateZ(-150px) rotateY(45deg) scale(0.8)';
          card.style.opacity = '0.6';
        } else if (newPosition === 'next') {
          card.style.transform = 'translateX(200px) translateZ(-150px) rotateY(-45deg) scale(0.8)';
          card.style.opacity = '0.6';
        } else if (newPosition === 'hidden') {
          if (direction === 'next') {
            card.style.transform = 'translateX(-400px) translateZ(-300px) rotateY(60deg) scale(0.6)';
          } else {
            card.style.transform = 'translateX(400px) translateZ(-300px) rotateY(-60deg) scale(0.6)';
          }
          card.style.opacity = '0';
        }
      });

      // Animate new card to its final position
      if (direction === 'next') {
        newCard.style.transform = 'translateX(200px) translateZ(-150px) rotateY(-45deg) scale(0.8)';
        newCard.style.opacity = '0.6';
      } else {
        newCard.style.transform = 'translateX(-200px) translateZ(-150px) rotateY(45deg) scale(0.8)';
        newCard.style.opacity = '0.6';
      }
    });

    // Clean up and set up event handlers after animation
    setTimeout(() => {
      // Remove hidden cards
      track.querySelectorAll('.player-card.hidden').forEach(card => card.remove());
      
      // Set up event handlers
      const currentCard = track.querySelector('.player-card.current');
      if (currentCard) {
        const pauseBtn = currentCard.querySelector(".pause-button");
        if (pauseBtn) {
          pauseBtn.addEventListener("click", toggleTimer);
        }
        currentCard.style.setProperty('--duration', `${duration}s`);
        currentCard.style.setProperty('--progress-angle', `360deg`);
        currentCard.classList.add('animate');
      }
      
      track.querySelectorAll('.player-card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.classList.contains('pause-button')) return;
          
          const clickedIndex = parseInt(card.dataset.index);
          const position = getCardPosition(clickedIndex, currentIndex, players.length);
          
          if (position === 'next') {
            nextPlayer();
          } else if (position === 'prev') {
            prevPlayer();
          }
        });
      });
      
      isTransitioning = false;
    }, 600);
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

    turnDurationInput.style.display = isCountdown ? "block" : "none";
    resetAllBtn.style.display = isCountdown ? "none" : "block";

    // Handle mode labels if they exist
    const modeLabelUp = document.getElementById("modeLabelUp");
    const modeLabelDown = document.getElementById("modeLabelDown");
    if (modeLabelUp && modeLabelDown) {
      modeLabelUp.classList.toggle("active-mode", !isCountdown);
      modeLabelDown.classList.toggle("active-mode", isCountdown);
    }
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
        if (currentIndex >= players.length) {
          currentIndex = Math.max(0, players.length - 1);
        }
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

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    document.querySelector('.theme-toggle').innerText = next === 'dark' ? '🌙' : '🌞';
  }

  document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    const toggleBtn = document.querySelector('.theme-toggle');
    if (toggleBtn) toggleBtn.innerText = saved === 'dark' ? '🌙' : '🌞';
  });

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

  // Add touch/swipe support for mobile
  let startX = 0;
  let startY = 0;
  let isDragging = false;

  carousel.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isDragging = true;
  });

  carousel.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
  });

  carousel.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - startX;
    const deltaY = endY - startY;

    // Only trigger if horizontal swipe is more significant than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        prevPlayer();
      } else {
        nextPlayer();
      }
    }
  });
});
