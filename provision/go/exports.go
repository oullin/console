package tui

import (
	"github.com/oullin/tui/internal/environment"
	"github.com/oullin/tui/internal/form"
	"github.com/oullin/tui/internal/key"
	"github.com/oullin/tui/internal/output"
	"github.com/oullin/tui/internal/prompt"
	"github.com/oullin/tui/internal/prompts"
	"github.com/oullin/tui/internal/status"
	textutil "github.com/oullin/tui/internal/strings"
	"github.com/oullin/tui/internal/terminal"
	"github.com/oullin/tui/internal/typedvalue"
)

type Environment = environment.Environment
type Input = environment.Input
type Output = environment.Output
type Patch = environment.Patch
type MemoryOutput = environment.MemoryOutput
type ScriptedInput = environment.ScriptedInput
type StdioInput = environment.StdioInput
type WriterOutput = environment.WriterOutput

var CurrentEnvironment = environment.Current
var Configure = environment.Configure
var WithEnvironment = environment.With
var NewMemoryOutput = environment.NewMemoryOutput
var NewScriptedInput = environment.NewScriptedInput
var NewStdioInput = environment.NewStdioInput
var NewWriterOutput = environment.NewWriterOutput
var CancelUsing = environment.CancelUsing
var CancelPrompt = environment.CancelPrompt

type KeyValue = key.Value
type KeyEvent = key.Event

var (
	KeyUp              = key.Up
	KeyDown            = key.Down
	KeyRight           = key.Right
	KeyLeft            = key.Left
	KeyEscape          = key.Escape
	KeyDelete          = key.Delete
	KeyBackspace       = key.Backspace
	KeyEnter           = key.Enter
	KeySpace           = key.Space
	KeyTab             = key.Tab
	KeyShiftTab        = key.ShiftTab
	KeyCtrlC           = key.CtrlC
	KeyCtrlA           = key.CtrlA
	KeyCtrlD           = key.CtrlD
	KeyCtrlU           = key.CtrlU
	KeyOptionBackspace = key.OptionBackspace
)

var KeyFirst = key.First
var KeyFromEvent = key.FromEvent
var KeyOneOf = key.OneOf

type Required = prompt.Required
type Validator[T any] = prompt.Validator[T]
type PromptValidationError = environment.PromptValidationError

var ValidationError = prompt.ValidationError
var EnsureValid = prompt.EnsureValid[any]

type TextOptions = prompts.TextOptions
type NumberOptions = prompts.NumberOptions
type Choice = prompts.Choice
type ChoiceOptions = prompts.ChoiceOptions
type MultiChoiceOptions = prompts.MultiChoiceOptions
type ConfirmOptions = prompts.ConfirmOptions
type SearchSource = prompts.SearchSource
type SearchOptions = prompts.SearchOptions
type MultiSearchOptions = prompts.MultiSearchOptions
type SuggestSource = prompts.SuggestSource
type SuggestOptions = prompts.SuggestOptions

var Text = prompts.Text
var Textarea = prompts.Textarea
var Password = prompts.Password
var Number = prompts.Number
var Pause = prompts.Pause
var NewStringChoices = prompts.NewStringChoices
var Select = prompts.Select
var Multiselect = prompts.Multiselect
var Confirm = prompts.Confirm
var Search = prompts.Search
var Multisearch = prompts.MultiSearch
var Suggest = prompts.Suggest
var Autocomplete = prompts.Autocomplete

type FormBuilder = form.Builder
type FormResponses = form.Responses
type FormStep = form.Step
type FormStepFunc = form.StepFunc
type FormConditionFunc = form.ConditionFunc

var Form = form.New
var FormBool = form.Bool
var ErrFormReverted = form.ErrReverted

type NoteType = output.NoteType
type TableRow = output.TableRow
type DataTableRow = output.DataTableRow
type DataTableOptions = output.DataTableOptions
type NotificationCommand = output.NotificationCommand
type NotificationRuntime = output.NotificationRuntime

const (
	NoteAlert   = output.NoteAlert
	NoteError   = output.NoteError
	NoteInfo    = output.NoteInfo
	NoteIntro   = output.NoteIntro
	NoteOutro   = output.NoteOutro
	NoteWarning = output.NoteWarning
)

var Alert = output.Alert
var Clear = output.Clear
var DataTable = output.DataTable
var Error = output.Error
var Grid = output.Grid
var Info = output.Info
var Intro = output.Intro
var Note = output.Note
var NotifyForPlatform = output.NotifyForPlatform
var NotificationCommandFor = output.NotificationCommandFor
var NotificationCommands = output.NotificationCommands
var Outro = output.Outro
var Table = output.Table
var TableObjects = output.TableObjects
var Title = output.Title
var Warning = output.Warning

type Progress = status.Progress
type Stream = status.Stream
type Logger = status.Logger

var NewProgress = status.NewProgress
var RunProgress = status.RunProgress[string, string]
var Spin = status.Spin[any]
var NewStream = status.NewStream
var Task = status.Task[any]

type AnsiSegment = textutil.AnsiSegment

var VisibleWidth = textutil.VisibleWidth
var Truncate = textutil.Truncate
var ParseAnsiSegments = textutil.ParseAnsiSegments
var ParseAnsiText = textutil.ParseAnsiText
var Wrap = textutil.Wrap

type TerminalSize = terminal.Size
type TerminalColor = terminal.Color

var DefaultTerminalSize = terminal.DefaultSize
var ClearTerminalSequence = terminal.ClearSequence
var TerminalTitleSequence = terminal.TitleSequence
var EraseLineSequence = terminal.EraseLineSequence
var ErasePreviousLinesSequence = terminal.ErasePreviousLinesSequence
var CursorToStartSequence = terminal.CursorToStartSequence
var HideCursorSequence = terminal.HideCursorSequence
var ShowCursorSequence = terminal.ShowCursorSequence
var SupportsTrueColor = terminal.SupportsTrueColor
var DefaultForegroundColor = terminal.DefaultForegroundColor
var DefaultBackgroundColor = terminal.DefaultBackgroundColor
var ParseTerminalColor = terminal.ParseColor

type TypedValueState = typedvalue.State
type AppliedKey = typedvalue.AppliedKey

var InitialTypedValueState = typedvalue.InitialState
var ApplyTypedKey = typedvalue.ApplyKey
var TypedValueCharacters = typedvalue.Characters
var TypedValueFromCharacters = typedvalue.FromCharacters
var TypedValueCharacterLength = typedvalue.CharacterLength
