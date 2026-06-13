package main

import (
	"fmt"
	"os"

	tui "github.com/oullin/tui"
)

type stdOutput struct{}

func main() {
	tui.Configure(tui.Patch{Output: stdOutput{}, ErrorOutput: stdOutput{}})

	if len(os.Args) > 1 && os.Args[1] == "version" {
		fmt.Println("@ollin/shell 0.1.0")
		return
	}

	tui.Intro("Oullin TUI shell")
	tui.Info("Go console shell workspace is ready.")
}

func (stdOutput) Write(content string) {
	fmt.Print(content)
}
