import express from "express";
import { Server } from "socket.io";

const app = express();
const io = new Server({
	cors: true,
});

app.use(express.json());

const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();

io.on("connection", (socket) => {
	console.log("A user connected");

	socket.on("join-room", (data) => {
		const { roomId, emailId } = data;
		console.log("join-room data:", data); // Added debug log
		emailToSocketMapping.set(emailId, socket.id);
		socketToEmailMapping.set(socket.id, emailId);
		socket.join(roomId);
		socket.emit("join-success", { roomId });

		socket.broadcast.to(roomId).emit("user-joined", { emailId });
	});
	socket.on("call-user", (data) => {
		const { emailId, offer } = data;
		const fromEmail = socketToEmailMapping.get(socket.id);
		const socketId = emailToSocketMapping.get(emailId);
		console.log({ emailId, offer, fromEmail, socketId });
		console.log("call-user data:", data); // Added debug log
		socket.to(socketId).emit("incoming-call", { from: fromEmail, offer });
	});

	socket.on("call-accepted", (data) => {
		const { emailId, ans } = data;
		const socketId = emailToSocketMapping.get(emailId);
		socket.to(socketId).emit("call-accepted", { ans });
	});

	socket.on("disconnect", () => {
		console.log("A user disconnected");
		for (const [email, socketId] of emailToSocketMapping.entries()) {
			if (socketId === socket.id) {
				emailToSocketMapping.delete(email);
				break;
			}
		}
	});
});

app.listen(8000, () => {
	console.log("Server is running on port http://localhost:8000");
});

io.listen(8001);
console.log("Socket server is running on port http://localhost:8001");
