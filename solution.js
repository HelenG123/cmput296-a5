/* ASSIGNMENT 4

Name: Helen Gezahegn
Collaborators: Katherine Patenio

License: 
    <solution.js>  Copyright (C) <2018> <Helen Gezahegn>
    This program comes with ABSOLUTELY NO WARRANTY; for details type `show w'.
    This is free software, and you are welcome to redistribute it
    under certain conditions; type `show c' for details.

*/

/************************************************************************/
// Note: The Gambler object is created in gambling.html
class Gambler {
    constructor(url, token) {
        // Initialize instance attributes
        this.url = url;
        this.token = token;
        this.money = null;
        this.status = null; 

        // To be used in fetch requests
        var that = this;

        // PART OF BONUS MARK: To animate the result
        var styleElement = document.createElement("style");
        document.head.appendChild(styleElement);
        // Source: https://css-tricks.com/snippets/css/typewriter-effect/ 
        this.animate = "\
            output[name='result'] {\
                overflow: hidden; /* Ensures the content is not revealed until the animation */\
                border-right: .15em solid orange; /* The typwriter cursor */\
                white-space: nowrap; /* Keeps the content on a single line */\
                margin: 0 auto; /* Gives that scrolling effect as the typing happens */\
                letter-spacing: .15em; /* Adjust as needed */\
                animation: \
                typing 3.5s steps(30, end),\
                blink-caret .5s step-end infinite;\
            }\
            \
            /* The typing effect */\
            @keyframes typing {\
                from { width: 0 }\
                to { width: 100% }\
            }\
            \
            /* The typewriter cursor effect */\
            @keyframes blink-caret {\
                from, to { border-color: transparent }\
                50% { border-color: orange; }\
            }"
    
        // Retrieve previous session if it exists
        if (localStorage.getItem("session") != null) {
            this.session = localStorage.getItem("session");

            // POST Request 1
            var formData = new FormData();
            var that = this;
            formData.append("token", this.token);
            // REQUIREMENT 7
            fetch(this.url + this.session + "/", {
                method: 'POST',
                body: formData, 
            })
            
            .then(function(response) {
                // Return json of response
                return response.json()
            })

            // Retrieve previous's sessions money, game state, 
            // and change HTML
            .then(function(response) {
                that.money = response.money;
                // Update the page's HTML
                document.getElementsByName('money')[0].innerHTML = that.money;
                document.getElementsByName('session')[0].innerHTML = that.session;

                if (response.game) {
                    that.gameState = response.game;
                    that.allButtonsOn();
                }
                else {
                    that.lastGame = response.last_game;
                    that.allButtonsOff(response);
                }
            })
        };


    // REQUIREMENT 2
        fetch("https://pizza.cs.ualberta.ca/296/") 
        .then(function(response) {
        // Update the Status on the website using the up tag from the HTML
            status = response.statusText;
            var statusInHTML = document.getElementsByName('up');
            statusInHTML[0].innerHTML = status;
            return response.text().then(function(myJson) {
                // Print hello message from the server
                console.log(myJson);
            })
        })
    
        .catch(function(error) {
            console.log("Error!")
        });
    
    // REQUIREMENT 3
        // If there is no previous session 
        if (localStorage.getItem("session") == null) {
            var formData = new FormData();
            var that = this;
            formData.append("token", this.token)
            fetch("https://pizza.cs.ualberta.ca/296/sit", {
                method: 'POST', 
                body: formData,      
            })
            .then(function(response) {
                return response.json()
            })

            .then(function(response) {
                that.session = response.session;
                that.money = response.money;
                localStorage.setItem("session", that.session);

                // Change the html to the session 
                document.getElementsByName('money')[0].innerHTML = that.money;
                document.getElementsByName('session')[0].innerHTML = that.session;

            })

            .catch(function(error) {
                console.log("Error!")
            })

        }
    
        // Set the initial state of the game.
        // Make all the buttons unclickable except the 'bet' button. 
        this.initialGameState();
    
    
    }
    
