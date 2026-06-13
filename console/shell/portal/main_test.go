package main

import (
	"bytes"
	"os/exec"
	"strings"
	"testing"
)

func TestPortalVersionCommand(t *testing.T) {
	output := runPortal(t, nil, "version")

	if strings.TrimSpace(output) != "@ollin/shell 0.1.0" {
		t.Fatalf("version output = %q", output)
	}
}

func TestPortalDefaultCommandShowsRealCommands(t *testing.T) {
	output := runPortal(t, nil)

	if !strings.Contains(output, "Oullin TUI shell") || !strings.Contains(output, "Commands: version, form") {
		t.Fatalf("default output = %q", output)
	}
}

func TestPortalFormCommandUsesRealStdio(t *testing.T) {
	output := runPortal(t, []byte("Ada\n\n\n"), "form")

	for _, want := range []string{"Project name", "Runtime", "Create project?", "Project", "Ada", "Runtime", "Go", "Create", "true"} {
		if !strings.Contains(output, want) {
			t.Fatalf("form output missing %q:\n%s", want, output)
		}
	}
}

func runPortal(t *testing.T, stdin []byte, args ...string) string {
	t.Helper()

	commandArgs := append([]string{"run", "."}, args...)
	command := exec.Command("go", commandArgs...)
	command.Stdin = bytes.NewReader(stdin)

	output, err := command.CombinedOutput()
	if err != nil {
		t.Fatalf("go run . %s failed: %v\n%s", strings.Join(args, " "), err, output)
	}

	return string(output)
}
