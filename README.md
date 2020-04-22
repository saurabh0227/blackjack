# Command to start the server
npm start

# Server is running on port 8080
You can change the port in app.js file

# used babel to access es6 features of nodejs

# Folder structure
src -> api -> card (model, route and controller)
src -> api -> player (model, route and controller)
src -> api -> round (model, route and controller)
src -> api -> round_history (model, route and controller)
src -> api -> services -> response -> index.js (Success function that returns response to the client)

# Endpoints
For card: 
1: /card/create -> To add new card in Card collection -> POST method
2: /card/list -> To fetch the list of cards from Card collection -> GET method

For player:
1: /player/register-player -> To add new player in Player collection -> POST method
2: /player/login -> To login with registered player from Player collection  -> POST method
3: /player/list -> To fetch the list of players from Player collection -> GET method
4: /player/history?view=history&playedId=ObjectId("player") -> To fetch the list of players from RoundHistory collection -> GET method

For round:
1: /round/create -> To add new round in Round collection -> POST method
2: /round/list -> To fetch the list of rounds from Round collection -> GET method

For round_history:
1: /round-history/create -> To add new round history in RoundHistory collection -> POST method
2: /round-history/list -> To fetch the list of round history from RoundHistory collection -> GET method
3: /round-history/delete/:id -> To delete a document from RoundHistory collection -> DELETE method
4: /round-history/distribute-card?roundId=ObjectId("round")&playerId=ObjectId("player") -> To distribute card to each player w.r.t round and player id -> method GET
5: /round-history/throw-card?playerId=ObjectId("player") -> To initiate the card game by throwing the card w.r.t player -> method GET
6: /round-history/update-winner-count?roundId=ObjectId("round") -> To update to win count for that for the winning player -> method GET
7: /round-history/show-winner-per-round?roundId=ObjectId("round") -> To show the winner for that particular round -> method GET

# used bcryptjs to create hashed password

# used express-validator to validate the input data in body

# used local database