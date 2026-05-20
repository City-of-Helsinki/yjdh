from django.dispatch import Signal

# Sent when a successful mandate query is made to Suomi.fi Valtuudet (eAuthorizations)
suomifi_mandate_queried = Signal()

# Sent when a mandate query to Suomi.fi Valtuudet fails
suomifi_mandate_query_failed = Signal()
