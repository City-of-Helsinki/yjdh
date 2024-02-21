#!/usr/bin/env bash

# Make bash the only shell
# The reason for this is that commands are still run
# with sh even if shell is set for the user.
# TODO: Find a way to not have to remove /bin/sh
rm /bin/sh && ln -s /bin/bash /bin/sh




