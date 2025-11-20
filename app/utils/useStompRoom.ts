import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IMessage } from "@stomp/stompjs";
import { connectStomp, publish, subscribeTopic, Unsubscribe } from "@/app/utils/stompClient";
import { fetchChatHistory } from "@/api/chat";

/** 서버/클라 공통 메시지 포맷 */
export type ChatMsg = {
    roomId: string;   // workplaceId 문자열
    sender: string;
    content: string;
    sentAt: number;   // epoch millis
    _localId?: string; // 낙관적 렌더링 중복 방지 키
};

type UseStompRoomParams = {
    roomId: number | string;
    sender: string;
    token?: string | null;
};

type UseStompRoomReturn = {
    connected: boolean;
    messages: ChatMsg[];
    loadingHistory: boolean;
    sendMessage: (text: string) => void;
};

export function useStompRoom({ roomId, sender, token }: UseStompRoomParams): UseStompRoomReturn {
    const roomIdStr = useMemo(() => String(roomId ?? ""), [roomId]);
    const topic   = useMemo(() => `/topic/chat.room.${roomIdStr}`, [roomIdStr]);
    const pubDest = useMemo(() => `/pub/chat.send.${roomIdStr}`,  [roomIdStr]);

    const [connected, setConnected] = useState(false);
    const [messages, setMessages]   = useState<ChatMsg[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const unsubRef = useRef<Unsubscribe | null>(null);

    /** 최근 중복검사용 키셋(버킷 단위로 관리: 5초 버킷) */
    const recentSetRef = useRef<Set<string>>(new Set());
    const MAX_RECENT = 30;

    const norm = (s?: string) => (s ?? "").replace(/\s+/g, " ").trim();
    /** 5초 버킷으로 키 생성 → 서버/클라 타임스탬프 차이를 흡수 */
    const makeDupKey = (m: { sender?: string; content?: string; sentAt?: number }) => {
        const bucket = Math.floor(((m.sentAt ?? Date.now())) / 5000);
        return `${norm(m.sender).toLowerCase()}|${norm(m.content)}|${bucket}`;
    };
    const trimRecentSet = () => {
        const s = recentSetRef.current;
        if (s.size <= MAX_RECENT) return;
        const it = s.values().next();
        if (!it.done) s.delete(it.value);
    };

    // 1) 히스토리 로드
    useEffect(() => {
        let mounted = true;
        (async () => {
            setLoadingHistory(true);
            try {
                const raw = await fetchChatHistory(Number(roomIdStr || 0), 50);
                if (!mounted) return;

                const list: ChatMsg[] = (raw ?? []).map((it: any) => ({
                    roomId: String(it.roomId ?? roomIdStr),
                    sender: it.sender ?? "anonymous",
                    content: it.content ?? "",
                    sentAt: typeof it.sentAt === "number" ? it.sentAt : Date.now(),
                }));

                const set = new Set<string>();
                for (const it of list.slice(-MAX_RECENT)) set.add(makeDupKey(it));
                recentSetRef.current = set;

                setMessages(list);
            } catch (e) {
                console.log("[CHAT] history error", e);
                setMessages([]);
            } finally {
                if (mounted) setLoadingHistory(false);
            }
        })();
        return () => { mounted = false; };
    }, [roomIdStr]);

    // 2) STOMP 연결 + 구독
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                if (token) await connectStomp(token);
                else await connectStomp();

                if (!mounted) return;
                setConnected(true);

                if (unsubRef.current) {
                    unsubRef.current();
                    unsubRef.current = null;
                }

                unsubRef.current = subscribeTopic(topic, (frame: IMessage) => {
                    try {
                        const incoming = JSON.parse(frame.body) as ChatMsg;
                        const inSender = norm(incoming.sender).toLowerCase();
                        const inContent = norm(incoming.content);
                        const WINDOW_MS = 8000; // 에코-치환 허용창

                        setMessages((prev) => {
                            // 1) 최근 낙관적 메시지와 ‘내용/보낸이/시간’으로 매칭 → 치환
                            for (let i = prev.length - 1; i >= 0; i--) {
                                const m = prev[i];
                                if (
                                    norm(m.sender).toLowerCase() === inSender &&
                                    norm(m.content) === inContent &&
                                    Math.abs(m.sentAt - incoming.sentAt) <= WINDOW_MS
                                ) {
                                    const copy = prev.slice();
                                    copy[i] = { ...incoming, _localId: m._localId }; // 로컬ID 유지(선택)
                                    // 키셋도 새 메시지 기준으로 갱신
                                    recentSetRef.current.add(makeDupKey(incoming));
                                    trimRecentSet();
                                    return copy;
                                }
                            }

                            // 2) 치환대상이 없으면(순수 수신메시지) — 중복키 확인 후 추가
                            const key = makeDupKey(incoming);
                            if (recentSetRef.current.has(key)) return prev;
                            recentSetRef.current.add(key);
                            trimRecentSet();
                            return [...prev, incoming];
                        });
                    } catch (e) {
                        console.log("[CHAT] parse error", e, frame.body);
                    }
                });
            } catch (e) {
                console.log("[CHAT] connect/subscribe error", e);
                setConnected(false);
            }
        })();

        return () => {
            mounted = false;
            setConnected(false);
            if (unsubRef.current) {
                unsubRef.current();
                unsubRef.current = null;
            }
        };
    }, [topic, token]);

    // 3) 전송(낙관적 추가 + 서버 발행)
    const sendMessage = useCallback((text: string) => {
        const plain = text;            // 입력 도중엔 가공 금지, 전송 시만 trim
        const safe = plain.trim();
        if (!safe) return;

        const now = Date.now();
        const optimistic: ChatMsg = {
            roomId: roomIdStr,
            sender,
            content: safe,
            sentAt: now,
            _localId: `${sender}-${now}-${Math.random().toString(36).slice(2, 8)}`
        };

        setMessages((prev) => [...prev, optimistic]);
        recentSetRef.current.add(makeDupKey(optimistic));
        trimRecentSet();

        publish(pubDest, optimistic, {}); // 헤더는 빈 객체
    }, [roomIdStr, sender, pubDest]);

    return { connected, messages, loadingHistory, sendMessage };
}
