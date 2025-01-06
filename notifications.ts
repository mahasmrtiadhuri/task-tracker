import { Todo } from "./todo";
import { useToast } from "@/hooks/use-toast";

export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
    return {
      granted: false,
      message: "Your browser does not support notifications"
    };
  }

  try {
    // Check if permission is already denied
    if (Notification.permission === "denied") {
      return {
        granted: false,
        message: "Please enable notifications in your browser settings to receive task reminders",
        blocked: true
      };
    }

    const permission = await Notification.requestPermission();
    console.log("Notification permission status:", permission);

    switch (permission) {
      case "granted":
        new Notification("Todo App Notifications Enabled", {
          body: "You will now receive notifications for upcoming tasks",
          icon: "/favicon.ico"
        });
        return {
          granted: true,
          message: "Notifications enabled successfully"
        };
      case "denied":
        return {
          granted: false,
          message: "Please enable notifications in your browser settings to receive task reminders",
          blocked: true
        };
      default:
        return {
          granted: false,
          message: "Please allow notifications to receive task reminders",
          blocked: false
        };
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return {
      granted: false,
      message: "There was an error enabling notifications",
      error: true
    };
  }
}

export function sendTaskNotification(todo: Todo) {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
    return;
  }

  if (Notification.permission !== "granted") {
    console.log("Notifications not permitted");
    return;
  }

  try {
    const title = `Task Due Soon: ${todo.title}`;
    const options = {
      body: `Priority: ${todo.priority}\nCategory: ${todo.category || "None"}\nClick to view your tasks`,
      icon: "/favicon.ico",
      tag: `task-${todo.id}`,
      requireInteraction: true
    };

    console.log("Sending notification for task:", todo.title);
    new Notification(title, options);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

export function checkForDueTasks(todos: Todo[]) {
  console.log("Checking for due tasks...");
  const now = new Date();
  const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60000);

  todos.forEach(todo => {
    if (todo.completed || !todo.dueDate) return;

    const dueDate = new Date(todo.dueDate);
    console.log(`Checking task: ${todo.title}, due at: ${dueDate}`);

    if (dueDate > now && dueDate <= thirtyMinutesFromNow) {
      console.log(`Task due soon: ${todo.title}`);
      sendTaskNotification(todo);
    }
  });
}