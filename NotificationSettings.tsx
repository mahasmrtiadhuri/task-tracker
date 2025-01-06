import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requestNotificationPermission } from "@/lib/notifications";
import { useToast } from "@/hooks/use-toast";

export function NotificationSettings() {
  const { toast } = useToast();

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    if (!result.granted && result.blocked) {
      // Show browser-specific instructions
      const browserInstructions = getBrowserInstructions();
      toast({
        title: "Enable Notifications",
        description: (
          <div className="space-y-2">
            <p>{result.message}</p>
            <p className="text-sm text-muted-foreground">{browserInstructions}</p>
          </div>
        ),
        duration: 10000,
      });
    }
  };

  const getBrowserInstructions = () => {
    const isChrome = navigator.userAgent.indexOf("Chrome") > -1;
    const isFirefox = navigator.userAgent.indexOf("Firefox") > -1;
    const isSafari = navigator.userAgent.indexOf("Safari") > -1 && !isChrome;

    if (isChrome) {
      return "In Chrome: Click the lock icon 🔒 next to the URL → Site Settings → Notifications → Allow";
    } else if (isFirefox) {
      return "In Firefox: Click the lock icon 🔒 → Permissions → Notifications → Allow";
    } else if (isSafari) {
      return "In Safari: Click Safari → Preferences → Websites → Notifications → Allow for this website";
    }
    return "Check your browser settings to enable notifications for this site";
  };

  return (
    <Card className="bg-background/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Enable notifications to receive reminders for upcoming tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleRequestPermission}
        >
          <Bell className="mr-2 h-4 w-4" />
          Enable Notifications
        </Button>
      </CardContent>
    </Card>
  );
}
