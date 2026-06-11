import Dashboard       from './Dashboard';
import SettingsPanel   from './SettingsPanel';
import ProfileExtras   from './ProfileExtras';

export default function ProfilePage() {
  return (
    <div className="space-y-12">
      <Dashboard />
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <ProfileExtras />
      </div>
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <h2 className="text-lg font-semibold mb-4">账号设置</h2>
        <SettingsPanel />
      </div>
    </div>
  );
}
