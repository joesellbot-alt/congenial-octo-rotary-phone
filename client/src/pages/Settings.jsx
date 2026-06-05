import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Key, Globe, Mail, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const [settings, setSettings] = useState({
    openaiKey: '',
    anthropicKey: '',
    stripeKey: '',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
    deployDomain: '',
  });

  const handleSave = (section) => {
    toast.success(`${section} settings saved`);
  };

  return (
    <div className="max-w-3xl p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your app builder platform</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Key className="h-4 w-4" />
              AI Provider Keys
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">OpenAI API Key</label>
              <Input
                type="password"
                placeholder="sk-..."
                value={settings.openaiKey}
                onChange={(e) => setSettings({ ...settings, openaiKey: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Anthropic API Key</label>
              <Input
                type="password"
                placeholder="sk-ant-..."
                value={settings.anthropicKey}
                onChange={(e) => setSettings({ ...settings, anthropicKey: e.target.value })}
              />
            </div>
            <Button size="sm" onClick={() => handleSave('AI')}>
              Save AI Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" />
              Payments (Stripe)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Stripe Secret Key</label>
              <Input
                type="password"
                placeholder="sk_..."
                value={settings.stripeKey}
                onChange={(e) => setSettings({ ...settings, stripeKey: e.target.value })}
              />
            </div>
            <Button size="sm" onClick={() => handleSave('Payment')}>
              Save Payment Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4" />
              Email (SMTP)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">SMTP Host</label>
                <Input
                  placeholder="smtp.example.com"
                  value={settings.smtpHost}
                  onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">SMTP Port</label>
                <Input
                  placeholder="587"
                  value={settings.smtpPort}
                  onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Username</label>
                <Input
                  value={settings.smtpUser}
                  onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Password</label>
                <Input
                  type="password"
                  value={settings.smtpPass}
                  onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
                />
              </div>
            </div>
            <Button size="sm" onClick={() => handleSave('Email')}>
              Save Email Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4" />
              Deployment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Custom Domain</label>
              <Input
                placeholder="apps.yourdomain.com"
                value={settings.deployDomain}
                onChange={(e) => setSettings({ ...settings, deployDomain: e.target.value })}
              />
            </div>
            <Button size="sm" onClick={() => handleSave('Deployment')}>
              Save Deployment Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
