let decks = [];
let currentCardIndex = 0; // Track the current flashcard in the deck

// Fetch decks from the server when the page loads
console.log(userId);

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
  .then(response => {
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    } else {
      console.error('Expected JSON, but got: ', response);
      throw new Error('Expected JSON, but received something else');
    }
  })
  .then(data => {
    if (data.error) {
      alert(data.error);
    } else {
      decks = data.map(deck => ({ ...deck, flashcards: [] }));
      updateDeckList();
    }
  })
  .catch(error => {
    console.error('Error fetching decks:', error);
  });
}

function getUserId() {
  const userIdField = document.getElementById('userId');
  return userIdField ? parseInt(userIdField.value) : null;
}
// Fetch decks from the server when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const userId = getUserId();  // Fetch userId using getUserId function
  console.log(userId); // Now this will correctly log the userId
  loadDecks();
});



// Create a new deck and save it to the server
function createDeck() {
  console.log('Creating deck for user:', userId);
  const deckName = document.getElementById('deckName').value.trim();
  const userId = getUserId();

  updateDeckList()

  if (!userId) {
      alert("User ID is missing. Please log in.");
      return;
  }

  if (deckName === "") {
      alert("Please enter a deck name.");
      return;
  }

  fetch('api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ action: 'createDeck', name: deckName, user_id: userId }),
  })
      .then(response => {
          const contentType = response.headers.get('Content-Type');
          if (contentType && contentType.includes('application/json')) {
              return response.json();
          } else {
              throw new Error('Server response was not JSON');
          }
      })
      .then(data => {
          if (data.error) {
              alert(data.error);
          } else {
              decks.push({ id: data.deck_id, name: deckName, flashcards: [] });
              updateDeckList();
              document.getElementById('deckName').value = "";
          }
      })
      .catch(error => console.error('Error creating deck:', error));
}
function createDeck() {
  const userId = getUserId();  // Fetch userId using getUserId function
  console.log('Creating deck for user:', userId);

  const deckName = document.getElementById('deckName').value.trim();

  if (!userId) {
      alert("User ID is missing. Please log in.");
      return;
  }

  if (deckName === "") {
      alert("Please enter a deck name.");
      return;
  }

  fetch('api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ action: 'createDeck', name: deckName, user_id: userId }),
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
  .catch(error => console.error('Error creating deck:', error));
}


// Update the list of decks displayed on the page
function updateDeckList() {
  const deckListElement = document.getElementById('deckList');
  const yourDeck = document.getElementById('yourDeck');
  
  deckListElement.innerHTML = ''; // Clear the list

  if (decks.length > 0) {
    yourDeck.innerHTML = 'Your Decks:'; // Display message if decks exist
    decks.forEach((deck, index) => {
      const deckItem = document.createElement('li');
      deckItem.classList.add('deck-item');
      deckItem.innerHTML = `
        ${deck.name} 
        <button id="viewDeck" onclick="viewDeck(${index})">View</button>
        <button onclick="deleteDeck(${index})">Delete</button>
      `;
      deckListElement.appendChild(deckItem);
    });
  } else {
    yourDeck.innerHTML = 'Create your own Deck ABOVE!'; // Display message if no decks
  }
}


// Function to dynamically load flashcards using AJAX
function dynamicLoadFlashcards(deckIndex) {
  const deck = decks[deckIndex];

  // Use AJAX to load the flashcards
  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'api.php', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onload = function () {
      if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);

          if (response.error) {
              alert(response.error);
          } else {
              deck.flashcards = response;
              updateFlashcards(deckIndex);
          }
      } else {
          console.error('Error: Unable to load flashcards');
      }
  };

  xhr.onerror = function () {
      console.error('Error: AJAX request failed');
  };

  // Send the AJAX request
  xhr.send(new URLSearchParams({
      action: 'getFlashcards',
      deck_id: deck.id
  }));
}

// View a deck and load its flashcards from the server
function viewDeck(index) {

  document.body.style.height = '80vh';
  const deckForm = document.getElementById('deckForm');
  deckForm.style.display = 'none';
  const deck = decks[index];
  document.getElementById('deckTitle').innerText = deck.name;

  const deckView = document.getElementById('deckView');
  deckView.style.display = 'block';
  document.getElementById('deckList').style.display = 'none';

  currentCardIndex = 0; // Reset to the first card when viewing a deck

  dynamicLoadFlashcards(index);

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
        updateFlashcards(index);
      }
    })
    .catch(error => console.error('Error fetching flashcards:', error));
}

// Add a new flashcard and save it to the server
function addFlashcard() {
  console.log('Adding flashcard for user:', userId);
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
          // Add new flashcard to the deck
          decks[deckIndex].flashcards.push({ id: data.flashcard_id, question, answer });

          // Reset `currentCardIndex` to the first flashcard if it was empty
          if (decks[deckIndex].flashcards.length === 1) {
              currentCardIndex = 0;
          }

          updateFlashcards(deckIndex);

          // Clear input fields
          document.getElementById('question').value = "";
          document.getElementById('answer').value = "";
      }
  })
  .catch(error => console.error('Error adding flashcard:', error));
}

