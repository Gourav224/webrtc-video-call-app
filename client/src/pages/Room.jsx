import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../providers/SocketProvider";
import { usePeer } from "../providers/Peer";
import ReactPlayer from "react-player";

const Room = () => {
	const { socket } = useSocket();
	const {
		peer,
		createOffer,
		createAnswers,
		setRemoteAns,
		sendStream,
		remoteStream,
	} = usePeer();
	const [myStream, setmyStream] = useState(null);
	const [remoteEmailId, setremoteEmailId] = useState("");
	const handleNewUserJoined = useCallback(
		async (data) => {
			console.log(data);
			const { emailId } = data;
			console.log("New user joined:", emailId);
			const offer = await createOffer();
			console.log("new user joined", offer);
			socket.emit("call-user", { emailId, offer });
			setremoteEmailId(emailId);
		},
		[createOffer, socket],
	);
	const handleIncomingCall = useCallback(
		async (data) => {
			const { from, offer } = data;
			console.log("incoming call", from, offer);
			setremoteEmailId(from);
			const ans = await createAnswers(offer);
			socket.emit("call-accepted", { emailId: from, ans });
		},
		[createAnswers, socket],
	);
	const handleCallAccepted = useCallback(
		async (data) => {
			const { ans } = data;
			await setRemoteAns(ans);
			console.log("call accepted", ans);
		},
		[setRemoteAns],
	);

	useEffect(() => {
		socket.on("user-joined", handleNewUserJoined);
		socket.on("incoming-call", handleIncomingCall);
		socket.on("call-accepted", handleCallAccepted);

		return () => {
			socket.off("user-joined", handleNewUserJoined);
			socket.off("incoming-call", handleIncomingCall);
			socket.off("call-accepted", handleCallAccepted);
		};
	}, [handleCallAccepted, handleIncomingCall, handleNewUserJoined, socket]);

	const getUserMediaStream = useCallback(async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: true,
			});
			sendStream(stream);
			setmyStream(stream);
			console.log(stream);
		} catch (error) {
			console.log(error);
		}
	}, []);

	const handleNegotiationNeeded = useCallback(async () => {
		console.log("negotiation needed");
		const offer = peer.localDescription;
		console.log(offer);
		console.log(remoteEmailId);
		socket.emit("call-user", { emailId: remoteEmailId, offer });
	}, [peer.localDescription, remoteEmailId, socket]);

	useEffect(() => {
		peer.addEventListener("negotiationneeded", handleNegotiationNeeded);

		return () => {
			peer.removeEventListener(
				"negotiationneeded",
				handleNegotiationNeeded,
			);
		};
	}, [handleNegotiationNeeded, peer]);

	useEffect(() => {
		getUserMediaStream();
	}, [getUserMediaStream]);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
			<h1 className="text-3xl text-white mb-8">Welcome to the Room!</h1>

			<h4 className="text-white">
				You are connected with {remoteEmailId}
			</h4>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
				<div className="flex flex-col items-center">
					<h2 className="text-lg text-white mb-2">Your Video</h2>
					<ReactPlayer
						url={myStream}
						width="100%"
						height="300px"
						playing
						muted
					/>
				</div>
				<div className="flex flex-col items-center">
					<h2 className="text-lg text-white mb-2">Remote Video</h2>
					<ReactPlayer
						url={remoteStream}
						width="100%"
						height="300px"
						playing
						muted
					/>
				</div>
			</div>
			<button
				onClick={() => {
					if (myStream) {
						sendStream(myStream);
					} else {
						console.error("No local stream available to send.");
					}
				}}
				className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md mb-10  hover:bg-blue-600"
			>
				Send My Video
			</button>
		</div>
	);
};

export default Room;
