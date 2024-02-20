#!/usr/bin/env bash

if [[ ! -z "$@" ]]; then
    apt-get remove -y "$@"
fi

apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false
rm -rf /var/lib/apt/lists/*
rm -rf /var/cache/apt/archives
