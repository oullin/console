package main

import (
	"fmt"
	"os"

	tui "github.com/oullin/tui"
	"golang.org/x/term"
)

func main() {
	if err := run(os.Args[1:]); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func run(args []string) error {
	config, err := loadPortalConfig(args)
	if err != nil {
		return err
	}

	if config.Command == versionCommand {
		fmt.Println("@ollin/shell 0.1.0")
		return nil
	}

	configureStdioEnvironment(config)

	if config.Command == formCommand {
		return runFormCommand(config)
	}

	tui.Intro("Oullin TUI shell")
	tui.Info("Commands: version, form")
	return nil
}

func configureStdioEnvironment(config portalConfig) {
	interactive := config.Interactive
	tui.Configure(tui.Patch{
		Input:       tui.NewStdioInput(os.Stdin, os.Stdout),
		Output:      tui.NewWriterOutput(os.Stdout),
		ErrorOutput: tui.NewWriterOutput(os.Stderr),
		Interactive: &interactive,
	})
}

func runFormCommand(config portalConfig) error {
	restore, err := enableRawInput()
	if err != nil {
		return err
	}
	defer restore()

	responses, err := tui.Form().
		Text(tui.TextOptions{Message: "Project name", Default: config.ProjectDefault, Required: tui.Required{Enabled: true}}).
		Select(tui.ChoiceOptions{Message: "Runtime", Choices: tui.NewStringChoices("Go", "TypeScript"), Default: config.RuntimeDefault, HasDefault: true}).
		Confirm(tui.ConfirmOptions{Message: "Create project?", Default: config.CreateDefault, HasDefault: true}).
		Submit()
	if err != nil {
		return err
	}

	tui.Table([]string{"Field", "Value"}, [][]any{
		{"Project", responses.At(0)},
		{"Runtime", responses.At(1)},
		{"Create", responses.At(2)},
	})

	return nil
}

func enableRawInput() (func(), error) {
	file := os.Stdin
	if !term.IsTerminal(int(file.Fd())) {
		return func() {}, nil
	}

	state, err := term.MakeRaw(int(file.Fd()))
	if err != nil {
		return nil, err
	}

	return func() {
		_ = term.Restore(int(file.Fd()), state)
	}, nil
}
