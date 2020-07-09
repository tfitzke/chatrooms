import os

from flask import Flask, session, render_template, request, redirect, url_for, jsonify
import requests
from flask_session import Session
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

Chatroomdict = {}
Users = {}


class User:
    def __init__(self, pName, pCurrentRoom=None):
        self.name = pName
        self.CurrentRoom = pCurrentRoom

    def writeMessage(self, pMessage):
        print("writeMessage", self.CurrentRoom)
        if self.CurrentRoom in Chatroomdict:
            # print("Username: ", self.name)
            msg = {"user": self.name, "message": pMessage}
            print("msg", msg, {"name": self.name, "msg": pMessage})
            Chatroomdict[self.CurrentRoom].addMessage(msg)

    def enterChatroom(self, pRoomName):
        self.CurrentRoom = pRoomName

    def __str__(self):
        return f"User: {self.name} ist in Chat {self.CurrentRoom}"


class Chatroom:
    def __init__(self, pName):
        self.name = pName
        self.messages = []

    def addMessage(self, pMessage):
        if len(self.messages) >= 100:
            del self.messages[0]
        print("addMessage()", pMessage)
        self.messages.append(pMessage)

    def __str__(self):
        return f"{self.name}"


@app.route("/")
def index():

    return render_template("index.html")


@app.route("/logout")
def logout():
    session.pop('user', None)
    return redirect(url_for('index'))


@app.route("/chat", methods=["GET", "POST"])
def chat():
    if request.method == "POST":
        name = request.form.get("name")
        # print(name)
        session["user"] = User(name)
    # print("Hier: ", session["username"])
    if 'user' in session:
        print(session["user"])

    return render_template('chat.html', name=session["user"].name, chatrooms=list(
        Chatroomdict.keys()))

# @app.route("/<chatroom>")
# def enterChatroom():


@ socketio.on("create chat")
def createChat(data):
    chatName = data["chatName"]
    print("whoop", chatName, type(chatName), chatName not in Chatroomdict)
    if chatName != "0" and chatName not in Chatroomdict:
        Chatroomdict[chatName] = Chatroom(chatName)
        print(f"Chatroom {chatName} was added")
    else:
        print(list(
            Chatroomdict.keys()))
        print(f"{chatName} exists already")
    emit("new chat", {"chatrooms": list(
        Chatroomdict.keys())}, broadcast=True)


@ socketio.on("enter chat")
def enterChat(data):
    session["chatName"] = data["clickedChat"]
    session["user"].enterChatroom(data["clickedChat"])
    activeChat = Chatroomdict[session["chatName"]]
    print("messages", activeChat.messages)
    emit("init messages", {"initMessages": activeChat.messages})


@ socketio.on("send message")
def sendMessage(data):
    decoded_msg = data["msg"].encode("iso-8859-1").decode("utf-8")
    session["user"].writeMessage(decoded_msg)

    activeChat = Chatroomdict[session["chatName"]]
    print("messages", activeChat.messages)
    emit("init messages", {
         "initMessages": activeChat.messages}, broadcast=True)
    # darf nur für den korrekten Chatroom announced werden
    # emit("announce message", {
    #      "msg": {"user": session["user"].name, "message": decoded_msg}}, broadcast=True)
