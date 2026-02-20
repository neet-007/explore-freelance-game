import PlayContainer from "@/components/PlayContainer";
import { getGameQuestions, getGameTimeLimitSeconds } from "@/lib/game";

export default async function PlayPage() {
    const questions = await getGameQuestions();
    const timeLimitSeconds = getGameTimeLimitSeconds();

    return (
        <main className="page-shell flex items-center justify-center">
            <PlayContainer questions={questions} timeLimitSeconds={timeLimitSeconds} />
        </main>
    );
}
