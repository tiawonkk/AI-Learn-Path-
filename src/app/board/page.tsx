import { WorkspaceApp } from '@/components/WorkspaceApp';
import { TRACKS } from '@/data/curriculum';

export const metadata = {
  title: 'My Personal Learning Board — AI Mastery Hub',
  description:
    'Isolated 1-User = 1-Personal-Board workspace with hybrid Supabase + IndexedDB persistence.',
};

export default function PersonalBoardPage() {
  return <WorkspaceApp tracks={TRACKS} isPersonalBoardRoute />;
}