    lastRound2(gameState, typeOfGame) {    
        // Set, update, and maintain the money
        // on display and in the game's current session
        this.money = this.money + gameState.won; 
        gameState.money = this.money;

        // For the dealer: Replace the facecards and ace with its appropriate letter.
        // Use a for loop to reassign each value.
        var dealersHand = gameState.dealer_hand; 
        if (dealersHand.length > 1) {
            document.getElementsByName('surrender')[0].disabled = true;     
        }
        for (var i = 0; i < dealersHand.length; i++) {
            if (dealersHand[i] == 1) {
                dealersHand[i] = "A";
            }
            if (dealersHand[i] == 11) {
                dealersHand[i] = "J";
            }
            if (dealersHand[i] == 12) {
                dealersHand[i] = "Q";
            }
            if (dealersHand[i] == 13) {
                dealersHand[i] = "K";
            }
        }

        // For the player: Replace the facecards and ace with its appropriate letter
        var playersHand = gameState.player_hand;
        for (var i = 0; i < playersHand.length; i++) {
            if (playersHand[i] == 1) {
                playersHand[i] = "A";
            }
            if (playersHand[i] == 11) {
                playersHand[i] = "J";
            }
            if (playersHand[i] == 12) {
                playersHand[i] = "Q";
            }
            if (playersHand[i] == 13) {
                playersHand[i] = "K";
            }
        }

        // Otherwise, it would print out the current game state twice
        // and doesn't print when typeOfGame is lastGame. 
        if (typeOfGame == "last_game") {
            console.log("Money: "+ this.money);
            console.log("Bet: "+ gameState.bet);
            console.log("Dealer's Hand: " + dealersHand);
            console.log("Your Cards: " + playersHand);
        }

        // Replace the HTML on the page with the current money, and 
        // appropriate facecard and ace letters.
        document.getElementsByName('money')[0].innerHTML = this.money;     
        document.getElementsByName('dealer_hand')[0].innerHTML = dealersHand;
        document.getElementsByName('player_hand')[0].innerHTML = playersHand;

        // Replace the HTML on the bottom part of the page for result and
        // 'you made'. 
        this.allButtonsOff();

        // Animate
        document.getElementsByName('result')[0].innerHTML = gameState.result;
        this.bonusAnimation(this.animate);
        document.getElementsByName('last_bet')[0].innerHTML = gameState.bet;
        document.getElementsByName('won')[0].innerHTML = gameState.won; 
    }

