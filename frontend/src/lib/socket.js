import { useEffect } from "react";
import io from "socket.io-client";

let socket = null;

export const useSocket = () => {
  useEffect(() => {
    if (!socket) {
      socket = io("http://localhost:5001", {
        query: {
          userId: localStorage.getItem("userId") || "",
        },
      });

      // socket.on("connect", () => {
      //   console.log("Connected to socket server");
      // });

      // socket.on("disconnect", () => {
      //   console.log("Disconnected from socket server");
      // });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  return socket;
};
