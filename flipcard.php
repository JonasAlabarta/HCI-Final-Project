<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="flipcard.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

  <title>Flashcard App</title>
</head>
<body>
  <div class="container">
    <h1 id="deckH1">CogniFlash Website - Flipping Cards</h1>
    <div id="deckForm" class="form-group">
      <input type="text" id="deckName" placeholder="Enter deck name" />
      <button onclick="createDeck()">Create Deck</button>
    </div> 

    <h2 id="yourDeck"></h2>
    <ul id="deckList" class="deck-list"></ul>

    <div id="deckView" class="deck-view" style="display: none;">
      <h3 id="deckTitle"></h3>
      <h4 id="flashH4">Flashcards:</h4>
      <div id="flashcardList" class="flashcard-list"></div>
      
      <div class="form-group">
        <input type="text" id="question" placeholder="Question" />
        <input type="text" id="answer" placeholder="Answer" />
        <input type="hidden" id="userId" value="12345">
        <button onclick="addFlashcard()">Create Flashcard</button>
      </div>

      <div class="back-container">
        <button id="backToDeck" onclick="backToDecks()" class="back-button">Back to Decks</button>
      </div>
    </div>
    <div class="logout-container">
    <a href="logout.php" class="logout-button">Logout</a>
    </div>
  </div>
  <script src="flipcard.js"></script>
  <script>
    const userId = <?php echo json_encode($_SESSION['user_id']); ?>;  // User ID from PHP session
    console.log(userId);  // Log userId to check if it's passed correctly

    // Example of using userId in a function or AJAX request
    function addFlashcard() {
        console.log('Adding flashcard for user:', userId);
        const question = document.getElementById('question').value;
        const answer = document.getElementById('answer').value;

        const data = {
            user_id: userId,
            question: question,
            answer: answer
        };

        // AJAX request or other logic here
    }
  </script>
</body>
</html>
