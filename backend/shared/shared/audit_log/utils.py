def get_remote_address(request):
    forwarded_for = request.headers.get("x-forwarded-for", "")
    client_ip = forwarded_for.split(",")[0] or None

    if not client_ip:
        client_ip = request.META.get("REMOTE_ADDR")

    if client_ip:
        # Strip port from ip address if present
        if "[" in client_ip:
            # Bracketed IPv6 like [2001:db8::1]:1234
            client_ip = client_ip.lstrip("[").split("]")[0]
        elif "." in client_ip and client_ip.count(":") == 1:
            # IPv4 with port
            client_ip = client_ip.split(":")[0]
    return client_ip