    bonusAnimation(elementStyle) {
        // Locate the style tag on the HTML file.
        // Alter the text within the style tag.
        var style = document.getElementsByTagName('style')[0];
        var animation = document.createElement('style');
        animation.innerHTML = elementStyle;

        // Replace
        style.parentNode.insertBefore(animation, style);
        style.parentNode.removeChild(style);
    }
    sameRound2(gameState, typeOfGame) {
         // When the round is ending, print the current game state to the 
        // console and upadte the HTML on the web page. 

        document.getElementsByName('result')[0].innerHTML = " ";
        document.getElementsByName('won')[0].innerHTML = " ";
        // For the dealer: Replace the facecards and ace with its appropriate letter.
        // Use a for loop to reassign each value. 
        var dealersHand = gameState.dealer_hand; 
        if (dealersHand.length > 1) {
            document.getElementsByName('surrender')[0].disabled = true;     
        }
        for (var i = 0; i < dealersHand.length; i++) {
            if (dealersHand[i] == 1) {
                dealersHand[i] = "A";
            }
            if (dealersHand[i] == 11) {
                dealersHand[i] = "J";
            }
            if (dealersHand[i] == 12) {
                dealersHand[i] = "Q";
            }
            if (dealersHand[i] == 13) {
                dealersHand[i] = "K";
            }
        }

        // For the player: Replace the facecards and ace with its appropriate letter
        var playersHand = gameState.player_hand;
        for (var i = 0; i < playersHand.length; i++) {
            if (playersHand[i] == 1) {
                playersHand[i] = "A";
            }
            if (playersHand[i] == 11) {
                playersHand[i] = "J";
            }
            if (playersHand[i] == 12) {
                playersHand[i] = "Q";
            }
            if (playersHand[i] == 13) {
                playersHand[i] = "K";
            }
        }
        // console.log("Your Cards: " + playersHand);
         
        // Replace the HTML on the page with the current money, and 
        // appropriate facecard and ace letters.
        document.getElementsByName('money')[0].innerHTML = this.money;     
        document.getElementsByName('dealer_hand')[0].innerHTML = dealersHand;
        document.getElementsByName('player_hand')[0].innerHTML = playersHand;

        // Otherwise, it would print out the current game state twice
        // and doesn't print when typeOfGame is gameState. 
        if (typeOfGame == "game") {
            console.log("Money: "+ this.money);
            console.log("Bet: "+ gameState.bet);
            console.log("Dealer's Hand: " + dealersHand);
            console.log("Your Cards: " + playersHand);
        }

        this.allButtonsOn();
    }
    // REQUIREMENT 4
    bet(amount) {
        // Make the amount a positive number so we don't 
        // get the 400 Bad Request Error
        amount = Math.abs(amount);
        // Update the 'you bet' on the bottom of the page
        document.getElementsByName('last_bet')[0].innerText = amount;
        document.getElementsByName('result')[0].innerHTML = " ";
        document.getElementsByName('won')[0].innerHTML = " ";
        // Make 'bet' unclickable and all the other actions clickable.
        this.allButtonsOn();
        var that = this;

        // If we are dealing with a previous session 
        if (this.lastGame) {
            this.lastRound2(this.lastGame, "lastGame")
        }
        else if (this.gameState) {
            this.sameRound2(this.gameState, "gameState")
        }

        var formData = new FormData();
        formData.append("token", this.token)
        formData.append('amount', amount)
        fetch(this.url + this.session + "/bet", {
            method: 'POST', 
            body: formData,      
        })
        
        // Retrieve the response
        .then(function(response) {
            // Update the Status on the website using the up tag from the HTML
            that.status = response.statusText;
            document.getElementsByName('up')[0].innerHTML = that.status;
            return response.json()
        })
        
        // If we are not dealing with a current session
        .then(function(response) {
            if (response.last_game) {
                // When the round is over
                that.lastRound2(response.last_game, "last_game")
            }
            else if (response.game) {
                // When the round is still playing
                that.sameRound2(response.game, "game")
            }
        })
        .catch(function(error) {
            console.log("Error with 'Bet'!")
        });
    }
    
    
    stand() {
        var formData = new FormData();
        formData.append("token", this.token) 
        var that = this;

        // If we are dealing with a previous session 
        if (this.lastGame) {
            this.lastRound2(this.lastGame, "lastGame")
        }
        else if (this.gameState) {
            this.sameRound2(this.gameState, "gameState")
        }

        fetch(this.url + this.session + "/stand", {
            method: 'POST', 
            body: formData,      
        })

        // Retrieve the response
        .then(function(response) {
            // Update the Status on the website using the up tag from the HTML
            status = response.statusText;
            var statusInHTML = document.getElementsByName('up');
            statusInHTML[0].innerHTML = status;
            return response.json()
        })
        // If we are not dealing with a previous session
        .then(function(response) {
            // console.log(response);
            if (response.last_game) {
                // When the round is over
                that.lastRound2(response.last_game, "last_game");
            }
            else if (response.game) {
                // When the round is still playing
                that.sameRound2(response.game, "game")
            }
        })
        .catch(function(error) {
            console.log("Error with 'Stand'!")
        });

    }

