from datetime import datetime, time, timedelta, timezone
import re


_TIME_RANGE = re.compile(r"^(\d{2}):(\d{2})-(\d{2}):(\d{2})$")
APPOINTMENT_DURATION = timedelta(minutes=30)


def normalize_to_utc(value: datetime) -> datetime:
    """Return a timezone-naive UTC datetime for the database's DateTime column."""
    if value.tzinfo is None:
        return value
    return value.astimezone(timezone.utc).replace(tzinfo=None)


def utc_now_naive() -> datetime:
    """Return the current UTC time in the naive form used by the database."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def is_in_the_past(value: datetime) -> bool:
    return normalize_to_utc(value) <= utc_now_naive()


def time_overlaps(first_start: datetime, second_start: datetime) -> bool:
    """Treat each appointment as a 30-minute window and test for overlap."""
    first_end = first_start + APPOINTMENT_DURATION
    second_end = second_start + APPOINTMENT_DURATION
    return first_start < second_end and second_start < first_end


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
