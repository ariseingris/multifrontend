"""Seeded plausible pond demo, not a calibrated or scientifically validated model.

Minute-grid integration makes results independent of playback speed/sample cadence.
Shared daylight/weather drive thermal inertia, biology and gas exchange. Smooth
seeded variations are correlated in time; there is no short-period sensor sine.
Only 128 recent integration states are retained; old diagnostic queries replay.
"""
import math


class PondEnvironment:
    def __init__(self, seed):
        self.seed = int(seed)
        self._states = {0: (28.0, 7.9, 6.3)}
        self._minute = 0

    def variation(self, key, seconds, period):
        position = max(0, seconds) / period
        index = int(position)
        fraction = position - index
        fraction = fraction * fraction * (3 - 2 * fraction)
        def value(i):
            number = (self.seed + key * 374761393 + i * 668265263) & 0xffffffff
            number = ((number ^ (number >> 13)) * 1274126177) & 0xffffffff
            return ((number ^ (number >> 16)) / 0xffffffff) * 2 - 1
        return value(index) * (1 - fraction) + value(index + 1) * fraction

    def _step(self, minute, previous):
        seconds = minute * 60
        # Start at 04:00; daily forcing with multi-hour non-periodic weather.
        daylight = math.sin(2 * math.pi * (seconds / 86400 + 4 / 24 - .25))
        weather = self.variation(1, seconds, 6 * 3600)
        ambient = 28.2 + 1.6 * daylight + .6 * weather
        temperature, ph, oxygen = previous
        temperature += (ambient - temperature) * (1 - math.exp(-1 / 180))
        ph_target = 7.95 + .16 * daylight + .025 * (temperature - 28) + .025 * weather
        ph += (ph_target - ph) * (1 - math.exp(-1 / 75))
        oxygen_target = 6.25 + .55 * daylight - .11 * (temperature - 28) + .08 * weather
        oxygen += (oxygen_target - oxygen) * (1 - math.exp(-1 / 65))
        return temperature, ph, oxygen

    def at(self, seconds):
        position = max(0, seconds) / 60
        minute = int(position)
        if minute not in self._states and minute < self._minute:
            self._states = {0: (28.0, 7.9, 6.3)}
            self._minute = 0
        while self._minute < minute + 1:
            self._minute += 1
            self._states[self._minute] = self._step(self._minute, self._states[self._minute - 1])
            if len(self._states) > 128:
                del self._states[min(self._states)]
        fraction = position - minute
        values = [a + (b - a) * fraction for a, b in zip(self._states[minute], self._states[minute + 1])]
        return {
            'water_temperature_c': values[0] + .018 * self.variation(2, seconds, 900),
            'ph': values[1] + .003 * self.variation(3, seconds, 1200),
            'do_mg_l': values[2] + .018 * self.variation(4, seconds, 180),
        }
