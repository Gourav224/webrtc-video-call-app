import { useState, useEffect } from "react";
import { useSocket } from "../providers/SocketProvider";
import { useNavigate } from "react-router-dom";

const Homepage = () => {
	const [email, setEmail] = useState("");
	const [roomCode, setRoomCode] = useState("");
	const [loading, setLoading] = useState(false);
	const { socket } = useSocket();
	const navigate = useNavigate();

	useEffect(() => {
		socket.on("join-success", (data) => {
            const { roomId } = data;
			setLoading(false); // Stop loading
			navigate(`/room/${roomId}`); // Redirect to the room
		});

		socket.on("join-failed", (message) => {
			alert(message); // Handle join failure
			setLoading(false); // Stop loading
		});

		return () => {
			socket.off("join-success");
			socket.off("join-failed");
		};
	}, [socket, navigate]);

	const handleSubmit = async (event) => {
		event.preventDefault();
		setLoading(true);
		console.log(
			"Joining room with email:",
			email,
			"and room code:",
			roomCode,
		);
		socket.emit("join-room", { emailId: email, roomId: roomCode });
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-900">
			<div className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-md">
				<h1 className="text-2xl font-bold mb-6 text-center text-white">
					Enter Room
				</h1>
				<form className="space-y-4" onSubmit={handleSubmit}>
					<div>
						<label
							htmlFor="email"
							className="block mb-1 font-medium text-gray-300"
						>
							Email
						</label>
						<input
							type="email"
							id="email"
							className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Enter your email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>
					<div>
						<label
							htmlFor="roomCode"
							className="block mb-1 font-medium text-gray-300"
						>
							Room Code
						</label>
						<input
							type="text"
							id="roomCode"
							className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Enter room code"
							required
							value={roomCode}
							onChange={(e) => setRoomCode(e.target.value)}
						/>
					</div>
					<button
						type="submit"
						className={`w-full py-2 px-4 ${
							loading ? "bg-gray-600" : "bg-blue-600"
						} text-white font-semibold rounded-md transition duration-300`}
						disabled={loading}
					>
						{loading ? "Loading..." : "Enter Room"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default Homepage;
