<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php"); // Redirect to login if not logged in
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="flipcard.css">
  <title>Flashcard App</title>
</head>
<body>
  <div class="container">
    <h1 id="deckH1">Flashcard Website - Flipping Cards</h1>

    <!-- Deck Creation Form -->
    <div id="deckForm" class="form-group">
      <input type="text" id="deckName" placeholder="Enter deck name" />
      <button onclick="createDeck()">Create Deck</button>
    </div> 

    <h2>Your Decks:</h2>
    <ul id="deckList" class="deck-list"></ul>

    <!-- Deck View Section -->
    <div id="deckView" class="deck-view" >
      <h3 id="deckTitle"></h3>
      <h4 class="flashC" id="myFlash"></h4>
      <div id="flashcardList" class="flashcard-list"></div>
      
      <!-- Create Flashcard Section -->
      <div class="form-group">
        <input type="text" id="question" placeholder="Question" />
        <input type="text" id="answer" placeholder="Answer" />
        <button onclick="addFlashcard()">Create Flashcard</button>
      </div>

      <button onclick="backToDecks()">Back to Decks</button>
      <a class="logout" href="logout.php">Logout</a>
    </div>
  </div>
  <div >
  
</div>
  <script src="flipcard.js"></script>
</body>
</html>