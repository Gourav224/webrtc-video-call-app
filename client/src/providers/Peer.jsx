import { useCallback } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const PeerContext = createContext(null);

const usePeer = () => useContext(PeerContext);

export { usePeer };

export const PeerProvider = (props) => {
	const [remoteStream, setRemoteStream] = useState(null);

	const peer = useMemo(
		() =>
			new RTCPeerConnection({
				iceServers: [
					{
						urls: [
							"stun:stun.l.google.com:19302",
							"stun:global.stun.twilio.com:3478",
						],
						username: "test",
						credential: "test",
					},
				],
			}),
		[],
	);

	const createOffer = async () => {
		try {
			const offer = await peer.createOffer();
			await peer.setLocalDescription(offer);
			return offer;
		} catch (error) {
			console.error("Error creating offer:", error);
		}
	};

	const createAnswers = async (offer) => {
		try {
			await peer.setRemoteDescription(offer);
			const answer = await peer.createAnswer();
			await peer.setLocalDescription(answer);
			return answer;
		} catch (error) {
			console.error("Error creating answer:", error);
		}
	};

	const setRemoteAns = async (answer) => {
		try {
			await peer.setRemoteDescription(answer);
		} catch (error) {
			console.error("Error setting remote answer:", error);
		}
	};
	const sendStream = async (stream) => {
		const tracks = stream.getTracks();
		console.log(tracks);
		for (const track of tracks) {
			peer.addTrack(track, stream);
		}
	};
	const handleTrackEvent = useCallback((ev) => {
		console.log(ev);
		const streams = ev.streams;
		console.log("remote stream", streams);
		setRemoteStream(streams[0]);
	}, []);

	useEffect(() => {
		peer.addEventListener("track", handleTrackEvent);
		return () => {
			peer.removeEventListener("track", handleTrackEvent);
		};
	}, [handleTrackEvent, peer]);

	return (
		<PeerContext.Provider
			value={{
				peer,
				createOffer,
				createAnswers,
				setRemoteAns,
				sendStream,
				remoteStream,
			}}
		>
			{props.children}
		</PeerContext.Provider>
	);
};
