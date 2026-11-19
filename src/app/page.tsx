import { WorkspaceApp } from '@/components/WorkspaceApp';
import { TRACKS } from '@/data/curriculum';

export default function HomePage() {
  return <WorkspaceApp tracks={TRACKS} />;
}
