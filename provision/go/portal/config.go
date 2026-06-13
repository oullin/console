package main

import (
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	stdstrings "strings"

	"github.com/spf13/pflag"
	"github.com/spf13/viper"
)

const (
	defaultCommand = "home"
	versionCommand = "version"
	formCommand    = "form"
)

type portalConfig struct {
	Command        string
	ProjectDefault string
	RuntimeDefault string
	CreateDefault  bool
	Interactive    bool
}

func loadPortalConfig(args []string) (portalConfig, error) {
	settings := viper.New()
	settings.SetEnvPrefix("OLLIN_SHELL")
	settings.SetEnvKeyReplacer(stdstrings.NewReplacer(".", "_", "-", "_"))
	settings.AutomaticEnv()

	settings.SetDefault("command", defaultCommand)
	settings.SetDefault("form.project", "")
	settings.SetDefault("form.runtime", "Go")
	settings.SetDefault("form.create", true)
	settings.SetDefault("interactive", true)

	flags := pflag.NewFlagSet("shell", pflag.ContinueOnError)
	flags.SetOutput(io.Discard)
	flags.String("config", "", "Path to a shell config file.")
	flags.String("command", "", "Command to run.")
	flags.String("project", "", "Default project name for the form command.")
	flags.String("runtime", "", "Default runtime for the form command.")
	flags.Bool("create", true, "Default create confirmation for the form command.")
	flags.Bool("interactive", true, "Enable interactive prompts.")
	flags.Bool("version", false, "Print the shell version.")

	if err := flags.Parse(args); err != nil {
		return portalConfig{}, err
	}

	if err := settings.BindPFlag("config", flags.Lookup("config")); err != nil {
		return portalConfig{}, err
	}
	if err := settings.BindPFlag("command", flags.Lookup("command")); err != nil {
		return portalConfig{}, err
	}
	if err := settings.BindPFlag("form.project", flags.Lookup("project")); err != nil {
		return portalConfig{}, err
	}
	if err := settings.BindPFlag("form.runtime", flags.Lookup("runtime")); err != nil {
		return portalConfig{}, err
	}
	if err := settings.BindPFlag("form.create", flags.Lookup("create")); err != nil {
		return portalConfig{}, err
	}
	if err := settings.BindPFlag("interactive", flags.Lookup("interactive")); err != nil {
		return portalConfig{}, err
	}

	if configPath := settings.GetString("config"); configPath != "" {
		settings.SetConfigFile(configPath)
		if !hasKnownConfigExtension(configPath) {
			settings.SetConfigType("yaml")
		}
		if err := settings.ReadInConfig(); err != nil {
			return portalConfig{}, err
		}
	} else {
		settings.SetConfigName("shell")
		settings.SetConfigType("yaml")
		settings.AddConfigPath(".")
		if home, err := os.UserHomeDir(); err == nil {
			settings.AddConfigPath(home + "/.config/ollin")
		}
		if err := settings.ReadInConfig(); err != nil {
			var notFound viper.ConfigFileNotFoundError
			if !errors.As(err, &notFound) {
				return portalConfig{}, err
			}
		}
	}

	if flags.Changed("version") && settings.GetBool("version") {
		settings.Set("command", versionCommand)
	}

	if command := firstPositionalCommand(flags.Args()); command != "" && !flags.Changed("command") {
		settings.Set("command", command)
	}

	config := portalConfig{
		Command:        normalizeCommand(settings.GetString("command")),
		ProjectDefault: settings.GetString("form.project"),
		RuntimeDefault: settings.GetString("form.runtime"),
		CreateDefault:  settings.GetBool("form.create"),
		Interactive:    settings.GetBool("interactive"),
	}
	if err := config.validate(); err != nil {
		return portalConfig{}, err
	}

	return config, nil
}

func firstPositionalCommand(args []string) string {
	if len(args) == 0 {
		return ""
	}

	return args[0]
}

func normalizeCommand(command string) string {
	command = stdstrings.TrimSpace(stdstrings.ToLower(command))
	if command == "" {
		return defaultCommand
	}

	return command
}

func hasKnownConfigExtension(path string) bool {
	switch stdstrings.ToLower(filepath.Ext(path)) {
	case ".json", ".toml", ".yaml", ".yml", ".env", ".hcl", ".ini", ".properties", ".props", ".prop":
		return true
	default:
		return false
	}
}

func (config portalConfig) validate() error {
	switch config.Command {
	case defaultCommand, versionCommand, formCommand:
	default:
		return fmt.Errorf("unknown command %q", config.Command)
	}

	if config.RuntimeDefault != "Go" && config.RuntimeDefault != "TypeScript" {
		return fmt.Errorf("unsupported runtime %q", config.RuntimeDefault)
	}

	return nil
}