    hit() {
        // If we are dealing with a previous session 
        if (this.lastGame) {
            this.lastRound2(this.lastGame, "lastGame")
        }
        else if (this.gameState) {
            this.sameRound2(this.gameState, "gameState")
        }

        var formData = new FormData();
        var that = this;
        formData.append("token", this.token)
        fetch(this.url + this.session + "/hit", {
            method: 'POST', 
            body: formData,      
        })

        // Retrieve the response
        .then(function(response) {
            // Update the Status on the website using the up tag from the HTML
            status = response.statusText;
            var statusInHTML = document.getElementsByName('up');
            statusInHTML[0].innerHTML = status;
            return response.json()
        })

        // If we are not dealing with a previous session
        .then(function(response) {
            if (response.last_game) {
                that.lastRound2(response.last_game, "last_game")
            }
            else if (response.game) {
                that.sameRound2(response.game, "game")
            }
            // PART OF REQUIREMENT 6: 
            // You can't surrender after hitting
            document.getElementsByName('surrender')[0].disabled = true;
        
        })
        
        .catch(function(error) {
            console.log("Error with 'Hit'!")
        });

    }

    double_down() {

        // If we are dealing with a previous session 
        if (this.lastGame) {
            this.lastRound2(this.lastGame, "lastGame")
        }
        else if (this.gameState) {
            this.sameRound2(this.gameState, "gameState")
        }

        var formData = new FormData();
        var that = this;
        formData.append("token", this.token);
        fetch(this.url + this.session + "/double_down", {
            method: 'POST', 
            body: formData,      
        })

        // Retrieve the response
        .then(function(response) {
            // Update the Status on the website using the up tag from the HTML
            status = response.statusText;
            var statusInHTML = document.getElementsByName('up');
            statusInHTML[0].innerHTML = status;
            return response.json()
        })

        // If we are not dealing with a previous session
        .then(function(response) {
            // that.money = that.money - (that.money - response.money)
            if (response.last_game) {
                that.lastRound2(response.last_game, "last_game")
            }
            else if (response.game) {
                that.sameRound2(response.game, "game")
            }
        })
        .catch(function(error) {
            console.log("Error with 'Double Down'!")
        });
        
    }

    surrender() {
        // Get the information for the POST request
        var formData = new FormData(); 
        var that = this;
        formData.append("token", this.token)
        fetch(this.url + this.session + "/surrender", {
            method: 'POST', 
            body: formData,      
        })

        // Retrieve the response
        .then(function(response) {
            // Update the Status on the website using the up tag from the HTML
            status = response.statusText;
            var statusInHTML = document.getElementsByName('up');
            statusInHTML[0].innerHTML = status;
            return response.json()
        })

        .then(function(response) {
            if (response.last_game) {
                that.lastRound2(response.last_game, "last_game")
            }
            else if (response.game) {
                that.sameRound2(response.game, "game")
            }
        })

        .catch(function(error) {
            console.log("Error with 'Surrender'!")
        });

    }

    initialGameState() {
        // Set the initial state of the game.
        
        // PART OF REQUIREMENT 6: 
        // You can't stand/hit/double down/surrender when there is NO game in progress.
        document.getElementsByName('stand')[0].disabled = true;     
        document.getElementsByName('hit')[0].disabled = true;
        document.getElementsByName('double_down')[0].disabled = true;
        document.getElementsByName('surrender')[0].disabled = true;
    }

    allButtonsOff(response) {
        // After one of the four actions has been selected (not including bet), 
        // make all the buttons unclickable. Only bet can be used.
        // console.log(response);
        // if (response.last_game) {

        document.getElementsByName('stand')[0].disabled = true;     
        document.getElementsByName('hit')[0].disabled = true;
        document.getElementsByName('double_down')[0].disabled = true;
        document.getElementsByName('surrender')[0].disabled = true;  
        
        // Make bet clickable/usable. 
        document.getElementsByName('betButton')[0].disabled = false;
        document.getElementsByName('bet')[0].disabled = false;
        


    }

    allButtonsOn() {
        // After bet has been selected, make all the othe buttons clickable.
        // Make bet unclickable. 
        
        document.getElementsByName('stand')[0].disabled = false;     
        document.getElementsByName('hit')[0].disabled = false;
        document.getElementsByName('double_down')[0].disabled = false;
        document.getElementsByName('surrender')[0].disabled = false;

        // You can't bet when there's a game in progress. 
        document.getElementsByName('betButton')[0].disabled = true;
        //  You can't change your bet when there's a game in progress.
        document.getElementsByName('bet')[0].disabled = true;
    }


}


