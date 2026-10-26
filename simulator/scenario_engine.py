"""Shared monotonic playback clock. Durations and elapsed are always seconds."""
import time
from abc import ABC, abstractmethod
from typing import Dict, Any, List


class ScenarioSimulator(ABC):
    def __init__(self, scenario_config: Dict[str, Any], speed: float = 1.0):
        self.config = scenario_config
        self._speed = speed
        self.elapsed = 0.0
        self.real_elapsed = 0.0
        self.is_running = False
        self.is_paused = False
        self._last_tick = time.monotonic()

    @property
    def speed(self):
        return self._speed

    @speed.setter
    def speed(self, value):
        self.update()  # Account for time already spent at the previous speed.
        self._speed = value

    def update(self):
        now = time.monotonic()
        if self.is_running and not self.is_paused:
            delta = max(0, now - self._last_tick)
            self.real_elapsed += delta
            advanced = self.elapsed + delta * self._speed
            self.elapsed = advanced if self.config.get('continuous') else min(self.config['duration'], advanced)
        self._last_tick = now

    def pause(self):
        self.update()
        self.is_paused = True

    def resume(self):
        self._last_tick = time.monotonic()
        self.is_paused = False

    def reset(self):
        self.elapsed = 0.0
        self.real_elapsed = 0.0
        self._last_tick = time.monotonic()
        self.is_running = False
        self.is_paused = False

    @abstractmethod
    def get_metrics(self) -> Dict[str, float]: ...

    @abstractmethod
    def get_current_phase(self) -> str: ...

    @abstractmethod
    def get_status(self) -> str: ...

    @abstractmethod
    def get_alerts(self) -> List[Any]: ...
