"""Bounded archive of actual emitted measurements, preserving session origin."""
HISTORY_PROJECTS = frozenset({'aquasense', 'factsafe'})
HISTORY_BUCKET_SECONDS = 10
MAX_HISTORY = 1000


def append_history(points, packet):
    result = list(points)
    bucket_seconds = packet.get('historyBucketSeconds', HISTORY_BUCKET_SECONDS)
    retention = packet.get('historyRetentionSeconds')
    bucket = packet['elapsedSimSeconds'] // bucket_seconds
    if len(result) > 1 and result[-1]['elapsedSimSeconds'] // bucket_seconds == bucket:
        result[-1] = packet
    else:
        result.append(packet)
    if retention:
        cutoff = packet['elapsedSimSeconds'] - retention
        return [point for point in result if point['elapsedSimSeconds'] >= cutoff][-packet.get('historyMaxPoints', MAX_HISTORY):]
    if len(result) > MAX_HISTORY:
        result = result[:1] + result[1:-1:2] + result[-1:]
    return result
