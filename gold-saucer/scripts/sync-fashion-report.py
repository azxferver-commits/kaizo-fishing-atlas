#!/usr/bin/env python3
"""Synchronize the latest Fashion Report into the static Gold Saucer site."""

from __future__ import annotations

import json
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


SOURCE_URL = (
    "https://raw.githubusercontent.com/"
    "KevinAllenWiegand/ffxiv-fashion-report-v2/main/public/master.json"
)
SITE_ROOT = Path(__file__).resolve().parents[1]
OUTPUT = SITE_ROOT / "data" / "fashion-report.json"


def normalize(value: object) -> str:
    return " ".join(str(value or "").strip().lower().replace("’", "'").split())


def download_master() -> dict:
    request = urllib.request.Request(
        SOURCE_URL,
        headers={"User-Agent": "KAIZO-Gold-Saucer-Weekly-Sync/1.0"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def build_latest(master: dict) -> dict:
    reports = master.get("reports")
    if not isinstance(reports, list) or not reports:
        raise ValueError("The source contains no Fashion Report weeks")

    latest = max(reports, key=lambda report: str(report.get("date", "")))
    if not latest.get("date") or not latest.get("theme"):
        raise ValueError("The newest Fashion Report is incomplete")

    slot_database = master.get("slots") if isinstance(master.get("slots"), list) else []
    output_slots = []
    for slot in latest.get("slots", []):
        match = next(
            (
                candidate
                for candidate in slot_database
                if normalize(candidate.get("type")) == normalize(slot.get("type"))
                and normalize(candidate.get("hint")) == normalize(slot.get("hint"))
            ),
            None,
        )
        item_names = []
        for item in (match or {}).get("items", []):
            name = item if isinstance(item, str) else item.get("name")
            if name:
                item_names.append(name)
        output_slots.append(
            {
                "type": slot.get("type", "Unknown"),
                "hint": slot.get("hint", "Unknown"),
                "items": item_names,
            }
        )

    return {
        "week": latest.get("week"),
        "date": latest["date"],
        "theme": latest["theme"],
        "updatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "source": "Sincronización automática",
        "sourceUrl": "https://github.com/KevinAllenWiegand/ffxiv-fashion-report-v2",
        "slots": output_slots,
    }


def comparable(data: dict) -> dict:
    return {
        key: data.get(key)
        for key in ("week", "date", "theme", "source", "sourceUrl", "slots")
    }


def main() -> int:
    try:
        latest = build_latest(download_master())
    except Exception as exc:  # Keep the last known-good file if the source is unavailable.
        if OUTPUT.exists():
            print(f"Fashion source unavailable; keeping the current backup: {exc}")
            return 0
        raise

    current = {}
    if OUTPUT.exists():
        try:
            current = json.loads(OUTPUT.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            current = {}

    if comparable(current) == comparable(latest):
        print(f"Fashion Report is already current: week {latest['week']}")
        return 0

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        json.dumps(latest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Fashion Report updated to week {latest['week']} ({latest['date']})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
