import Jeopardy from '@/components/Jeopardy';

export const metadata = { title: 'Jeopardy Scoreboard', robots: { index: false, follow: false } };

export default function Page() {
  return <Jeopardy mode="scoreboard" />;
}
