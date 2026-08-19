from datetime import datetime, time
import re


_TIME_RANGE = re.compile(r"^(\d{2}):(\d{2})-(\d{2}):(\d{2})$")


def parse_time_ranges(value: str | None, field_name: str) -> list[tuple[time, time]]:
    if value is None or not value.strip():
        return []

    ranges = []
    for raw_range in value.split(","):
        match = _TIME_RANGE.fullmatch(raw_range.strip())
        if match is None:
            raise ValueError(f"Invalid {field_name} format. Use HH:MM-HH:MM.")
        start_hour, start_minute, end_hour, end_minute = map(int, match.groups())
        try:
            start = time(start_hour, start_minute)
            end = time(end_hour, end_minute)
        except ValueError as exc:
            raise ValueError(f"Invalid {field_name} format. Use HH:MM-HH:MM.") from exc
        if start >= end:
            raise ValueError(f"Invalid {field_name} format. Start time must be before end time.")
        ranges.append((start, end))
    return ranges


def is_within_ranges(value: datetime, ranges: list[tuple[time, time]]) -> bool:
    appointment_time = value.time().replace(second=0, microsecond=0)
    return any(start <= appointment_time < end for start, end in ranges)
