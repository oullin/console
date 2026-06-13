package prompt

import (
	"errors"
	"reflect"

	"github.com/oullin/tui/internal/environment"
)

type Required struct {
	Enabled bool
	Message string
}

type Validator[T any] func(T) (string, error)

func RequiredMessage(value any, required Required) string {
	if !required.Enabled || !isInvalidRequiredValue(value) {
		return ""
	}

	if required.Message != "" {
		return required.Message
	}

	return "Required."
}

func ValidationMessage[T any](value T, validator Validator[T]) (string, error) {
	if validator == nil {
		return "", nil
	}

	message, err := validator(value)
	if err != nil {
		return "", err
	}

	return message, nil
}

func EnsureValid[T any](value T, required Required, validator Validator[T]) error {
	if message := RequiredMessage(value, required); message != "" {
		return environment.PromptValidationError{Message: message}
	}

	message, err := ValidationMessage(value, validator)
	if err != nil {
		return err
	}
	if message != "" {
		return environment.PromptValidationError{Message: message}
	}

	return nil
}

func isInvalidRequiredValue(value any) bool {
	if value == nil {
		return true
	}

	switch typed := value.(type) {
	case string:
		return typed == ""
	case bool:
		return !typed
	}

	reflected := reflect.ValueOf(value)
	switch reflected.Kind() {
	case reflect.Slice, reflect.Array:
		return reflected.Len() == 0
	default:
		return false
	}
}

func ValidationError(message string) error {
	return environment.PromptValidationError{Message: message}
}

func IsValidationError(err error) (string, bool) {
	var validation environment.PromptValidationError
	if ok := errors.As(err, &validation); ok {
		return validation.Message, true
	}

	return "", false
}
