// app/utils/useNoticeTopic.ts
import { useEffect, useMemo, useRef, useState } from "react";
import { connectStomp, subscribeTopic, getStompClient } from "./stompClient";

export type NoticeMessage = {
    workplaceId: string;
    title?: string;
    content: string;
    createdAt?: string | number;
};

export function useNoticeTopic(workplaceId?: number | string, token?: string | null) {
    const [notices, setNotices] = useState<NoticeMessage[]>([]);
    const unsubRef = useRef<null | (() => void)>(null);

    const topic = useMemo(() => {
        if (workplaceId == null) return null;
        return `/topic/notice.store.${workplaceId}`;
    }, [workplaceId]);

    useEffect(() => {
        let mounted = true;

        (async () => {
            if (!topic) return;
            await connectStomp(token || undefined);

            const client = getStompClient();

            client.onConnect = () => {
                if (!mounted) return;
                if (unsubRef.current) unsubRef.current();
                unsubRef.current = subscribeTopic(topic, (frame) => {
                    try {
                        const msg = JSON.parse(frame.body) as NoticeMessage;
                        setNotices((prev) => [msg, ...prev].slice(0, 50));
                    } catch {}
                });
            };

            if (client.connected) {
                unsubRef.current = subscribeTopic(topic, (frame) => {
                    try {
                        const msg = JSON.parse(frame.body) as NoticeMessage;
                        setNotices((prev) => [msg, ...prev].slice(0, 50));
                    } catch {}
                });
            }
        })();

        return () => {
            if (unsubRef.current) {
                unsubRef.current();
                unsubRef.current = null;
            }
        };
    }, [topic, token]);

    return { notices };
}
