package form

import "fmt"

func PreviousString(previous any, defaultValue string) string {
	value, ok := previous.(string)
	if !ok {
		return defaultValue
	}

	return value
}

func PreviousNumber(previous any, defaultValue string) string {
	switch value := previous.(type) {
	case nil:
		return defaultValue
	case string:
		return value
	case int:
		return fmt.Sprint(value)
	case int64:
		return fmt.Sprint(value)
	case float64:
		return fmt.Sprint(value)
	default:
		return defaultValue
	}
}

func PreviousBool(previous any, defaultValue bool) bool {
	value, ok := previous.(bool)
	if !ok {
		return defaultValue
	}

	return value
}

func PreviousSlice(previous any, defaultValue []any) []any {
	value, ok := previous.([]any)
	if !ok {
		return append([]any{}, defaultValue...)
	}

	return append([]any{}, value...)
}

func PreviousValue(previous any, defaultValue any) any {
	if previous == nil {
		return defaultValue
	}

	return previous
}
