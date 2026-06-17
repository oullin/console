package output

import "fmt"

type NotificationCommand struct {
	Bin  string
	Args []string
}

type NotificationRuntime struct {
	CommandExists func(string) bool
	Execute       func(NotificationCommand) bool
}

func NotificationCommandFor(platform string, title string, body string, subtitle string, sound string, icon string) *NotificationCommand {
	commands := NotificationCommands(platform, title, body, subtitle, sound, icon)
	if len(commands) == 0 {
		return nil
	}
	return &commands[0]
}

func NotificationCommands(platform string, title string, body string, subtitle string, sound string, icon string) []NotificationCommand {
	switch platform {
	case "darwin":
		script := fmt.Sprintf("display notification %q with title %q", body, title)
		if subtitle != "" {
			script += fmt.Sprintf(" subtitle %q", subtitle)
		}
		if sound != "" {
			script += fmt.Sprintf(" sound name %q", sound)
		}
		return []NotificationCommand{{Bin: "osascript", Args: []string{"-e", script}}}
	case "linux":
		args := []string{}
		if icon != "" {
			args = append(args, "--icon", icon)
		}
		args = append(args, title)
		if body != "" {
			args = append(args, body)
		}
		message := title
		if body != "" {
			message += ": " + body
		}
		return []NotificationCommand{
			{Bin: "notify-send", Args: args},
			{Bin: "kdialog", Args: []string{"--passivepopup", message, "5", "--title", title}},
		}
	default:
		return nil
	}
}

func NotifyForPlatform(platform string, title string, body string, subtitle string, sound string, icon string, runtime NotificationRuntime) bool {
	commands := NotificationCommands(platform, title, body, subtitle, sound, icon)
	command := availableNotificationCommand(platform, commands, runtime.CommandExists)
	if command != nil {
		if runtime.Execute == nil {
			return false
		}
		return runtime.Execute(*command)
	}

	if body != "" {
		Note(title+": "+body, NoteInfo)
	} else {
		Note(title, NoteInfo)
	}
	return false
}

func availableNotificationCommand(platform string, commands []NotificationCommand, exists func(string) bool) *NotificationCommand {
	if len(commands) == 0 {
		return nil
	}
	if platform != "linux" {
		return &commands[0]
	}
	if exists == nil {
		return nil
	}
	for index, command := range commands {
		if exists(command.Bin) {
			return &commands[index]
		}
	}
	return nil
}
