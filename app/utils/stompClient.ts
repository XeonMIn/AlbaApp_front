// app/utils/stompClient.ts
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";

/** ===== 안전한 env ===== */
const ENV: Record<string, string | undefined> =
    (globalThis as any)?.process?.env ?? {};

/** ===== WS URL 조립 (http→ws 보정) ===== */
const RAW_BASE =
    ENV.EXPO_PUBLIC_WS_BASE_URL ??
    ENV.EXPO_PUBLIC_API_BASE_URL ??
    "http://10.0.2.2:8081";

const WS_BASE = RAW_BASE
    .replace(/^https:\/\//i, "wss://")
    .replace(/^http:\/\//i, "ws://")
    .replace(/\/+$/, "");

const ENDPOINT = "/ws/chat"; // 백엔드와 통일

let client: Client | null = null;
let connecting: Promise<void> | null = null;

type Unsub = () => void;
export type Unsubscribe = Unsub;

type ResubRecord = {
    destination: string;
    callback: (m: IMessage) => void;
    activeSub?: StompSubscription;
};
const resubs = new Map<string, ResubRecord>();

type PendingMsg = { destination: string; body: any; headers: Record<string, string> };
const pendingQueue: PendingMsg[] = [];

const rid = () => Math.random().toString(36).slice(2, 10);

function buildWsUrl(token?: string) {
    if (!token) return `${WS_BASE}${ENDPOINT}`;
    return `${WS_BASE}${ENDPOINT}?token=${encodeURIComponent(token)}`;
}

/** ===== 연결 ===== */
export async function connectStomp(token?: string): Promise<void> {
    if (client?.active) return;
    if (connecting) { await connecting; return; }

    const WS_URL = buildWsUrl(token);
    console.log("[STOMP] connect to:", WS_URL);

    client = new Client({
        // RN에서는 factory로 직접 소켓 생성 (프로토콜 배열 필수!)
        webSocketFactory: () =>
            new WebSocket(WS_URL, ["v10.stomp", "v11.stomp", "v12.stomp"]),

        // STOMP CONNECT 헤더에도 Authorization 넣어 둔다
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},

        // 하트비트/재연결
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,

        // **핵심**: NULL 바이트 보존을 위해 바이너리 프레임 사용
        forceBinaryWSFrames: true,
        splitLargeFrames: false,

        // 디버그 로그
        debug: (s) => console.log("[STOMP]", s),
    });

    connecting = new Promise<void>((resolve) => {
        client!.onConnect = () => {
            console.log("[STOMP] connected");

            // (재)구독 복구
            for (const [id, rec] of resubs) {
                try { rec.activeSub?.unsubscribe(); } catch {}
                rec.activeSub = client!.subscribe(rec.destination, rec.callback);
                console.log("[STOMP] resubscribed:", rec.destination, id);
            }

            // 대기중 발행 flush
            while (pendingQueue.length) {
                const p = pendingQueue.shift()!;
                try {
                    client!.publish({
                        destination: p.destination,
                        body: JSON.stringify(p.body),
                        headers: p.headers,
                    });
                } catch (e) {
                    console.warn("[STOMP] flush publish failed:", e);
                    pendingQueue.unshift(p);
                    break;
                }
            }

            resolve();
        };

        client!.onStompError = (f) => {
            console.error("[STOMP][BROKER ERROR]", f.headers?.["message"], f.body ?? "");
        };

        client!.onWebSocketClose = (e) => {
            console.log("[STOMP] WS CLOSE:", e.code, e.reason ?? "");
        };

        client!.activate();

        // 20s 보호 타임아웃
        const watchdog = setTimeout(() => {
            if (!client!.connected) {
                console.log("[STOMP] Connection not established in 20000ms, closing socket");
                try { client!.deactivate(); } catch {}
            }
        }, 20000);

        const origOnConnect = client!.onConnect;
        client!.onConnect = (frame) => {
            clearTimeout(watchdog);
            origOnConnect?.(frame);
        };
    });

    try { await connecting; } finally { connecting = null; }
}

/** ===== 토픽 구독 ===== */
export function subscribeTopic(destination: string, callback: (m: IMessage) => void): Unsubscribe {
    const id = `${destination}::${rid()}`;
    const rec: ResubRecord = { destination, callback };
    resubs.set(id, rec);

    if (client?.connected) {
        rec.activeSub = client!.subscribe(destination, callback);
        console.log("[STOMP] subscribed:", destination, id);
    } else {
        console.log("[STOMP] will subscribe after connect:", destination);
    }

    return () => {
        const r = resubs.get(id);
        if (!r) return;
        try { r.activeSub?.unsubscribe(); console.log("[STOMP] unsubscribed:", destination, id); } catch {}
        resubs.delete(id);
    };
}

/** ===== 발행 (연결 전이면 큐) ===== */
export function publish(destination: string, body: any, headers: Record<string, string> = {}) {
    if (client?.connected) {
        client.publish({ destination, body: JSON.stringify(body), headers });
        return;
    }
    pendingQueue.push({ destination, body, headers });
    console.warn("[STOMP] queued (not connected):", destination);
}

/** ===== 종료 ===== */
export async function disconnectStomp(): Promise<void> {
    try { await client?.deactivate(); } catch {}
    client = null;
    connecting = null;
    console.log("[STOMP] deactivated");
}
