import {
    useEffect,
    useState,
    useCallback
} from "react";
import {
    useProgram
} from "../solana.js";

export const useIssues = () => {
    const {
        program
    } = useProgram();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchIssues = useCallback(async () => {
        if (!program) {
            setLoading(false);
            return;
        }
        try {
            const all = await program.account.issue.all();

            const parsed = all.filter((item) => {
                const url = item.account.imageUrl;
                return url && url.startsWith("https://") && url.includes("|");
            }).map((item) => {
                const d = item.account;

                const parts = d.imageUrl ? d.imageUrl.split("|") : [];
                const img = parts[0] || "";
                const lat = parts[1] ? parseFloat(parts[1]) : 43.238949;
                const lng = parts[2] ? parseFloat(parts[2]) : 76.889709;

                return {
                    id: item.publicKey.toString(),
                    img,
                    location: parts[1] && parts[2] ?
                        `${lat.toFixed(4)}, ${lng.toFixed(4)}` :
                        "Локация не указана",
                    coordinates: [lat, lng],
                    status: parseStatus(d.status),
                    danger: d.severity || 0,
                    cost: d.estimatedCost ? d.estimatedCost.toNumber() : 0,
                    problem: getProblemLabel(d.severity),
                    creator: d.creator.toString()
                };
            });

            parsed.sort((a, b) => a.id.localeCompare(b.id));
            setIssues(parsed);
        } catch (err) {
            console.error("Ошибка загрузки issues:", err);
        } finally {
            setLoading(false);
        }
    }, [program]);

    useEffect(() => {
        fetchIssues();
    }, [fetchIssues]);

    return {
        issues,
        loading,
        refetch: fetchIssues
    };
};

function parseStatus(statusObj) {
    const s = JSON.stringify(statusObj).toLowerCase();
    if (s.includes("resolved")) return "resolved";
    if (s.includes("repairpending")) return "in_progress";
    if (s.includes("funded")) return "in_progress";
    if (s.includes("aiverified")) return "aiverified";
    if (s.includes("rejected")) return "rejected";
    return "pending";
}

function getProblemLabel(severity) {
    if (!severity || severity === 0) return "Новая проблема";
    if (severity >= 8) return "Критическая проблема";
    if (severity >= 5) return "Серьёзная проблема";
    return "Небольшая проблема";
}