import mongoose from "mongoose";
import User from "../../model/user";
import {
  randomStringGenerator,
  sendNotificationToSingleUser,
} from "../common/helper";
import Chat from "../../model/chat";
import { NOTIFICATION_TYPE } from "../common/constants/constant";
const ObjectId = mongoose.Types.ObjectId;
const io = require("socket.io")();
const DataStore = require("data-store");
const clientStore = new DataStore({
  path: "src/chat/store/data.json",
});
const connectedUserStore = new DataStore({
  path: "src/chat/store/connected-user.json",
});

const rooms = clientStore.get("rooms", []);

io.on("connection", async (socket) => {
  let disRoomId = "";
  let disUserId = "";
  socket.on("createRoom", async (data) => {
    try {
      const { senderId, receiverId } = data;

      if (!senderId || !receiverId) {
        console.log("in disconnect");
        console.log(`${socket.id} is disconnected`);
        return socket.disconnect();
      }

      const usersExist = await User.find({
        _id: {
          $in: [senderId, receiverId],
        },
      });

      if (usersExist.length != 2) {
        console.log("in disconnect");
        console.log(`${socket.id} is disconnected`);
        return socket.disconnect();
      }

      let roomId = "";
      const roomExist = rooms.filter((room) => {
        if (room.senderId == senderId && room.receiverId == receiverId) {
          roomId = room.roomId;
          return room;
        } else if (room.senderId == receiverId && room.receiverId == senderId) {
          roomId = room.roomId;
          return room;
        }
      });

      if (!roomExist.length) {
        roomId = randomStringGenerator(10);
        rooms.push({ senderId, receiverId, roomId });
        clientStore.set({ rooms });
      }

      let roomConnectedData = connectedUserStore.get(roomId);

      if (!roomConnectedData || !roomConnectedData.length) {
        roomConnectedData = [];
      }

      const userConnectedExist = roomConnectedData.filter((data) => {
        if (data.userId == senderId) {
          return data;
        }
      });

      if (!userConnectedExist.length) {
        roomConnectedData.push({
          userId: senderId,
          socketId: socket.id,
        });

        connectedUserStore.set(roomId, roomConnectedData);
      }

      socket.join(roomId);
      disRoomId = roomId;
      disUserId = senderId;
      await Chat.updateMany(
        { roomId, receiverId: senderId, seenAt: null },
        { seenAt: new Date() }
      );
      socket.emit("roomConnected", roomId);
    } catch (error) {
      console.log("in disconnect");
      console.log(`${socket.id} is disconnected`);
      return socket.disconnect();
    }
  });

  socket.on("sendMessage", async (data) => {
    let roomConnectedData = connectedUserStore.get(data.roomId);
    if (!roomConnectedData) {
      roomConnectedData = [];
    }
    const userConnected = roomConnectedData.filter(
      (userData) => userData.userId == data.receiverId
    );

    await Chat.updateMany(
      { roomId: data.roomId, receiverId: data.senderId, seenAt: null },
      { seenAt: new Date() }
    );

    if (!userConnected.length) {
      const senderData = await User.findOne({ _id: data.senderId });
      if (senderData) {
        await sendNotificationToSingleUser(
          data.receiverId,
          {
            title: `New message from ${senderData.name}.`,
            body: `New message from ${senderData.name}.`,
          },
          {
            userId: data.senderId.toString(),
            roomId: data.roomId.toString(),
            type: NOTIFICATION_TYPE.CHAT,
          }
        );
      }
    }

    data.type = data.type ? data.type : 1;

    const message = await Chat.create(data);

    socket.broadcast.to(data.roomId).emit("newMessage", {
      messageId: message._id,
      roomId: data.roomId,
      receiverId: data.receiverId,
      senderId: data.senderId,
      message: data.message,
      name: data.name,
    });
  });

  socket.on("seenMessage", async (data) => {
    return await Chat.updateOne(
      { _id: data.messageId },
      { seenAt: new Date() }
    );
  });

  socket.on("disconnect", (data) => {
    let roomConnectedData = connectedUserStore.get(disRoomId);

    if (disRoomId && disUserId) {
      if (roomConnectedData.length) {
        roomConnectedData = roomConnectedData.filter(
          (data) => data.userId !== disUserId
        );

        connectedUserStore.set(
          disRoomId,
          roomConnectedData.length ? roomConnectedData : []
        );
      }
    }
    console.log("Socket disconnect");
  });
  // one to one chat
});

export default io;
