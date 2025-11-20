import { Client, IMessage, Versions } from "@stomp/stompjs";
import Constants from "expo-constants";

// RN 환경에서 WebSocket 클래스 안전 획득
const RNWebSocket: any =
    (global as any).WebSocket ||
    (global as any).window?.WebSocket ||
    (global as any).GLOBAL?.WebSocket ||
    (global as any).self?.WebSocket;

let client: Client | null = null;

function parseHostFromWsBase(wsBase: string): string {
    // ws://10.0.2.2:8081 -> 10.0.2.2:8081
    try {
        const u = new URL(wsBase.replace(/^ws/, "http"));
        return u.host || "localhost";
    } catch {
        return "localhost";
    }
}

function resolveBrokerUrl() {
    const extra = (Constants?.expoConfig as any)?.extra || {};
    const WS_BASE =
        process.env.EXPO_PUBLIC_WS_BASE_URL ||
        extra.WS_BASE_URL ||
        "ws://10.0.2.2:8081";

    let endpoint =
        process.env.EXPO_PUBLIC_STOMP_ENDPOINT ||
        extra.STOMP_ENDPOINT ||
        "/ws/chat"; // 순수 WS 엔드포인트

    // RN에서는 SockJS 엔드포인트 금지: 들어오면 강제 교체
    if (endpoint.includes("/stomp/chat")) {
        console.warn("[STOMP] '/stomp/chat'은 SockJS용입니다. RN에서는 '/ws/chat'로 강제 변경합니다.");
        endpoint = "/ws/chat";
    }

    const url = `${WS_BASE}${endpoint}`;
    console.log("[STOMP] brokerURL =", url, {
        env_ws: process.env.EXPO_PUBLIC_WS_BASE_URL,
        env_endpoint: process.env.EXPO_PUBLIC_STOMP_ENDPOINT,
        extra,
    });
    return { url, hostHeader: parseHostFromWsBase(WS_BASE) };
}

export function getStompClient(token?: string) {
    const { url: brokerURL, hostHeader } = resolveBrokerUrl();

    if (client && client.active) return client;

    client = new Client({
        // 연결 대상
        brokerURL,

        // STOMP 버전 협상 (1.2 우선)
        stompVersions: new Versions(["1.2", "1.1"]),

        // CONNECT 헤더
        connectHeaders: {
            host: hostHeader, // ★ 일부 환경 필수
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },

        // ★ 핵심: RN WebSocket 생성 시 STOMP 서브프로토콜 명시 (멀티 프로토콜 제시)
        webSocketFactory: () => new RNWebSocket(brokerURL, ["v12.stomp", "v11.stomp", "v10.stomp"]),

        // RN 안정화 옵션
        forceBinaryWSFrames: true,
        appendMissingNULLonIncoming: true,

        // 디버그/재접속/하트비트
        debug: (str) => console.log("[STOMP]", str),
        reconnectDelay: 4000,

        // 우선 하트비트 OFF로 연결만 확인 (성공 후 10000/10000으로 되돌리기)
        heartbeatIncoming: 0,
        heartbeatOutgoing: 0,
    });

    client.onStompError = (frame) => {
        console.log("[STOMP] Broker error:", frame.headers?.["message"]);
        console.log("[STOMP] Details:", frame.body);
    };
    client.onWebSocketClose = (evt) => console.log("[STOMP] closed", evt?.reason);
    client.onWebSocketError = (evt) => console.log("[STOMP] ws error", evt);
    client.onUnhandledFrame = (frame) => console.log("[STOMP] unhandled frame", frame);
    client.onUnhandledMessage = (msg) => console.log("[STOMP] unhandled message", msg);
    client.onUnhandledReceipt = (receiptId) => console.log("[STOMP] unhandled receipt", receiptId);

    return client;
}

export type Unsubscribe = () => void;

export function subscribeTopic(topic: string, onMessage: (msg: IMessage) => void): Unsubscribe {
    if (!client || !client.active) throw new Error("STOMP client not connected");
    const sub = client.subscribe(topic, onMessage);
    return () => sub.unsubscribe();
}

export function publish(destination: string, body: any, headers: Record<string, string> = {}) {
    if (!client || !client.active) throw new Error("STOMP client not connected");
    client.publish({
        destination,
        body: JSON.stringify(body),
        headers: { "content-type": "application/json", ...headers },
    });
}

export async function connectStomp(token?: string) {
    const c = getStompClient(token);
    if (c.active) return;

    return new Promise<void>((resolve, reject) => {
        c.onConnect = () => {
            // 연결되면 하트비트 원복을 원하면 여기서 옵션 갱신 가능 (필요시)
            // c.configure({ heartbeatIncoming: 10000, heartbeatOutgoing: 10000 });
            resolve();
        };
        try {
            c.activate();
        } catch (e) {
            reject(e);
        }
    });
}

export function disconnectStomp() {
    if (client && client.active) {
        client.deactivate();
    }
}
