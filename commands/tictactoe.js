// Store active games
const activeGames = new Map();

export default {
    name: "tictactoe",
    description: "Play Tic Tac Toe against the bot",
    category: "games",
    
    async execute(message, client, args) {
        try {
            const chatId = message.key.remoteJid;
            const userId = message.key.participant || message.key.remoteJid;

            if (args[0]?.toLowerCase() === 'end') {
                if (activeGames.has(chatId)) {
                    activeGames.delete(chatId);
                    await client.sendMessage(chatId, {
                        text: "🎮 Game ended! Start a new one with: tictactoe"
                    }, { quoted: message });
                }
                return;
            }

            // Check if there's an active game
            const game = activeGames.get(chatId);
            if (game) {
                return handlePlayerMove(game, chatId, userId, args[0], client, message);
            }

            // Start new game
            await client.sendMessage(chatId, {
                text: `🎮 *TIC TAC TOE vs BOT* 🤖\n\nI'll be your opponent! You are ❌ and I am ⭕\n\nUse numbers 1-9 to make your moves:\n\n1 2 3\n4 5 6\n7 8 9\n\nType: tictactoe [number]\nExample: tictactoe 5\n\nEnd game: tictactoe end`
            }, { quoted: message });

            // Initialize new game
            startNewGame(chatId, userId, client);

        } catch (error) {
            console.error('TicTacToe error:', error);
            await client.sendMessage(chatId, {
                text: "❌ Game error occurred. Please try again."
            }, { quoted: message });
        }
    }
};

function startNewGame(chatId, userId, client) {
    const game = {
        board: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        player: userId,
        currentPlayer: '❌', // Player starts first
        gameActive: true
    };
    activeGames.set(chatId, game);
}

async function handlePlayerMove(game, chatId, userId, move, client, message) {
    if (!game.gameActive) {
        activeGames.delete(chatId);
        return;
    }

    // Validate move
    const moveIndex = parseInt(move) - 1;
    if (isNaN(moveIndex) || moveIndex < 0 || moveIndex > 8 || game.board[moveIndex] === '❌' || game.board[moveIndex] === '⭕') {
        await client.sendMessage(chatId, {
            text: "❌ Invalid move! Please choose a number 1-9 that hasn't been taken.\n\nCurrent board:\n" + displayBoard(game.board)
        }, { quoted: message });
        return;
    }

    // Player's move
    game.board[moveIndex] = '❌';

    // Check if player wins
    if (checkWinner(game.board, '❌')) {
        await client.sendMessage(chatId, {
            text: `🎉 *YOU WIN!* 🎉\n\n${displayBoard(game.board)}\n\nCongratulations! You beat the bot! 🏆\n\nPlay again: tictactoe`
        }, { quoted: message });
        activeGames.delete(chatId);
        return;
    }

    // Check for tie
    if (isBoardFull(game.board)) {
        await client.sendMessage(chatId, {
            text: `🤝 *IT'S A TIE!* 🤝\n\n${displayBoard(game.board)}\n\nGood game! Play again: tictactoe`
        }, { quoted: message });
        activeGames.delete(chatId);
        return;
    }

    // Bot's move
    const botMove = getBotMove(game.board);
    game.board[botMove] = '⭕';

    // Check if bot wins
    if (checkWinner(game.board, '⭕')) {
        await client.sendMessage(chatId, {
            text: `🤖 *BOT WINS!* 🤖\n\n${displayBoard(game.board)}\n\nBetter luck next time! 😄\n\nPlay again: tictactoe`
        }, { quoted: message });
        activeGames.delete(chatId);
        return;
    }

    // Check for tie after bot move
    if (isBoardFull(game.board)) {
        await client.sendMessage(chatId, {
            text: `🤝 *IT'S A TIE!* 🤝\n\n${displayBoard(game.board)}\n\nGood game! Play again: tictactoe`
        }, { quoted: message });
        activeGames.delete(chatId);
        return;
    }

    // Continue game
    await client.sendMessage(chatId, {
        text: `🎮 *Your Turn!* ❌\n\n${displayBoard(game.board)}\n\nMake your move: tictactoe [1-9]`
    }, { quoted: message });
}

function getBotMove(board) {
    // Simple AI: Try to win, then block, then random
    const availableMoves = board.map((cell, index) => cell !== '❌' && cell !== '⭕' ? index : -1).filter(index => index !== -1);
    
    // Try to win
    for (const move of availableMoves) {
        const testBoard = [...board];
        testBoard[move] = '⭕';
        if (checkWinner(testBoard, '⭕')) return move;
    }
    
    // Block player
    for (const move of availableMoves) {
        const testBoard = [...board];
        testBoard[move] = '❌';
        if (checkWinner(testBoard, '❌')) return move;
    }
    
    // Prefer center, then corners, then edges
    const center = 4;
    if (availableMoves.includes(center)) return center;
    
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(corner => availableMoves.includes(corner));
    if (availableCorners.length > 0) return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    
    // Random move
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function displayBoard(board) {
    return `
${board[0]} ${board[1]} ${board[2]}
${board[3]} ${board[4]} ${board[5]}
${board[6]} ${board[7]} ${board[8]}
    `.trim();
}

function checkWinner(board, player) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];
    
    return winPatterns.some(pattern => 
        pattern.every(index => board[index] === player)
    );
}

function isBoardFull(board) {
    return board.every(cell => cell === '❌' || cell === '⭕');
}