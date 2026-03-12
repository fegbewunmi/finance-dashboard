import { useEffect, useRef, useCallback, useState } from "react";
import { createFinnhubSocket } from "../services/finnhub";
import type { WebSocketMessage } from "../types";

interface PriceMap {
  [ticker: string]: number;
}

export const useWebSocket = (tickers: string[]) => {
  const [prices, setPrices] = useState<PriceMap>({});
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const subscribe = useCallback(
    (socket: WebSocket) => {
      if (socket.readyState !== WebSocket.OPEN) return;
      tickers.forEach((ticker) => {
        socket.send(JSON.stringify({ type: "subscribe", symbol: ticker }));
      });
    },
    [tickers],
  );

  const connect = useCallback(() => {
    const socket = createFinnhubSocket();
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
      setConnected(true);
      subscribe(socket);
    };

    socket.onmessage = (event) => {
      const msg: WebSocketMessage = JSON.parse(event.data);
      if (msg.type !== "trade" || !msg.data) return;

      setPrices((prev) => {
        const next = { ...prev };
        msg.data!.forEach((trade) => {
          next[trade.s] = trade.p;
        });
        return next;
      });
    };

    socket.onclose = () => {
      console.log("WebSocket closed, reconnecting in 3s...");
      setConnected(false);
      reconnectTimer.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      socket.close();
    };
  }, [subscribe]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (socketRef.current) {
        if (socketRef.current.readyState === WebSocket.OPEN) {
          tickers.forEach((ticker) => {
            socketRef.current?.send(
              JSON.stringify({ type: "unsubscribe", symbol: ticker }),
            );
          });
        }
        socketRef.current.close();
      }
    };
  }, [connect]);

  return { prices, connected };
};
