package key

type Value []string

type Event struct {
	Name     string
	Sequence string
	Ctrl     bool
	Meta     bool
	Shift    bool
}

var (
	Up              = Value{"\x1b[A"}
	ShiftUp         = Value{"\x1b[1;2A"}
	PageUp          = Value{"\x1b[5~"}
	Down            = Value{"\x1b[B"}
	ShiftDown       = Value{"\x1b[1;2B"}
	PageDown        = Value{"\x1b[6~"}
	Right           = Value{"\x1b[C"}
	Left            = Value{"\x1b[D"}
	UpArrow         = Value{"\x1bOA"}
	DownArrow       = Value{"\x1bOB"}
	RightArrow      = Value{"\x1bOC"}
	LeftArrow       = Value{"\x1bOD"}
	Escape          = Value{"\x1b"}
	Delete          = Value{"\x1b[3~"}
	Backspace       = Value{"\x7f"}
	Enter           = Value{"\n"}
	Space           = Value{" "}
	Tab             = Value{"\t"}
	ShiftTab        = Value{"\x1b[Z"}
	Home            = Value{"\x1b[1~", "\x1bOH", "\x1b[H", "\x1b[7~"}
	End             = Value{"\x1b[4~", "\x1bOF", "\x1b[F", "\x1b[8~"}
	CtrlC           = Value{"\x03"}
	CtrlP           = Value{"\x10"}
	CtrlN           = Value{"\x0e"}
	CtrlF           = Value{"\x06"}
	CtrlB           = Value{"\x02"}
	CtrlH           = Value{"\x08"}
	CtrlA           = Value{"\x01"}
	CtrlD           = Value{"\x04"}
	CtrlE           = Value{"\x05"}
	CtrlU           = Value{"\x15"}
	OptionBackspace = Value{"\x1b\x7f"}
)

var named = map[string]Value{
	"up":              Up,
	"shiftUp":         ShiftUp,
	"pageUp":          PageUp,
	"down":            Down,
	"shiftDown":       ShiftDown,
	"pageDown":        PageDown,
	"right":           Right,
	"left":            Left,
	"upArrow":         UpArrow,
	"downArrow":       DownArrow,
	"rightArrow":      RightArrow,
	"leftArrow":       LeftArrow,
	"escape":          Escape,
	"delete":          Delete,
	"backspace":       Backspace,
	"enter":           Enter,
	"space":           Space,
	"tab":             Tab,
	"shiftTab":        ShiftTab,
	"home":            Home,
	"end":             End,
	"ctrlC":           CtrlC,
	"ctrlP":           CtrlP,
	"ctrlN":           CtrlN,
	"ctrlF":           CtrlF,
	"ctrlB":           CtrlB,
	"ctrlH":           CtrlH,
	"ctrlA":           CtrlA,
	"ctrlD":           CtrlD,
	"ctrlE":           CtrlE,
	"ctrlU":           CtrlU,
	"optionBackspace": OptionBackspace,
}

var ctrlKeys = map[string]Value{
	"a": CtrlA,
	"b": CtrlB,
	"c": CtrlC,
	"d": CtrlD,
	"e": CtrlE,
	"f": CtrlF,
	"h": CtrlH,
	"n": CtrlN,
	"p": CtrlP,
	"u": CtrlU,
}

var aliases = map[string]Value{
	"pagedown": PageDown,
	"pageup":   PageUp,
	"return":   Enter,
}

func First(value Value) string {
	if len(value) == 0 {
		return ""
	}

	return value[0]
}

func FromEvent(event Event) string {
	name := lowerASCII(event.Name)

	if event.Ctrl && name != "" {
		if value, ok := ctrlKeys[name]; ok {
			return First(value)
		}
	}

	if event.Meta && event.Name == "backspace" {
		return First(OptionBackspace)
	}

	if event.Shift && name == "tab" {
		return First(ShiftTab)
	}

	if name != "" {
		if value, ok := aliases[name]; ok {
			return First(value)
		}
	}

	if event.Name != "" {
		if value, ok := named[event.Name]; ok {
			return First(value)
		}
	}

	if event.Sequence == " " {
		return First(Space)
	}

	if event.Sequence == "\r" || event.Sequence == "\n" {
		return First(Enter)
	}

	if event.Name != "" {
		return event.Name
	}

	return event.Sequence
}

func OneOf(keys []Value, match string) (string, bool) {
	for _, value := range keys {
		for _, candidate := range value {
			if candidate == match {
				return match, true
			}
		}
	}

	return "", false
}

func lowerASCII(value string) string {
	bytes := []byte(value)
	for index, char := range bytes {
		if char >= 'A' && char <= 'Z' {
			bytes[index] = char + ('a' - 'A')
		}
	}

	return string(bytes)
}
