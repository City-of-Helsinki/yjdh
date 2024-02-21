#!/usr/bin/env bash

existing_group=$(getent group 1000 | cut -d: -f1)
if [[ -z "${existing_group}" ]]; then
    # Create appuser group
   groupadd --gid 1000 appuser
elif [[ "${existing_group}" != "appuser" ]]; then
   # Change group name to appuser
   groupmod -n appuser "${existing_group}"
fi


existing_user=$(id -nu 1000 2>/dev/null)
if [[ -z "${existing_user}" ]]; then
    # Add an application user
    useradd --uid 1000 --gid appuser --create-home --shell /bin/bash appuser
else
    # Change user name to appuser
    usermod -l appuser "${existing_user}"

    # Add user to appuser group
    gpasswd -a appuser appuser
fi
