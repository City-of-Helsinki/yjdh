from django.dispatch import Signal

# Sent when a successful personal info query is made to VTJ
# (Population Information System)
vtj_queried = Signal()

# Sent when a personal info query to VTJ fails
vtj_query_failed = Signal()
