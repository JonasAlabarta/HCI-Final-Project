let decks = [];
let currentCardIndex = 0; // Track the current flashcard in the deck

// Fetch decks from the server when the page loads
document.addEventListener('DOMContentLoaded', () => {
  loadDecks();
});

// Function to load decks from the server
function loadDecks() {
  fetch('api.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ action: 'getDecks' }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
      } else {
        decks = data.map(deck => ({ ...deck, flashcards: [] }));
        updateDeckList();
      }
    })
    .catch(error => console.error('Error fetching decks:', error));
}

// Create a new deck and save it to the server
function createDeck() {
  const deckName = document.getElementById('deckName').value.trim();

  if (deckName === "") {
    alert("Please enter a deck name.");
    return;
  }

  fetch('api.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ action: 'createDeck', name: deckName }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
      } else {
        decks.push({ id: data.deck_id, name: deckName, flashcards: [] });
        updateDeckList();
        document.getElementById('deckName').value = "";
      }
    })
}

// Update the list of decks displayed on the page
function updateDeckList() {
  const deckListElement = document.getElementById('deckList');
  deckListElement.innerHTML = ''; // Clear the list

  decks.forEach((deck, index) => {
    const deckItem = document.createElement('li');
    deckItem.classList.add('deck-item');
    deckItem.innerHTML = `
      ${deck.name} 
      <button onclick="viewDeck(${index})">View</button>
      <button onclick="deleteDeck(${index})">Delete</button>
    `;
    deckListElement.appendChild(deckItem);
  });
}

// View a deck and load its flashcards from the server
function viewDeck(index) {
  const deck = decks[index];
  document.getElementById('deckTitle').innerText = deck.name;

  const deckView = document.getElementById('deckView');
  deckView.style.display = 'block';
  document.getElementById('deckList').style.display = 'none';

  const deckForm = document.getElementById('deckForm');
  deckForm.style.display = 'none';

  const myFlash = document.getElementById('myFlash');
  if (deck.flashcards.length > 0) {
    myFlash.innerHTML = 'Flashcards:';
  } else {
    myFlash.innerHTML = ' ';
  }

  currentCardIndex = 0; // Reset to the first card when viewing a deck

  // Fetch flashcards from the server
  fetch('api.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ action: 'getFlashcards', deck_id: deck.id }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
      } else {
        deck.flashcards = data; // Update the deck with its flashcards
        console.log(data); // Log the flashcards to check if they are being fetched correctly
        updateFlashcards(index);
      }
    })
    .catch(error => console.error('Error fetching flashcards:', error));
}


// Add a new flashcard and save it to the server
function addFlashcard() {
  const question = document.getElementById('question').value.trim();
  const answer = document.getElementById('answer').value.trim();
  const deckIndex = decks.findIndex(deck => deck.name === document.getElementById('deckTitle').innerText);

  if (question === "" || answer === "") {
    alert("Please enter both question and answer.");
    return;
  }

  fetch('api.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'addFlashcard',
      deck_id: decks[deckIndex].id,
      question,
      answer,
    }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
      } else {
        decks[deckIndex].flashcards.push({ id: data.flashcard_id, question, answer });
        updateFlashcards(deckIndex);
        document.getElementById('question').value = "";
        document.getElementById('answer').value = "";
      }
    })
    .catch(error => console.error('Error adding flashcard:', error));
}

// Update the flashcards displayed for the current deck
function updateFlashcards(deckIndex) {
  const flashcardListElement = document.getElementById('flashcardList');
  
  if (!flashcardListElement) {
    console.error('Flashcard list element not found.');
    return;
  }
  
  flashcardListElement.innerHTML = ''; // Clear the list

  const deck = decks[deckIndex];
  const currentFlashcard = deck.flashcards[currentCardIndex];

  if (currentFlashcard) {
    const flashcardItem = document.createElement('div');
    flashcardItem.classList.add('flashcard-item');

    flashcardItem.innerHTML = `
      <div class="flashcard" onclick="flipCard(event)">
        <div class="front">${currentFlashcard.question}</div>
        <div class="back">${currentFlashcard.answer}</div>
      </div>
    `;

    flashcardListElement.appendChild(flashcardItem);

    // Show answer input and check answer button
    const answerInputDiv = document.createElement('div');
    answerInputDiv.classList.add('answer-input');

    answerInputDiv.innerHTML = `
      <input type="text" id="answerInput" placeholder="Type your answer" />
      <button onclick="checkAnswer(${deckIndex})">Check Answer</button>
      <div id="feedback" class="feedback"></div>
    `;
    flashcardListElement.appendChild(answerInputDiv);

    // Edit and Delete buttons
    const editDeleteDiv = document.createElement('div');
    editDeleteDiv.classList.add('edit-delete-container');

    editDeleteDiv.innerHTML = `
      <button class="edit" onclick="editFlashcard(event, ${deckIndex}, ${currentCardIndex})">Edit</button>
      <button class="delete" onclick="deleteFlashcard(${deckIndex}, ${currentCardIndex})">Delete</button>
    `;
    flashcardListElement.appendChild(editDeleteDiv);

    // Next button (visible only if more than one flashcard)
    if (deck.flashcards.length > 1) {
      const navigationDiv = document.createElement('div');
      navigationDiv.classList.add('navigation-container');

      const prevButton = document.createElement('button');
      prevButton.textContent = 'Previous';
      prevButton.onclick = () => prevCard(deckIndex);

      const nextButton = document.createElement('button');
      nextButton.textContent = 'Next';
      nextButton.onclick = () => nextCard(deckIndex);

      navigationDiv.appendChild(prevButton);
      navigationDiv.appendChild(nextButton);
      flashcardListElement.appendChild(navigationDiv);
    }
  } else {
    flashcardListElement.innerHTML = '<p>No flashcards found. Add one!</p>';
  }
}


