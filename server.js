var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/index.html');
});

io.on('connection', function(socket){
  socket.emit("Startup", socket.id)
  socket.on("JoinRoom", function(data){
    var Room = data.Room
    var Username = data.Username
    console.log(Room)
    if (Room == "") {
      socket.emit("senderror", "Room is invalid")
    } else if (Username == "") {
      socket.emit("senderror", "Username is invalid")
    } else if (Room == null) {
      socket.emit("senderror", "Room is invalid")
    } else if (Username == null) {
      socket.emit("senderror", "Username is invalid")
    } else {
      socket.Username = Username
      socket.join(Room)
      socket.RoomName = Room
      var out = {
        Username: Username,
        Room: Room
      }
      socket.emit("RoomStatus", out)
    }
  })
  socket.on("SendMessage", function(msg){
    console.log("Message recived")
    var Username = socket.Username
    var Room = socket.RoomName
    var out = {
      Username: Username,
      Message: msg
    }
    console.log(Room)
    if (msg == ""){
      socket.emit("senderror", "Invalid message")
    } else if (Room == undefined) {
      socket.emit("senderror", "Join a room")
    } else {
      io.in(Room).emit('Messager', out);
    }
  })
  socket.on("SendPM", function(data){
    if (socket.Username == undefined) {
      var out = {
        senderID: socket.id,
        message: data.Message
      }
    } else {
      var out = {
        sender: socket.Username,
        senderID: socket.id,
        message: data.Message
      }
    }
    io.to(data.UserID).emit('PMsending', out);
  })
  socket.on("GetInfo", function(data){
    var out = {
      Username: socket.Username,
      Room: socket.RoomName,
      ID: socket.id
    }
    socket.emit("InfoGet", out)
  })
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});