// Update the flashcards displayed for the current deck
function updateFlashcards(deckIndex) {
  document.body.style.height = '150vh';
  
  const flashcardListElement = document.getElementById('flashcardList');
  flashcardListElement.innerHTML = ''; // Clear the list

  const deck = decks[deckIndex];

  const currentFlashcard = deck.flashcards[currentCardIndex];

  if (deck.flashcards.length === 0) {
    document.getElementById('flashH4').innerHTML = 'Create your Flashcards';
    flashcardListElement.style.display = 'none';
    flashcardListElement.innerHTML = '<p>No flashcards found. Add one!</p>';
    document.body.style.height = '70vh';
    return;
} else {
  flashcardListElement.style.display = 'block';
  document.getElementById('flashH4').innerHTML = 'Flashcards:';
  document.getElementById('flashH4').style.marginLeft = '0px';
}

if (currentFlashcard) {
    // Existing logic to display the current flashcard...
}

  if (currentFlashcard) {

    // Create the container for the flashcard
    const flashcardContainer = document.createElement('div');
    flashcardContainer.classList.add('flashcard-container');

    // Create the flashcard item
    const flashcardItem = document.createElement('div');
    flashcardItem.classList.add('flashcard-item');

    // Flashcard front and back
    flashcardItem.innerHTML = `
      <div class="flashcard" onclick="flipCard(event)">
        <div class="front">${currentFlashcard.question}</div>
        <div class="back">${currentFlashcard.answer}</div>
      </div>
    `;

    // Create answer input div
    const answerInputDiv = document.createElement('div');
    answerInputDiv.classList.add('answer-input');

    // Add navigation buttons if there is more than one flashcard
    if (deck.flashcards.length > 1) {
        const navigationDiv = document.createElement('div');
        navigationDiv.classList.add('navigation-container');

        // Previous button
        const prevButton = document.createElement('button');
        prevButton.classList.add('prev');
        prevButton.innerHTML = '<i class="fas fa-arrow-left"></i>';
        prevButton.onclick = () => prevCard(deckIndex);
        navigationDiv.appendChild(prevButton);

        // Next button
        const nextButton = document.createElement('button');
        nextButton.classList.add('next');
        nextButton.innerHTML = '<i class="fas fa-arrow-right"></i>';
        nextButton.onclick = () => nextCard(deckIndex);
        navigationDiv.appendChild(nextButton);

        answerInputDiv.appendChild(navigationDiv);
    }

    // Add edit and delete buttons
    const editDeleteDiv = document.createElement('div');
    editDeleteDiv.classList.add('EditDelete');
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.classList.add('edit');
    editButton.onclick = (event) => editFlashcard(event, deckIndex, currentCardIndex);
    editDeleteDiv.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete');
    deleteButton.onclick = () => deleteFlashcard(deckIndex, currentCardIndex);
    editDeleteDiv.appendChild(deleteButton);
    answerInputDiv.appendChild(editDeleteDiv);

    // Answer checker section
    const answerCheckerDiv = document.createElement('div');
    answerCheckerDiv.classList.add('answerChecker');
    const answerInput = document.createElement('input');
    answerInput.type = 'text';
    answerInput.id = 'answerInput';
    answerInput.placeholder = 'Type your answer';
    answerCheckerDiv.appendChild(answerInput);

    const checkAnswerButton = document.createElement('button');
    checkAnswerButton.textContent = 'Check Answer';
    checkAnswerButton.onclick = () => checkAnswer(deckIndex);
    answerCheckerDiv.appendChild(checkAnswerButton);
    answerInputDiv.appendChild(answerCheckerDiv);

    // Feedback display
    const feedbackDiv = document.createElement('div');
    feedbackDiv.id = 'feedback';
    feedbackDiv.classList.add('feedback');
    answerInputDiv.appendChild(feedbackDiv);

    // Append the answer input div to the flashcard item
    flashcardItem.appendChild(answerInputDiv);

    // Append the flashcard item to the flashcard container
    flashcardContainer.appendChild(flashcardItem);

    // Append the flashcard container to the flashcard list
    flashcardListElement.appendChild(flashcardContainer);

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
    const nextButton = document.getElementsByClassName('next')[0];
    if (nextButton) {
      nextButton.style.display = 'none'; // Hide the next button
    }
    
  }
}

// Move to the previous flashcard
function prevCard(deckIndex) {
  const deck = decks[deckIndex];
  if (currentCardIndex > 0) {
    currentCardIndex--;
    updateFlashcards(deckIndex);
  } else {
    const nextButton = document.getElementsByClassName('prev')[0];
    if (nextButton) {
      nextButton.style.display = 'none'; // Hide the next button
    }
  }
}

// Go back to the deck list
function backToDecks() {
  document.getElementById('deckView').style.display = 'none';
  document.getElementById('deckList').style.display = 'block';
  document.getElementById('deckForm').style.display = 'block';
  document.getElementById('deckH1').style.display = 'block';
  document.body.style.height = '50vh';
}

// Check the user's answer
function checkAnswer(deckIndex) {
  const answerInput = document.getElementById('answerInput');
  const feedback = document.getElementById('feedback');
  const deck = decks[deckIndex];
  const currentFlashcard = deck.flashcards[currentCardIndex];

  if (answerInput.value.trim() === "") {
    feedback.textContent = "Please enter an answer.";
    const enterAnswer = document.getElementById('feedback');
    enterAnswer.style.width = '200px';
    return;
  }

  if (answerInput.value.trim().toLowerCase() === currentFlashcard.answer.toLowerCase()) {
    feedback.textContent = "Correct!";
    feedback.style.color = "green";
  } else {
    feedback.textContent = `Incorrect!`;
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
          // Reset `currentCardIndex` to 0 if all flashcards are deleted
          if (deck.flashcards.length === 0) {
              currentCardIndex = 0;
              document.getElementById('flashH4').style.marginLeft = '160px';

          } else if (currentCardIndex >= deck.flashcards.length) {
              currentCardIndex = deck.flashcards.length - 1;
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





