import { useEffect, useRef, useState, useCallback } from 'react';

interface UseWebSocketProps {
    url: string;
    enabled?: boolean;
    onMessage?: (data: any) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
}

export const useWebSocket = ({
    url,
    enabled = true,
    onMessage,
    onConnect,
    onDisconnect,
}: UseWebSocketProps) => {
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;
    const mountedRef = useRef(true);

    // Store callbacks in refs to avoid dependency issues
    const onMessageRef = useRef(onMessage);
    const onConnectRef = useRef(onConnect);
    const onDisconnectRef = useRef(onDisconnect);

    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        onConnectRef.current = onConnect;
    }, [onConnect]);

    useEffect(() => {
        onDisconnectRef.current = onDisconnect;
    }, [onDisconnect]);

    const connect = useCallback(() => {
        if (!enabled || !mountedRef.current) return;

        if (wsRef.current) {
            wsRef.current.close(1000, 'Reconnecting');
        }

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        try {
            console.log('Attempting WebSocket connection to:', url);
            wsRef.current = new WebSocket(url);

            wsRef.current.onopen = () => {
                if (!mountedRef.current) return;
                setIsConnected(true);
                reconnectAttempts.current = 0;
                onConnectRef.current?.();
                console.log('WebSocket connected:', url);
            };

            wsRef.current.onmessage = (event) => {
                if (!mountedRef.current) return;
                try {
                    const data = JSON.parse(event.data);
                    console.log('WebSocket message received:', data);
                    onMessageRef.current?.(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            wsRef.current.onclose = (event) => {
                if (!mountedRef.current) return;
                setIsConnected(false);
                onDisconnectRef.current?.();
                console.log(
                    'WebSocket disconnected:',
                    url,
                    'Code:',
                    event.code,
                    'Reason:',
                    event.reason
                );

                // Only auto-reconnect on unexpected closures
                if (
                    enabled &&
                    mountedRef.current &&
                    reconnectAttempts.current < maxReconnectAttempts &&
                    event.code !== 1000 && // Normal closure
                    event.code !== 1001 // Going away
                ) {
                    const delay = Math.min(
                        Math.pow(2, reconnectAttempts.current) * 1000,
                        10000
                    );
                    console.log(
                        `Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`
                    );

                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (mountedRef.current) {
                            reconnectAttempts.current++;
                            connect();
                        }
                    }, delay);
                }
            };

            wsRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        } catch (error) {
            console.error('Error creating WebSocket connection:', error);
        }
    }, [url, enabled]); // Only depend on url and enabled

    useEffect(() => {
        mountedRef.current = true;

        if (enabled) {
            connect();
        }

        return () => {
            mountedRef.current = false;
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
            if (wsRef.current) {
                wsRef.current.close(1000, 'Component unmounting');
                wsRef.current = null;
            }
        };
    }, [connect]);

    const sendMessage = useCallback((data: any) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket is not connected, cannot send message');
        }
    }, []);

    const disconnect = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close(1000, 'Manual disconnect');
        }
    }, []);

    return { isConnected, sendMessage, disconnect };
};
