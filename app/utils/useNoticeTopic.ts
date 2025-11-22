import { useEffect, useMemo, useRef, useState } from "react";
import { connectStomp, subscribeTopic } from "./stompClient";
import type { AnnouncementDto } from "@/api/announcement.api";

export function useNoticeTopic(
    workplaceId?: number,
    token?: string
) {
    const [notices, setNotices] = useState<AnnouncementDto[]>([]);
    const unsubRef = useRef<null | (() => void)>(null);

    const topic = useMemo(() => {
        if (workplaceId == null) return null;
        return `/topic/notice.store.${workplaceId}`;
    }, [workplaceId]);

    useEffect(() => {
        let mounted = true;

        (async () => {
            if (!topic) return;

            await connectStomp(token ?? undefined);

            if (unsubRef.current) {
                try { unsubRef.current(); } catch {}
                unsubRef.current = null;
            }

            unsubRef.current = subscribeTopic(topic, (frame: any) => {
                try {
                    const raw = typeof frame.body === "string" ? JSON.parse(frame.body) : frame.body;

                    // 유연 파싱 (기존/신규 이벤트 모두 수용)
                    const msg: AnnouncementDto = {
                        id: raw.id != null ? Number(raw.id) : undefined,
                        title: String(raw.title ?? ""),
                        content: String(raw.content ?? ""),
                        createdtime: raw.createdtime ?? undefined,
                        workplaceId: Number(raw.workplaceId),
                        event: raw.event as any, // "created" | "updated" | "deleted" | undefined
                    };

                    if (!mounted) return;

                    setNotices(prev => {
                        // deleted 이벤트: id 기준으로 제거
                        if (msg.event === "deleted" && msg.id != null) {
                            return prev.filter(n => n.id !== msg.id);
                        }
                        // updated 이벤트: id 기준으로 교체 (없으면 push)
                        if (msg.event === "updated" && msg.id != null) {
                            const idx = prev.findIndex(n => n.id === msg.id);
                            if (idx >= 0) {
                                const next = prev.slice();
                                next[idx] = { ...prev[idx], ...msg };
                                return next;
                            }
                            return [msg, ...prev].slice(0, 100);
                        }
                        // created 혹은 타입 없는 예전 메시지: 앞에 추가
                        return [msg, ...prev].slice(0, 100);
                    });

                } catch (e) {
                    console.warn("[NOTICE] parse error:", e);
                }
            });
        })();

        return () => {
            mounted = false;
            if (unsubRef.current) {
                try { unsubRef.current(); } catch {}
                unsubRef.current = null;
            }
        };
    }, [topic, token]);

    return { notices };
}
