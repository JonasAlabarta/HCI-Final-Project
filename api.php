<?php
// Database connection details
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "login";

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set content type for JSON response
header('Content-Type: application/json');

// Establish the database connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]);
    exit();
}

// Get the action parameter from POST
$action = $_POST['action'] ?? null;

// If no action is provided, return an error and exit
if (!$action) {
    echo json_encode(['error' => 'No action specified']);
    exit();
}

// Handle different actions based on the "action" parameter
switch ($action) {
    case 'getDecks':
        $user_id = $_POST['user_id'] ?? null;

        if (!$user_id) {
            echo json_encode(['error' => 'User ID is required.']);
            exit();
        }

        $stmt = $conn->prepare("SELECT * FROM decks WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $decks = [];
        while ($row = $result->fetch_assoc()) {
            $decks[] = $row;
        }

        echo json_encode($decks);
        break;

    case 'createDeck':
        $name = $_POST['name'] ?? '';
        $user_id = $_POST['user_id'] ?? null;

        if (empty($name) || empty($user_id)) {
            echo json_encode(['error' => 'Deck name and user ID are required.']);
            exit();
        }

        $stmt = $conn->prepare("INSERT INTO decks (name, user_id) VALUES (?, ?)");
        $stmt->bind_param("si", $name, $user_id);

        if ($stmt->execute()) {
            echo json_encode(['deck_id' => $stmt->insert_id]);
        } else {
            echo json_encode(['error' => 'Failed to create deck: ' . $stmt->error]);
        }
        break;

    case 'getFlashcards':
        $deck_id = $_POST['deck_id'] ?? null;
        $user_id = $_POST['user_id'] ?? null;

        if (empty($deck_id) || empty($user_id)) {
            echo json_encode(['error' => 'Deck ID and user ID are required.']);
            exit();
        }

        $stmt = $conn->prepare("SELECT * FROM flashcards WHERE deck_id = ? AND user_id = ?");
        $stmt->bind_param("ii", $deck_id, $user_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $flashcards = [];
        while ($row = $result->fetch_assoc()) {
            $flashcards[] = $row;
        }

        echo json_encode($flashcards);
        break;

    case 'addFlashcard':
        $deck_id = $_POST['deck_id'] ?? null;
        $user_id = $_POST['user_id'] ?? null;
        $question = $_POST['question'] ?? '';
        $answer = $_POST['answer'] ?? '';

        if (empty($deck_id) || empty($user_id) || empty($question) || empty($answer)) {
            echo json_encode(['error' => 'Deck ID, user ID, question, and answer are required.']);
            exit();
        }

        $stmt = $conn->prepare("INSERT INTO flashcards (deck_id, user_id, question, answer) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("iiss", $deck_id, $user_id, $question, $answer);

        if ($stmt->execute()) {
            echo json_encode(['flashcard_id' => $stmt->insert_id]);
        } else {
            echo json_encode(['error' => 'Failed to add flashcard: ' . $stmt->error]);
        }
        break;

    default:
        echo json_encode(['error' => 'Invalid action specified']);
        break;
}

// Close the database connection
$conn->close();
?>
