import { useEffect, useMemo, useRef, useState } from "react";
import { IMessage } from "@stomp/stompjs";
import { connectStomp, subscribeTopic, Unsubscribe } from "@/app/utils/stompClient";

export type TaskEvent = {
    type: "CREATED" | "ASSIGNED" | "DELETED" | "COMPLETED" | "UNCOMPLETED" | string;
    workplaceId?: number;
    taskId?: number;
    assignmentId?: number;
    memberId?: number;
    taskName?: string | null;
};

export function useTaskStream(workplaceId?: number, token?: string) {
    const [events, setEvents] = useState<TaskEvent[]>([]);
    const unsubRef = useRef<Unsubscribe | null>(null);

    const topic = useMemo(() => {
        if (workplaceId == null) return null;
        return `/topic/task.stream.${workplaceId}`;
    }, [workplaceId]);

    useEffect(() => {
        let mounted = true;

        (async () => {
            if (!topic) return;
            await connectStomp(token);
            const unsub = subscribeTopic(topic, (m: IMessage) => {
                try {
                    const body = JSON.parse(m.body) as TaskEvent;
                    if (!mounted) return;
                    setEvents((prev) => [body, ...prev].slice(0, 50)); // 최근 50개만 유지
                } catch {
                    // ignore
                }
            });
            unsubRef.current = unsub;
        })();

        return () => {
            mounted = false;
            try { unsubRef.current?.(); } catch {}
            unsubRef.current = null;
        };
    }, [topic, token]);

    return { events };
}
