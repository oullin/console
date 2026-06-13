package main

import (
	"bytes"
	"os"
	"os/exec"
	"path/filepath"
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

func TestPortalBindsViperFlagsIntoFormDefaults(t *testing.T) {
	output := runPortal(t, []byte("\n\n\n"), "form", "--project", "Flag App", "--runtime", "TypeScript", "--create=false")

	for _, want := range []string{"Flag App", "TypeScript", "false"} {
		if !strings.Contains(output, want) {
			t.Fatalf("flag-backed form output missing %q:\n%s", want, output)
		}
	}
}

func TestPortalBindsViperEnvIntoCommandAndDefaults(t *testing.T) {
	output := runPortalWithEnv(t, []byte("\n\n\n"), []string{
		"OLLIN_SHELL_COMMAND=form",
		"OLLIN_SHELL_FORM_PROJECT=Env App",
		"OLLIN_SHELL_FORM_RUNTIME=TypeScript",
		"OLLIN_SHELL_FORM_CREATE=false",
	})

	for _, want := range []string{"Env App", "TypeScript", "false"} {
		if !strings.Contains(output, want) {
			t.Fatalf("env-backed form output missing %q:\n%s", want, output)
		}
	}
}

func TestPortalReadsViperConfigFile(t *testing.T) {
	configPath := filepath.Join(t.TempDir(), "shell")
	err := os.WriteFile(configPath, []byte(strings.Join([]string{
		"command: form",
		"form:",
		"  project: Config App",
		"  runtime: TypeScript",
		"  create: false",
		"",
	}, "\n")), 0o600)
	if err != nil {
		t.Fatal(err)
	}

	output := runPortal(t, []byte("\n\n\n"), "--config", configPath)

	for _, want := range []string{"Config App", "TypeScript", "false"} {
		if !strings.Contains(output, want) {
			t.Fatalf("config-backed form output missing %q:\n%s", want, output)
		}
	}
}

func runPortal(t *testing.T, stdin []byte, args ...string) string {
	return runPortalWithEnv(t, stdin, nil, args...)
}

func runPortalWithEnv(t *testing.T, stdin []byte, env []string, args ...string) string {
	t.Helper()

	commandArgs := append([]string{"run", "."}, args...)
	command := exec.Command("go", commandArgs...)
	command.Stdin = bytes.NewReader(stdin)
	command.Env = append(os.Environ(), env...)

	output, err := command.CombinedOutput()
	if err != nil {
		t.Fatalf("go run . %s failed: %v\n%s", strings.Join(args, " "), err, output)
	}

	return string(output)
}
