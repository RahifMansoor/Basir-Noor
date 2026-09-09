import Jeopardy from '@/components/Jeopardy';
export const metadata = { title: 'Jeopardy Host', robots: { index: false, follow: false } };
export default function Page() { return <Jeopardy mode="admin" />; }
