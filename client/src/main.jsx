import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Homepage from "./pages/Homepage.jsx";
import Room from "./pages/Room.jsx"; // Import the Room component
import { SocketProvider } from "./providers/SocketProvider.jsx";
import { PeerProvider } from "./providers/Peer.jsx";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Homepage />,
	},
	{
		path: "/room/:roomId", // Define the route for the room
		element: <Room />,
	},
]);

createRoot(document.getElementById("root")).render(
	<SocketProvider>
		<PeerProvider>
			<RouterProvider router={router} />
		</PeerProvider>
	</SocketProvider>,
);