function flipCard(event) {
  const flashcard = event.currentTarget; // Get the clicked flashcard
  flashcard.classList.toggle('flipped'); // Toggle the flip effect
}

// Move to the next flashcard
function nextCard(deckIndex) {
  const deck = decks[deckIndex];
  if (currentCardIndex < deck.flashcards.length - 1) {
    currentCardIndex++;
    updateFlashcards(deckIndex);
  } else {
    alert("You've reached the end of the deck.");
  }
}

// Move to the previous flashcard
function prevCard(deckIndex) {
  const deck = decks[deckIndex];
  if (currentCardIndex > 0) {
    currentCardIndex--;
    updateFlashcards(deckIndex);
  } else {
    alert("You're already at the first card.");
  }
}

// Go back to the deck list
function backToDecks() {
  document.getElementById('deckView').style.display = 'none';
  document.getElementById('deckList').style.display = 'block';
  document.getElementById('deckForm').style.display = 'block';
  document.getElementById('deckH1').style.display = 'block';
}

// Check the user's answer
function checkAnswer(deckIndex) {
  const answerInput = document.getElementById('answerInput');
  const feedback = document.getElementById('feedback');
  const deck = decks[deckIndex];
  const currentFlashcard = deck.flashcards[currentCardIndex];

  if (answerInput.value.trim() === "") {
    feedback.textContent = "Please enter an answer.";
    return;
  }

  if (answerInput.value.trim().toLowerCase() === currentFlashcard.answer.toLowerCase()) {
    feedback.textContent = "Correct!";
    feedback.style.color = "green";
  } else {
    feedback.textContent = `Incorrect! The correct answer is: ${currentFlashcard.answer}`;
    feedback.style.color = "red";
  }
}

// Edit a flashcard
function editFlashcard(event, deckIndex, flashcardIndex) {
  const deck = decks[deckIndex];
  const flashcard = deck.flashcards[flashcardIndex];

  const newQuestion = prompt("Edit Question", flashcard.question);
  const newAnswer = prompt("Edit Answer", flashcard.answer);

  if (newQuestion !== null && newAnswer !== null) {
    flashcard.question = newQuestion;
    flashcard.answer = newAnswer;

    fetch('api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        action: 'editFlashcard',
        flashcard_id: flashcard.id,
        question: newQuestion,
        answer: newAnswer,
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          updateFlashcards(deckIndex);
        }
      })
      .catch(error => console.error('Error editing flashcard:', error));
  }
}

// Delete a flashcard
function deleteFlashcard(deckIndex, flashcardIndex) {
  const deck = decks[deckIndex];
  const flashcardId = deck.flashcards[flashcardIndex].id;

  fetch('api.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'deleteFlashcard',
      flashcard_id: flashcardId,
    }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
      } else {
        deck.flashcards.splice(flashcardIndex, 1); // Remove flashcard from deck
        if (currentCardIndex >= deck.flashcards.length) {
          currentCardIndex = deck.flashcards.length - 1; // Adjust current index if needed
        }
        updateFlashcards(deckIndex);
      }
    })
    .catch(error => console.error('Error deleting flashcard:', error));
}

// Delete a deck
function deleteDeck(deckIndex) {
  const deckId = decks[deckIndex].id;

  fetch('api.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ action: 'deleteDeck', deck_id: deckId }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
      } else {
        decks.splice(deckIndex, 1); // Remove the deck from the list
        updateDeckList();
        document.getElementById('deckView').style.display = 'none';
        document.getElementById('deckList').style.display = 'block';
      }
    })
    .catch(error => console.error('Error deleting deck:', error));
}